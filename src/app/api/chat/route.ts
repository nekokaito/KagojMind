import { NextResponse } from "next/server";

import { gemini } from "@/lib/ai/gemini";
import { embedQuery } from "@/lib/ai/embeddings";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const GENERATION_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

const MATCH_COUNT = 5;
const MIN_SIMILARITY = 0.35;

type ChatRequest = {
  documentId: string;
  question: string;
  conversationId?: string;
};

type RetrievedChunk = {
  id: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  similarity: number;
};

/**
 * Build the document context that will be sent to Gemini.
 */
function buildContext(chunks: RetrievedChunk[]) {
  return chunks
    .map((chunk, index) => {
      const page = chunk.page_number
        ? `Page ${chunk.page_number}`
        : "Page unknown";

      return [`[Source ${index + 1} | ${page}]`, chunk.content].join("\n");
    })
    .join("\n\n---\n\n");
}

/**
 * Build a strict RAG prompt.
 */
function buildPrompt(question: string, context: string) {
  return `You are KagojMind, an AI document assistant.

Answer the user's question using ONLY the provided document context.

Rules:
- Do not use outside knowledge.
- Do not invent facts.
- If the context does not contain enough information, say that the answer cannot be determined from the document.
- Give a clear and concise answer.
- When useful, mention the relevant page number naturally.
- Do not mention "context", "chunks", embeddings, vector search, or internal implementation details.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}`;
}

/**
 * Extract generated text from the Gemini response.
 *
 * We don't use response.text here because the current SDK response
 * can expose the generated content through candidates/content/parts.
 */
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

class GeminiBusyError extends Error {
  constructor() {
    super("Gemini is temporarily experiencing high demand.");
    this.name = "GeminiBusyError";
  }
}

async function generateAnswer(prompt: string) {
  let lastError: unknown;
  let hadTemporaryAvailabilityError = false;

  for (const model of GENERATION_MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);

      const response = await gemini.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 1000,
        },
      });

      const answer = extractGeminiText(response);

      if (!answer) {
        throw new Error(`Gemini returned an empty response from ${model}.`);
      }

      console.log(`Gemini succeeded with ${model}`);

      return answer;
    } catch (error) {
      lastError = error;

      const message = error instanceof Error ? error.message : String(error);

      console.error(`Gemini failed with ${model}:`, message);

      if (message.includes("503") || message.includes("UNAVAILABLE")) {
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
    : new Error("All Gemini generation models failed.");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    const documentId = body.documentId?.trim();
    const question = body.question?.trim();
    const conversationId = body.conversationId?.trim();

    // --------------------------------------------------
    // Validate request
    // --------------------------------------------------

    if (!documentId || !question) {
      return NextResponse.json(
        {
          error: "documentId and question are required.",
        },
        { status: 400 },
      );
    }

    if (question.length > 2000) {
      return NextResponse.json(
        {
          error: "Question must be 2000 characters or less.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Supabase client
    // --------------------------------------------------

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

    // --------------------------------------------------
    // Verify document ownership
    // --------------------------------------------------

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, title, status")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        {
          error: "Document not found.",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------
    // Verify document processing status
    // --------------------------------------------------

    if (document.status !== "ready") {
      return NextResponse.json(
        {
          error: "This document is not ready for questions yet.",
        },
        { status: 409 },
      );
    }

    // --------------------------------------------------
    // Generate query embedding
    // --------------------------------------------------

    const queryEmbedding = await embedQuery(question);

    // --------------------------------------------------
    // Retrieve relevant document chunks
    // --------------------------------------------------

    const { data: matches, error: searchError } = await supabase.rpc(
      "match_document_chunks",
      {
        p_document_id: documentId,
        p_query_embedding: queryEmbedding,
        p_match_count: MATCH_COUNT,
      },
    );

    if (searchError) {
      console.error("Document search failed:", searchError);

      throw new Error("Failed to search the document.");
    }

    const retrievedChunks = (matches ?? []) as RetrievedChunk[];

    // --------------------------------------------------
    // Filter low-quality matches
    // --------------------------------------------------

    const relevantChunks = retrievedChunks.filter(
      (chunk) => chunk.similarity >= MIN_SIMILARITY,
    );

    // --------------------------------------------------
    // No relevant information
    // --------------------------------------------------

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        success: true,
        answer:
          "I couldn't find enough relevant information in this document to answer that question.",
        sources: [],
        document: {
          id: document.id,
          title: document.title,
        },
      });
    }

    // --------------------------------------------------
    // Build grounded context
    // --------------------------------------------------

    const context = buildContext(relevantChunks);

    const prompt = buildPrompt(question, context);

    // --------------------------------------------------
    // Generate answer with Gemini
    // --------------------------------------------------

    const answer = await generateAnswer(prompt);

    // --------------------------------------------------
    // Create or validate conversation
    // --------------------------------------------------

    let activeConversationId = conversationId;

    if (activeConversationId) {
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", activeConversationId)
        .eq("user_id", user.id)
        .eq("document_id", documentId)
        .single();

      if (conversationError || !conversation) {
        return NextResponse.json(
          {
            error: "Conversation not found.",
          },
          { status: 404 },
        );
      }
    } else {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          document_id: documentId,
        })
        .select("id")
        .single();

      if (error || !conversation) {
        console.error("Failed to create conversation:", error);

        throw new Error("Failed to create conversation.");
      }

      activeConversationId = conversation.id;
    }

    // --------------------------------------------------
    // Save user message
    // --------------------------------------------------

    const { error: userMessageError } = await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: question,
    });

    if (userMessageError) {
      console.error("Failed to save user message:", userMessageError);

      throw new Error("Failed to save user message.");
    }

    // --------------------------------------------------
    // Save assistant message
    // --------------------------------------------------

    const { error: assistantMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        role: "assistant",
        content: answer,
      });

    if (assistantMessageError) {
      console.error("Failed to save assistant message:", assistantMessageError);

      throw new Error("Failed to save assistant message.");
    }

    // --------------------------------------------------
    // Return answer + sources
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      conversationId: activeConversationId,
      answer,
      sources: relevantChunks.map((chunk) => ({
        chunkId: chunk.id,
        page: chunk.page_number,
        chunkIndex: chunk.chunk_index,
        similarity: chunk.similarity,
        preview: chunk.content.slice(0, 180),
      })),
      document: {
        id: document.id,
        title: document.title,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof GeminiBusyError) {
      return NextResponse.json(
        {
          success: false,
          errorType: "AI_BUSY",
          answer:
            "I'm a little busy right now ✨\n\nThere is unusually high demand for AI responses at the moment. Your document is safe and ready — please try again in a little while.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
