"use client";

import { useLanguage } from "@/components/i18n/language-provider";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toUpperCase() ?? "";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function DocumentUpload() {
  const { t } = useLanguage();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setFile(null);
    setTitle("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFile(selectedFile: File) {
    setError("");

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      const message = t("upload.unsupported");

      setError(message);
      toast.error(t("upload.unsupportedTitle"), {
        description: message,
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      const message = t("upload.fileTooLarge");

      setError(message);
      toast.error(t("upload.fileTooLargeTitle"), {
        description: message,
      });
      return;
    }

    if (selectedFile.size === 0) {
      const message = t("upload.emptyFile");

      setError(message);
      toast.error(t("upload.emptyFileTitle"), {
        description: message,
      });
      return;
    }

    setFile(selectedFile);

    const extension = `.${getFileExtension(selectedFile.name)}`;

    setTitle(
      selectedFile.name.endsWith(extension)
        ? selectedFile.name.slice(0, -extension.length)
        : selectedFile.name,
    );
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  }

  async function handleUpload() {
    if (uploading) return;

    if (!file) {
      const message = t("upload.selectFile");

      setError(message);
      toast.error(t("upload.noFileTitle"), {
        description: message,
      });
      return;
    }

    const documentTitle = title.trim();

    if (!documentTitle) {
      const message = t("upload.enterTitle");

      setError(message);
      toast.error(t("upload.titleRequired"), {
        description: message,
      });
      return;
    }

    if (documentTitle.length > 200) {
      const message = t("upload.titleTooLong");

      setError(message);
      toast.error(t("upload.titleTooLongTitle"), {
        description: message,
      });
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();

    let storagePath: string | null = null;
    let uploaded = false;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(t("upload.sessionExpired"));
      }

      const documentId = crypto.randomUUID();

      storagePath = `${user.id}/${documentId}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      uploaded = true;

      const { error: documentError } = await supabase.from("documents").insert({
        id: documentId,
        user_id: user.id,
        title: documentTitle,
        file_name: file.name,
        file_type: file.type,
        file_url: storagePath,
        file_size: file.size,
        status: "processing",
        processing_started_at: null,
      });

      if (documentError) {
        const { error: cleanupError } = await supabase.storage
          .from("documents")
          .remove([storagePath]);

        if (cleanupError) {
          console.error("Failed to clean up uploaded file:", cleanupError);
        } else {
          uploaded = false;
        }

        throw new Error(documentError.message);
      }

      toast.success(t("upload.uploaded"), {
        description: `"${documentTitle}" is being processed.`,
      });

      setOpen(false);
      reset();
      router.refresh();

      void fetch(`/api/documents/${documentId}/process`, {
        method: "POST",
      })
        .then(async (response) => {
          if (!response.ok) {
            const data = await response.json().catch(() => null);

            throw new Error(
              data?.error ?? t("upload.processingStartedError"),
            );
          }

          router.refresh();
        })
        .catch((processingError: unknown) => {
          console.error(
            "Failed to start document processing:",
            processingError,
          );

          toast.error(t("upload.processingFailedTitle"), {
            description:
              t("upload.processingFailedDescription"),
            duration: 6000,
          });

          router.refresh();
        });
    } catch (uploadError) {
      const message = getErrorMessage(uploadError);

      console.error("Document upload failed:", uploadError);

      setError(message);

      toast.error(t("upload.failedTitle"), {
        description: message,
        duration: 6000,
      });

      if (uploaded) {
        console.error(
          "An uploaded storage object may need cleanup:",
          storagePath,
        );
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={uploading}>
        <Upload className="size-4" />
        {t("upload.uploadButton")} 
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value && uploading) return;

          if (!value) {
            reset();
          }

          setOpen(value);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("upload.dialogTitle")}</DialogTitle>

            <DialogDescription>
              {t("upload.dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          {!file ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);

                const droppedFile = event.dataTransfer.files?.[0];

                if (droppedFile) {
                  handleFile(droppedFile);
                }
              }}
              className={[
                "flex min-h-52 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/40",
              ].join(" ")}
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
                <Upload className="size-5" />
              </div>

              <p className="font-medium">{t("upload.dropHere")}</p>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("upload.orBrowse")}
              </p>

              <p className="mt-4 text-xs text-muted-foreground">
                {t("upload.supportedFiles")}
              </p>

              <Input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleInputChange}
                className="hidden"
              />
            </button>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {getFileExtension(file.name)} ·{" "}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {!uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("upload.removeSelected")}
                    onClick={reset}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="document-title" className="text-sm font-medium">
                  Document title
                </label>

                <Input
                  id="document-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t("upload.titlePlaceholder")}
                  maxLength={200}
                  disabled={uploading}
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              <Button
                type="button"
                className="w-full"
                onClick={() => void handleUpload()}
                disabled={uploading}
              >
                {uploading ? t("upload.uploading") : t("upload.uploadButton")}
              </Button>
            </div>
          )}

          {error && !file && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
