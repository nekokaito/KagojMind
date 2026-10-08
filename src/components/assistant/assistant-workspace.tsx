"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Bot,
  Check,
  ChevronDown,
  Clipboard,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Document = {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  page_count: number | null;
  status: "processing" | "ready" | "error";
  updated_at: string;
};

type Source = {
  chunkId: string;
  page: number | null;
  chunkIndex: number;
  similarity: number;
  preview: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

type ChatResponse = {
  success: boolean;
  conversationId?: string;
  answer?: string;
  sources?: Source[];
  error?: string;
  errorType?: "AI_BUSY";
};

type AssistantWorkspaceProps = {
  documents: Document[];
};

export function AssistantWorkspace({ documents }: AssistantWorkspaceProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    documents[0]?.id ?? "",
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedDocumentId),
    [documents, selectedDocumentId],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function handleDocumentChange(documentId: string) {
    setSelectedDocumentId(documentId);
    setMessages([]);
    setConversationId(null);
    setError(null);
  }

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || !selectedDocumentId || isLoading) {
      return;
    }

    setError(null);
    setQuestion("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          question: trimmedQuestion,
          conversationId,
        }),
      });

      const data = (await response.json()) as ChatResponse;

      if (data.errorType === "AI_BUSY" && data.answer) {
        const answer = data.answer;

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: answer,
            sources: [],
          },
        ]);

        setIsLoading(false);
        return;
      }

      if (!response.ok || !data.success || !data.answer) {
        throw new Error(
          data.error ?? "Something went wrong while generating the answer.",
        );
      }
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        sources: data.sources ?? [],
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("Assistant error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to generate an answer.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(message: Message) {
    await navigator.clipboard.writeText(message.content);

    setCopiedMessageId(message.id);

    window.setTimeout(() => {
      setCopiedMessageId(null);
    }, 1500);
  }

  function useSuggestedQuestion(value: string) {
    setQuestion(value);
  }

  if (documents.length === 0) {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>

            <div>
              <h1 className="text-sm font-semibold">AI Assistant</h1>
              <p className="text-xs text-muted-foreground">
                Ask questions about your documents
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border bg-muted/40">
              <FileText className="size-6 text-muted-foreground" />
            </div>

            <h2 className="text-xl font-semibold tracking-tight">
              No documents ready yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload and process a PDF or DOCX document first. Once it is ready,
              you can ask KagojMind questions about it.
            </p>

            <Button className="mt-6" asChild>
              <a href="/documents">
                <FileText className="mr-2 size-4" />
                Go to Documents
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm font-semibold">AI Assistant</h1>

            <p className="hidden text-xs text-muted-foreground sm:block">
              Ask questions and explore your documents
            </p>
          </div>
        </div>

        {/* Document selector */}
        <div className="relative">
          <select
            value={selectedDocumentId}
            onChange={(event) => handleDocumentChange(event.target.value)}
            className="h-9 max-w-[190px] appearance-none rounded-lg border bg-background py-1 pl-3 pr-8 text-sm font-medium outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 sm:max-w-[280px]"
            aria-label="Select document"
          >
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
          {/* Document context */}
          {selectedDocument && (
            <div className="flex items-center gap-3 py-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                <FileText className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {selectedDocument.title}
                </p>

                <p className="text-xs text-muted-foreground">
                  {selectedDocument.page_count
                    ? `${selectedDocument.page_count} pages`
                    : "Document"}{" "}
                  · Ready for questions
                </p>
              </div>

              <Badge
                variant="secondary"
                className="hidden shrink-0 sm:inline-flex"
              >
                Ready
              </Badge>
            </div>
          )}

          <Separator />

          {/* Chat */}
          <div className="flex flex-1 flex-col">
            {messages.length === 0 ? (
              <EmptyState onSuggestion={useSuggestedQuestion} />
            ) : (
              <div className="flex-1 space-y-8 py-8">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onCopy={handleCopy}
                    copied={copiedMessageId === message.id}
                  />
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                      <Bot className="size-4" />
                    </div>

                    <div className="rounded-2xl border bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Reading your document...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Composer */}
          <div className="sticky bottom-0 pb-5 pt-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border bg-background p-2 shadow-sm transition-shadow focus-within:shadow-md"
            >
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder={
                  selectedDocument
                    ? `Ask about ${selectedDocument.title}...`
                    : "Ask a question..."
                }
                disabled={isLoading}
                rows={2}
                maxLength={2000}
                className="max-h-32 min-h-12 w-full resize-none border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="flex items-center justify-between px-2 pb-1">
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Enter to send · Shift + Enter for a new line
                </p>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!question.trim() || isLoading}
                  className="ml-auto size-9 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}

                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </form>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              KagojMind answers using the selected document.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({
  onSuggestion,
}: {
  onSuggestion: (question: string) => void;
}) {
  const suggestions = [
    "What is the main purpose of this document?",
    "Summarize the key findings.",
    "What are the most important conclusions?",
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-6" />
      </div>

      <h2 className="text-center text-2xl font-semibold tracking-tight">
        Ask your document anything
      </h2>

      <p className="mt-2 max-w-md text-center text-sm leading-6 text-muted-foreground">
        KagojMind searches your document and uses the relevant sections to
        generate an answer with sources.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion(suggestion)}
            className="rounded-xl border bg-background p-4 text-left text-sm transition-colors hover:bg-muted/50"
          >
            <MessageSquare className="mb-3 size-4 text-muted-foreground" />

            <span className="leading-5">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  copied,
}: {
  message: Message;
  onCopy: (message: Message) => void;
  copied: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
          <Bot className="size-4" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground"
              : "rounded-2xl rounded-bl-md border bg-muted/30 px-4 py-3 text-sm"
          }
        >
          <p className="whitespace-pre-wrap leading-7">{message.content}</p>
        </div>

        {!isUser && (
          <div className="mt-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => void onCopy(message)}
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Clipboard className="mr-1.5 size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceList sources={message.sources} />
        )}
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
}

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Sources</p>

      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <div
            key={source.chunkId}
            className="group flex max-w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/40"
            title={source.preview}
          >
            <div className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-semibold">
              {index + 1}
            </div>

            <span className="font-medium">
              {source.page
                ? `Page ${source.page}`
                : `Section ${source.chunkIndex + 1}`}
            </span>

            <span className="text-muted-foreground">
              {Math.round(source.similarity * 100)}% match
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
