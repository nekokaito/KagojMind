"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toUpperCase() ?? "";
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
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be 20 MB or smaller.");
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
    if (!file) {
      setError("Please select a document.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Your session has expired. Please sign in again.");
      setUploading(false);
      return;
    }

    const documentId = crypto.randomUUID();

    const storagePath = `${user.id}/${documentId}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: documentError } = await supabase.from("documents").insert({
      id: documentId,
      user_id: user.id,
      title: title.trim(),
      file_name: file.name,
      file_type: file.type,
      file_url: storagePath,
      file_size: file.size,
      status: "processing",
      processing_started_at: null,
    });

    if (documentError) {
      await supabase.storage.from("documents").remove([storagePath]);

      setError(documentError.message);
      setUploading(false);
      return;
    }

    void fetch(`/api/documents/${documentId}/process`, {
      method: "POST",
    }).catch((error) => {
      console.error("Failed to start document processing:", error);
    });

    setUploading(false);
    setOpen(false);
    reset();

    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload />
        Upload document
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value && !uploading) {
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
                  <Button variant="ghost" size="icon" onClick={reset}>
                    <X />
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
                  disabled={uploading}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading & processing..." : "Upload document"}
              </Button>
            </div>
          )}

          {error && !file && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
