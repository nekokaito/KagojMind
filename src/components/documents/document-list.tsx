"use client";

import { useLanguage } from "@/components/i18n/language-provider";

import Link from "next/link";
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

function formatFileSize(size: number | null, unknownSizeLabel: string) {
  if (!size) {
    return unknownSizeLabel;
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

function StatusBadge({ status, t }: { status: Document["status"]; t: (key: import("@/lib/i18n/translations").TranslationKey) => string }) {
  switch (status) {
    case "processing":
      return (
        <Badge variant="secondary" className="gap-1.5">
          <Loader2 className="size-3 animate-spin" />
          {t("documents.processing")}
        </Badge>
      );

    case "ready":
      return <Badge>{t("documents.ready")}</Badge>;

    case "error":
      return <Badge variant="destructive">{t("documents.error")}</Badge>;
  }
}

export function DocumentList({ documents }: DocumentListProps) {
  const { t } = useLanguage();
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

        <h3 className="font-medium">{t("documents.noDocumentsYet")}</h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {t("documents.noDocumentsDescriptionLong")}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map((document) => {
        const isClickable = document.status === "ready";

        const content = (
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

                <span>{formatFileSize(document.file_size, t("documents.unknownSize"))}</span>

                {document.page_count && (
                  <>
                    <span>·</span>

                    <span>
                      {document.page_count}{" "}
                      {document.page_count === 1 ? t("documents.page") : t("documents.pages")}
                    </span>
                  </>
                )}
              </div>
            </div>

            <StatusBadge status={document.status} t={t} />
          </div>
        );

        if (!isClickable) {
          return (
            <Card key={document.id} className="p-4">
              {content}
            </Card>
          );
        }

        return (
          <Link
            key={document.id}
            href={`/documents/${document.id}`}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="p-4 transition-all hover:-translate-y-0.5 hover:bg-muted/30 hover:shadow-sm">
              {content}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
