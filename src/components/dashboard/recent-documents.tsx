import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Clock,
  FileText,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type DocumentStatus = "processing" | "ready" | "failed" | string;

type RecentDocument = {
  id: string;
  title: string;
  file_name: string | null;
  file_type: string | null;
  status: DocumentStatus;
  created_at: string;
};

function getFileType(file: RecentDocument) {
  const name = file.file_name ?? "";
  const extension = name.split(".").pop()?.toUpperCase();

  if (extension && extension !== name.toUpperCase()) {
    return extension;
  }

  if (file.file_type === "application/pdf") {
    return "PDF";
  }

  if (
    file.file_type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "DOCX";
  }

  return "Document";
}

function getStatus(status: string) {
  switch (status.toLowerCase()) {
    case "ready":
      return {
        label: "Ready",
        variant: "secondary" as const,
      };

    case "processing":
      return {
        label: "Processing",
        variant: "outline" as const,
      };

    case "failed":
      return {
        label: "Failed",
        variant: "destructive" as const,
      };

    default:
      return {
        label: status || "Unknown",
        variant: "outline" as const,
      };
  }
}

export async function RecentDocuments() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, title, file_name, file_type, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Failed to load recent documents:", error);

    return (
      <Card className="shadow-none">
        <div className="p-6">
          <h2 className="font-semibold">Recent documents</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t load your documents. Please try again.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/documents">
              <RefreshCw className="mr-2 size-4" />
              Open documents
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  const recentDocuments = (documents ?? []) as RecentDocument[];

  return (
    <Card className="shadow-none">
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="font-semibold">Recent documents</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your five most recently added documents.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/documents">
            View all
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      {recentDocuments.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-12 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
            <FolderOpen className="size-6 text-muted-foreground" />
          </div>

          <h3 className="font-medium">No documents yet</h3>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Upload your first PDF or DOCX document to start building your
            knowledge workspace.
          </p>

          <Button asChild className="mt-5">
            <Link href="/documents">Upload your first document</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {recentDocuments.map((document) => {
            const status = getStatus(document.status);

            const createdDate = new Date(document.created_at);

            const relativeDate = Number.isNaN(createdDate.getTime())
              ? "Date unavailable"
              : formatDistanceToNow(createdDate, {
                  addSuffix: true,
                });

            return (
              <Link
                key={document.id}
                href={`/documents/${document.id}`}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-4 sm:p-5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {document.title}
                  </p>

                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{getFileType(document)}</span>
                    <span aria-hidden="true">·</span>
                    <Clock className="size-3" />
                    <span>{relativeDate}</span>
                  </p>
                </div>

                <Badge variant={status.variant} className="shrink-0">
                  {status.label}
                </Badge>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
