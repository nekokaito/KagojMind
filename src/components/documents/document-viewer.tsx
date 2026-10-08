"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Download,
  FileText,
  MoreHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type DocumentData = {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number | null;
  page_count: number | null;
  status: "processing" | "ready" | "error";
  created_at: string;
  updated_at: string;
};

type DocumentViewerProps = {
  document: DocumentData;
  signedUrl: string;
};

export function DocumentViewer({ document, signedUrl }: DocumentViewerProps) {
  const router = useRouter();

  const isPdf =
    document.file_type === "application/pdf" ||
    document.file_name.toLowerCase().endsWith(".pdf");

  function handleAskAI() {
    router.push(`/assistant?document=${document.id}`);
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/documents">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to documents</span>
            </Link>
          </Button>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
              <FileText className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">
                {document.title}
              </h1>

              <p className="truncate text-xs text-muted-foreground">
                {document.file_name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Ready
          </Badge>

          <Button variant="outline" size="sm" onClick={handleAskAI}>
            <Bot className="mr-2 size-4" />
            Ask AI
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href={signedUrl}
              download={document.file_name}
              target="_blank"
              rel="noreferrer"
            >
              <Download className="size-4" />
              <span className="sr-only">Download document</span>
            </a>
          </Button>

          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex flex-1">
        {/* Document */}
        <section className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mx-auto flex h-[calc(100svh-7rem)] max-w-5xl overflow-hidden rounded-xl border bg-background shadow-sm">
            {isPdf ? (
              <iframe
                src={`${signedUrl}#toolbar=1&navpanes=0`}
                title={document.title}
                className="h-full w-full border-0"
              />
            ) : (
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-muted/40">
                    <FileText className="size-6 text-muted-foreground" />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold">
                    Preview unavailable
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    DOCX files are supported by KagojMind for AI processing, but
                    browser preview is not available yet.
                  </p>

                  <Button className="mt-5" asChild>
                    <a href={signedUrl} download={document.file_name}>
                      <Download className="mr-2 size-4" />
                      Download document
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Details */}
        <aside className="hidden w-72 shrink-0 border-l bg-background xl:block">
          <div className="p-5">
            <h2 className="text-sm font-semibold">Document details</h2>

            <div className="mt-5 space-y-5">
              <Detail label="File name" value={document.file_name} />

              <Detail
                label="Type"
                value={isPdf ? "PDF document" : "DOCX document"}
              />

              <Detail
                label="Pages"
                value={document.page_count ? `${document.page_count}` : "—"}
              />

              <Detail label="Status" value="Ready" />

              <Detail
                label="Uploaded"
                value={formatDate(document.created_at)}
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
