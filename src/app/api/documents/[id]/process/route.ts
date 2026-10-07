import { NextResponse } from "next/server";

import { embedTexts } from "@/lib/ai/embeddings";
import { chunkText } from "@/lib/documents/chunk-text";
import { extractDocxText } from "@/lib/documents/extract-docx";
import { extractPdfText } from "@/lib/documents/extract-pdf";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDF_MIME_TYPE = "application/pdf";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type ExtractedChunk = {
  content: string;
  pageNumber: number | null;
};

type ExtractionResult = {
  chunks: ExtractedChunk[];
  pageCount: number | null;
};

async function extractChunks(
  fileType: string,
  buffer: ArrayBuffer,
): Promise<ExtractionResult> {
  switch (fileType) {
    case PDF_MIME_TYPE: {
      const { pages, pageCount } = await extractPdfText(buffer);

      const chunks = pages.flatMap((pageText, pageIndex) =>
        chunkText(pageText || "").map((content) => ({
          content,
          pageNumber: pageIndex + 1,
        })),
      );

      return {
        chunks,
        pageCount,
      };
    }

    case DOCX_MIME_TYPE: {
      const { text } = await extractDocxText(buffer);

      const chunks = chunkText(text).map((content) => ({
        content,
        pageNumber: null,
      }));

      return {
        chunks,
        pageCount: null,
      };
    }

    default:
      throw new Error("Unsupported document type");
  }
}

export async function POST(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, file_url, file_type, status, processing_started_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (documentError || !document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.status === "ready") {
    return NextResponse.json({
      success: true,
      documentId: id,
      message: "Document is already processed.",
    });
  }

  const { data: claimedDocument, error: claimError } = await supabase
    .from("documents")
    .update({
      status: "processing",
      processing_started_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "processing")
    .is("processing_started_at", null)
    .select("id")
    .maybeSingle();

  if (claimError) {
    console.error("Failed to claim document:", claimError);

    return NextResponse.json(
      { error: "Failed to start document processing" },
      { status: 500 },
    );
  }

  if (!claimedDocument) {
    return NextResponse.json(
      { error: "Document is already being processed" },
      { status: 409 },
    );
  }

  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.file_url);

    if (downloadError || !file) {
      throw new Error(downloadError?.message ?? "Failed to download document");
    }

    const { chunks, pageCount } = await extractChunks(
      document.file_type,
      await file.arrayBuffer(),
    );

    if (chunks.length === 0) {
      throw new Error("No readable text found in document");
    }

    const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));

    const rows = chunks.map((chunk, index) => ({
      content: chunk.content,
      page_number: chunk.pageNumber,
      chunk_index: index,
      embedding: embeddings[index],
    }));

    const { error: replaceError } = await supabase.rpc(
      "replace_document_chunks",
      {
        p_document_id: id,
        p_chunks: rows,
      },
    );

    if (replaceError) {
      throw new Error(replaceError.message);
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        status: "ready",
        page_count: pageCount,
        processing_started_at: null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      documentId: id,
      chunksCreated: chunks.length,
      pageCount,
    });
  } catch (error) {
    console.error("Document processing error:", error);

    const { error: statusError } = await supabase
      .from("documents")
      .update({
        status: "error",
        processing_started_at: null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (statusError) {
      console.error("Failed to mark document as errored:", statusError);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process document",
      },
      { status: 500 },
    );
  }
}
