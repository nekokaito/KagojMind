"use client";

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
      const message = "Only PDF and DOCX files are supported.";

      setError(message);
      toast.error("Unsupported file type", {
        description: message,
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      const message = "File size must be 20 MB or smaller.";

      setError(message);
      toast.error("File is too large", {
        description: message,
      });
      return;
    }

    if (selectedFile.size === 0) {
      const message = "The selected file is empty.";

      setError(message);
      toast.error("Empty document", {
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
      const message = "Please select a document.";

      setError(message);
      toast.error("No document selected", {
        description: message,
      });
      return;
    }

    const documentTitle = title.trim();

    if (!documentTitle) {
      const message = "Please enter a document title.";

      setError(message);
      toast.error("Document title required", {
        description: message,
      });
      return;
    }

    if (documentTitle.length > 200) {
      const message = "Document title must be 200 characters or less.";

      setError(message);
      toast.error("Document title is too long", {
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
        throw new Error("Your session has expired. Please sign in again.");
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

      toast.success("Document uploaded", {
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
              data?.error ?? "Could not start document processing.",
            );
          }

          router.refresh();
        })
        .catch((processingError: unknown) => {
          console.error(
            "Failed to start document processing:",
            processingError,
          );

          toast.error("Processing could not start", {
            description:
              "Your document was uploaded, but processing could not be started. Check its status and try again.",
            duration: 6000,
          });

          router.refresh();
        });
    } catch (uploadError) {
      const message = getErrorMessage(uploadError);

      console.error("Document upload failed:", uploadError);

      setError(message);

      toast.error("Document upload failed", {
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
        Upload document
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
            <DialogTitle>Upload document</DialogTitle>

            <DialogDescription>
              Upload a PDF or DOCX file to your KagojMind workspace.
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

              <p className="font-medium">Drop your document here</p>

              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse
              </p>

              <p className="mt-4 text-xs text-muted-foreground">
                PDF or DOCX · Maximum 20 MB
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
                    aria-label="Remove selected document"
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
                  placeholder="Employment Contract"
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
                {uploading ? "Uploading..." : "Upload document"}
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
