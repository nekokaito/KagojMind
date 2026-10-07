"use client";

import { useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Document = {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  page_count: number | null;
  status: "processing" | "ready" | "error";
  created_at: string;
};

type DocumentListProps = {
  documents: Document[];
};

function formatFileSize(size: number | null) {
  if (!size) {
    return "Unknown size";
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileType(fileType: string) {
  if (fileType === "application/pdf") {
    return "PDF";
  }

  return "DOCX";
}

function StatusBadge({ status }: { status: Document["status"] }) {
  switch (status) {
    case "processing":
      return (
        <Badge variant="secondary" className="gap-1.5">
          <Loader2 className="size-3 animate-spin" />
          Processing
        </Badge>
      );

    case "ready":
      return <Badge>Ready</Badge>;

    case "error":
      return <Badge variant="destructive">Error</Badge>;
  }
}

export function DocumentList({ documents }: DocumentListProps) {
  const router = useRouter();

  const hasProcessingDocuments = documents.some(
    (document) => document.status === "processing",
  );

  useEffect(() => {
    if (!hasProcessingDocuments) {
      return;
    }

    const interval = window.setInterval(() => {
      router.refresh();
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, [hasProcessingDocuments, router]);

  if (documents.length === 0) {
    return (
      <Card className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
          <FileText className="size-5" />
        </div>

        <h3 className="font-medium">No documents yet</h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Upload your first PDF or DOCX document to start building your
          knowledge base.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map((document) => (
        <Card
          key={document.id}
          className="p-4 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <FileText className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{document.title}</p>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {document.file_name}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{getFileType(document.file_type)}</span>

                <span>·</span>

                <span>{formatFileSize(document.file_size)}</span>

                {document.page_count && (
                  <>
                    <span>·</span>

                    <span>
                      {document.page_count}{" "}
                      {document.page_count === 1 ? "page" : "pages"}
                    </span>
                  </>
                )}
              </div>
            </div>

            <StatusBadge status={document.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}
