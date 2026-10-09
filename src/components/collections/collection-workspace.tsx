"use client";

import { useLanguage } from "@/components/i18n/language-provider";

import Link from "next/link";
import { useState } from "react";
import { FileText, Folder, Loader2, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type Document = {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  page_count: number | null;
  status: "processing" | "ready" | "error";
  created_at: string;
  updated_at: string;
};

type CollectionWorkspaceProps = {
  collection: {
    id: string;
    name: string;
    createdAt: string;
  };
  initialDocuments: Document[];
};

type AvailableDocument = {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  page_count: number | null;
  status: "processing" | "ready" | "error";
  created_at: string;
};

export function CollectionWorkspace({
  collection,
  initialDocuments,
}: CollectionWorkspaceProps) {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [availableDocuments, setAvailableDocuments] = useState<
    AvailableDocument[]
  >([]);

  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const [addingDocumentId, setAddingDocumentId] = useState<string | null>(null);

  const [removingDocumentId, setRemovingDocumentId] = useState<string | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);

  async function openAddDocuments() {
    try {
      setIsAddOpen(true);
      setIsLoadingDocuments(true);
      setError(null);

      const response = await fetch(
        `/api/collections/${collection.id}/available-documents`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to load your documents.");
      }

      setAvailableDocuments(data.documents ?? []);
    } catch (error) {
      console.error("Failed to load documents:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load your documents.",
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  async function addDocument(document: AvailableDocument) {
    try {
      setAddingDocumentId(document.id);
      setError(null);

      const response = await fetch(
        `/api/collections/${collection.id}/documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: document.id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to add document.");
      }

      const addedDocument: Document = {
        id: document.id,
        title: document.title,
        file_name: document.file_name,
        file_type: document.file_type,
        file_size: document.file_size,
        page_count: document.page_count,
        status: document.status,
        created_at: document.created_at,
        updated_at: document.created_at,
      };

      setDocuments((current) => [addedDocument, ...current]);

      setAvailableDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
    } catch (error) {
      console.error("Add document failed:", error);

      setError(
        error instanceof Error ? error.message : "Failed to add document.",
      );
    } finally {
      setAddingDocumentId(null);
    }
  }

  async function removeDocument(documentId: string) {
    try {
      setRemovingDocumentId(documentId);
      setError(null);

      const response = await fetch(
        `/api/collections/${collection.id}/documents`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to remove document.");
      }

      setDocuments((current) =>
        current.filter((document) => document.id !== documentId),
      );
    } catch (error) {
      console.error("Remove document failed:", error);

      setError(
        error instanceof Error ? error.message : "Failed to remove document.",
      );
    } finally {
      setRemovingDocumentId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <Folder className="size-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {collection.name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {documents.length}{" "}
                {documents.length === 1 ? "document" : "documents"}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            void openAddDocuments();
          }}
        >
          <Plus className="size-4" />
          {t("collections.addDocuments")}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Separator className="my-8" />

      {/* Documents */}
      {documents.length === 0 ? (
        <Card>
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>

            <h2 className="mt-5 font-semibold">{t("collections.emptyCollection")}</h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t("collections.createDescription")}
            </p>

            <Button
              className="mt-6"
              onClick={() => {
                void openAddDocuments();
              }}
            >
              <Plus className="size-4" />
              {t("collections.addDocuments")}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              isRemoving={removingDocumentId === document.id}
              onRemove={() => {
                void removeDocument(document.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Add Documents Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("collections.addDocuments")}</DialogTitle>

            <DialogDescription>
              {t("collections.chooseReady")}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto py-2">
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : availableDocuments.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <FileText className="mx-auto size-6 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  {t("collections.noDocuments")}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("collections.uploadProcessFirst")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center gap-3 rounded-xl border p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {document.title}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {document.file_type.includes("pdf") ? "PDF" : "DOCX"}

                        {document.page_count
                          ? ` • ${document.page_count} pages`
                          : ""}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void addDocument(document);
                      }}
                      disabled={addingDocumentId === document.id}
                    >
                      {addingDocumentId === document.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      {t("collections.add")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
              }}
            >
              {t("collections.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentRow({
  document,
  isRemoving,
  onRemove,
}: {
  document: Document;
  isRemoving: boolean;
  onRemove: () => void;
}) {
  return (
    <Card className="transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-4 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
          <FileText className="size-5" />
        </div>

        <Link href={`/documents/${document.id}`} className="min-w-0 flex-1">
          <p className="truncate font-medium hover:underline">
            {document.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{document.file_type.includes("pdf") ? "PDF" : "DOCX"}</span>

            {document.page_count ? (
              <>
                <span>•</span>

                <span>{document.page_count} pages</span>
              </>
            ) : null}

            <Badge
              variant={document.status === "ready" ? "secondary" : "outline"}
              className="h-5 text-[10px]"
            >
              {document.status}
            </Badge>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${document.title}`}
          onClick={onRemove}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}
