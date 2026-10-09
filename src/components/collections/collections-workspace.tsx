"use client";

import { useLanguage } from "@/components/i18n/language-provider";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Folder,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type Collection = {
  id: string;
  name: string;
  createdAt: string;
  documentCount: number;
};

type CollectionsWorkspaceProps = {
  initialCollections: Collection[];
};

export function CollectionsWorkspace({
  initialCollections,
}: CollectionsWorkspaceProps) {
  const { t } = useLanguage();
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newName, setNewName] = useState("");

  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function createCollection() {
    const name = newName.trim();

    if (!name) {
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to create collection.");
      }

      setCollections((current) => [data.collection, ...current]);

      setNewName("");
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Create collection failed:", error);

      setError(
        error instanceof Error ? error.message : "Failed to create collection.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function renameCollection(collection: Collection) {
    const name = window
      .prompt(t("collections.renamePrompt"), collection.name)
      ?.trim();

    if (!name || name === collection.name) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to rename collection.");
      }

      setCollections((current) =>
        current.map((item) =>
          item.id === collection.id
            ? {
                ...item,
                name: data.collection.name,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Rename collection failed:", error);

      setError(
        error instanceof Error ? error.message : "Failed to rename collection.",
      );
    }
  }

  async function deleteCollection(collection: Collection) {
    const confirmed = window.confirm(
      `Delete "${collection.name}"? The documents inside it will not be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to delete collection.");
      }

      setCollections((current) =>
        current.filter((item) => item.id !== collection.id),
      );
    } catch (error) {
      console.error("Delete collection failed:", error);

      setError(
        error instanceof Error ? error.message : "Failed to delete collection.",
      );
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Folder className="size-4 text-primary" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              {t("collections.title")}
            </h1>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {t("collections.pageDescription")}
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              {t("collections.new")}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("collections.createTitle")}</DialogTitle>

              <DialogDescription>
                {t("collections.createDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder={t("collections.exampleName")}
                maxLength={100}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isCreating) {
                    void createCollection();
                  }
                }}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
              >
                {t("collections.cancel")}
              </Button>

              <Button
                onClick={createCollection}
                disabled={isCreating || !newName.trim()}
              >
                {isCreating && <Loader2 className="size-4 animate-spin" />}
                {t("collections.createCollection")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Collections */}
      {collections.length === 0 ? (
        <EmptyCollections onCreate={() => setIsCreateOpen(true)} />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onRename={() => void renameCollection(collection)}
              onDelete={() => void deleteCollection(collection)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionCard({
  collection,
  onRename,
  onDelete,
}: {
  collection: Collection;
  onRename: () => void;
  onDelete: () => void;
}) {
  const { t } = useLanguage();

  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/collections/${collection.id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Folder className="size-5 text-primary" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-medium">{collection.name}</h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {collection.documentCount}{" "}
                {collection.documentCount === 1 ? t("collections.document") : t("collections.documents")}
              </p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={`Actions for ${collection.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRename}>
                <Pencil className="size-4" />
                {t("collections.rename")}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="size-4" />
                {t("collections.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link
          href={`/collections/${collection.id}`}
          className="mt-5 flex items-center justify-between border-t pt-4 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground"
        >
          {t("collections.open")}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}

function EmptyCollections({ onCreate }: { onCreate: () => void }) {
  const { t } = useLanguage();

  return (
    <Card className="mt-8">
      <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Folder className="size-6 text-primary" />
        </div>

        <h2 className="mt-5 text-lg font-semibold">{t("collections.noCollections")}</h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t("collections.emptyDescription")}
        </p>

        <Button className="mt-6" onClick={onCreate}>
          <Plus className="size-4" />
          {t("collections.create")}
        </Button>
      </div>
    </Card>
  );
}
