import { NextResponse } from "next/server";

import { embedTexts } from "@/lib/ai/embeddings";

export const runtime = "nodejs";

export async function GET() {
  try {
    const embeddings = await embedTexts([
      "KagojMind is an AI-powered document intelligence platform.",
    ]);

    return NextResponse.json({
      success: true,
      dimensions: embeddings[0]?.length ?? 0,
      preview: embeddings[0]?.slice(0, 5) ?? [],
    });
  } catch (error) {
    console.error("Embedding test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Embedding test failed",
      },
      { status: 500 },
    );
  }
}
