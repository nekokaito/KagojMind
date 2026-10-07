import { NextResponse } from "next/server";

import { gemini } from "@/lib/ai/gemini";

export const runtime = "nodejs";

export async function GET() {
  try {
    const models = [];

    for await (const model of await gemini.models.list()) {
      models.push({
        name: model.name,
        displayName: model.displayName,
        supportedActions: model.supportedActions,
      });
    }

    return NextResponse.json({
      success: true,
      models,
    });
  } catch (error) {
    console.error("Failed to list Gemini models:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list models",
      },
      { status: 500 },
    );
  }
}
