import { NextResponse } from "next/server";

import { gemini } from "@/lib/ai/gemini";
import { embedQuery } from "@/lib/ai/embeddings";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const GENERATION_MODEL = "gemini-3.8-flash";
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

async function generateAnswer(prompt: string) {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await gemini.models.generateContent({
        model: GENERATION_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: 1000,
        },
      });
    } catch (error) {
      const status =
        error && typeof error === "object" && "status" in error
          ? error.status
          : undefined;

      const retryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  throw new Error("Failed to generate answer.");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    const documentId = body.documentId?.trim();
    const question = body.question?.trim();
    const conversationId = body.conversationId?.trim();

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

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify document ownership

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, title, status")
      .eq("id", documentId)
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
          error: "This document is not ready for questions yet.",
        },
        { status: 409 },
      );
    }

    // Generate query embedding

    const queryEmbedding = await embedQuery(question);

    // Retrieve relevant document chunks

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

    const relevantChunks = retrievedChunks.filter(
      (chunk) => chunk.similarity >= MIN_SIMILARITY,
    );

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

    // Build grounded context

    const context = buildContext(relevantChunks);

    const prompt = buildPrompt(question, context);

    // Generate answer with Gemini

    const response = await generateAnswer(prompt);

    const answer = response.text?.trim();

    if (!answer) {
      throw new Error("Gemini returned an empty response.");
    }

    // Create or validate conversation

    let activeConversationId = conversationId;

    if (activeConversationId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", activeConversationId)
        .eq("user_id", user.id)
        .eq("document_id", documentId)
        .single();

      if (!conversation) {
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

    // Save user message

    const { error: userMessageError } = await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: question,
    });

    if (userMessageError) {
      console.error("Failed to save user message:", userMessageError);

      throw new Error("Failed to save user message.");
    }

    // Save assistant message

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

    // Return answer + sources

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

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
