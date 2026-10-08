import { NextResponse } from "next/server";

import { gemini } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const GENERATION_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

type SummaryResult = {
  overview: string;
  keyPoints: string[];
  importantDates: string[];
  entities: string[];
};

function extractGeminiText(response: {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}) {
  return (
    response.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

function cleanJsonResponse(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

class GeminiBusyError extends Error {
  constructor() {
    super("Gemini is temporarily experiencing high demand.");
    this.name = "GeminiBusyError";
  }
}

function isTemporaryGeminiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("temporarily unavailable")
  );
}

async function generateSummary(prompt: string) {
  let lastError: unknown;
  let hadTemporaryAvailabilityError = false;

  for (const model of GENERATION_MODELS) {
    try {
      console.log(`Trying Gemini summary model: ${model}`);

      const response = await gemini.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 1500,
        },
      });

      const text = extractGeminiText(response);

      if (!text) {
        throw new Error(`Gemini returned an empty summary from ${model}.`);
      }

      console.log(`Gemini summary succeeded with ${model}`);

      return text;
    } catch (error) {
      lastError = error;

      const message = error instanceof Error ? error.message : String(error);

      console.error(`Gemini summary failed with ${model}:`, message);

      if (isTemporaryGeminiError(error)) {
        hadTemporaryAvailabilityError = true;
        continue;
      }

      throw error;
    }
  }

  if (hadTemporaryAvailabilityError) {
    throw new GeminiBusyError();
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All Gemini summary models are currently unavailable.");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, title, status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }

    if (document.status !== "ready") {
      return NextResponse.json(
        {
          error: "This document is not ready for summarization.",
        },
        { status: 409 },
      );
    }

    const { data: chunks, error: chunksError } = await supabase
      .from("document_chunks")
      .select("content, page_number, chunk_index")
      .eq("document_id", id)
      .order("chunk_index", {
        ascending: true,
      });

    if (chunksError) {
      console.error("Failed to load document chunks:", chunksError);

      return NextResponse.json(
        {
          error: "Failed to load document content.",
        },
        { status: 500 },
      );
    }

    if (!chunks?.length) {
      return NextResponse.json(
        {
          error: "This document does not contain any extracted text.",
        },
        { status: 400 },
      );
    }

    const MAX_CONTEXT_LENGTH = 40_000;

    let documentText = "";

    for (const chunk of chunks) {
      const page = chunk.page_number
        ? `[Page ${chunk.page_number}]`
        : "[Page unknown]";

      const section = `${page}\n${chunk.content}\n\n`;

      if (documentText.length + section.length > MAX_CONTEXT_LENGTH) {
        break;
      }

      documentText += section;
    }

    const prompt = `You are KagojMind, an AI document intelligence assistant.

Create a concise but useful summary of the document below.

Return ONLY valid JSON with this exact structure:

{
  "overview": "A concise 2-4 sentence overview of the document.",
  "keyPoints": [
    "Important point 1",
    "Important point 2",
    "Important point 3"
  ],
  "importantDates": [
    "Date and what it refers to"
  ],
  "entities": [
    "Important person, organization, place, product, or other named entity"
  ]
}

Rules:
- Use ONLY information contained in the document.
- Do not invent facts.
- Keep the overview concise.
- Provide 3-7 key points.
- Include important dates only when they are explicitly present.
- Include important named entities only when they are explicitly present.
- If there are no important dates, return an empty array.
- If there are no important entities, return an empty array.
- Do not use markdown.
- Return valid JSON only.

DOCUMENT:
${documentText}`;

    const text = await generateSummary(prompt);

    let summary: SummaryResult;

    try {
      summary = JSON.parse(cleanJsonResponse(text)) as SummaryResult;
    } catch (error) {
      console.error("Failed to parse Gemini summary:", error);

      console.error("Gemini response:", text);

      throw new Error("AI returned an invalid summary.");
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Summary API error:", error);

    if (error instanceof GeminiBusyError) {
      return NextResponse.json(
        {
          success: false,
          errorType: "AI_BUSY",
          error:
            "I'm a little busy right now ✨\n\nAI is experiencing unusually high demand at the moment. Your document is safe and ready — please try again in a little while.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the summary.",
      },
      { status: 500 },
    );
  }
}
