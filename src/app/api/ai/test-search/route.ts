import { NextResponse } from "next/server";

import { embedTexts } from "@/lib/ai/embeddings";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const question =
      "What is the main purpose of the research described in this paper?";

    const [queryEmbedding] = await embedTexts([question]);

    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("id, title")
      .eq("user_id", user.id)
      .eq("status", "ready")
      .limit(1);

    if (documentsError) {
      throw new Error(documentsError.message);
    }

    const document = documents?.[0];

    if (!document) {
      return NextResponse.json(
        { error: "No ready document found." },
        { status: 404 },
      );
    }

    const { data: matches, error: searchError } = await supabase.rpc(
      "match_document_chunks",
      {
        p_document_id: document.id,
        p_query_embedding: queryEmbedding,
        p_match_count: 5,
      },
    );

    if (searchError) {
      throw new Error(searchError.message);
    }

    return NextResponse.json({
      success: true,
      question,
      document: {
        id: document.id,
        title: document.title,
      },
      matches,
    });
  } catch (error) {
    console.error("Semantic search test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Semantic search failed",
      },
      { status: 500 },
    );
  }
}
