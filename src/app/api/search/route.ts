import { NextResponse } from "next/server";

import { embedQuery } from "@/lib/ai/embeddings";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MATCH_COUNT = 20;
const MIN_SIMILARITY = 0.35;

type SearchRequest = {
  query: string;
};

type SearchMatch = {
  id: string;
  document_id: string;
  document_title: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  similarity: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRequest;

    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json(
        {
          error: "Search query is required.",
        },
        { status: 400 },
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        {
          error: "Search query must be 500 characters or less.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const queryEmbedding = await embedQuery(query);

    const { data: matches, error } = await supabase.rpc(
      "search_document_chunks",
      {
        p_query_embedding: queryEmbedding,
        p_match_count: MATCH_COUNT,
      },
    );

    if (error) {
      console.error("Global search failed:", error);

      return NextResponse.json(
        {
          error: "Failed to search your documents.",
        },
        { status: 500 },
      );
    }

    const results = (matches ?? [])
      .filter((match: SearchMatch) => match.similarity >= MIN_SIMILARITY)
      .map((match: SearchMatch) => ({
        id: match.id,
        documentId: match.document_id,
        documentTitle: match.document_title,
        content: match.content,
        page: match.page_number,
        chunkIndex: match.chunk_index,
        similarity: match.similarity,
      }));

    return NextResponse.json({
      success: true,
      query,
      results,
    });
  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while searching.",
      },
      { status: 500 },
    );
  }
}
