import { TranslatedText } from "@/components/i18n/translated-text";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Folder } from "lucide-react";

import { CollectionWorkspace } from "@/components/collections/collection-workspace";
import { createClient } from "@/lib/supabase/server";

export default async function CollectionPage({
  params,
}: PageProps<"/collections/[id]">) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: collection, error } = await supabase
    .from("collections")
    .select(
      `
        id,
        name,
        created_at,
        collection_documents (
          document_id,
          documents (
            id,
            title,
            file_name,
            file_type,
            file_size,
            page_count,
            status,
            created_at,
            updated_at
          )
        )
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !collection) {
    notFound();
  }

  const documents =
    collection.collection_documents?.flatMap((item) => item.documents ?? []) ??
    [];

  return (
    <div className="min-h-svh bg-background">
      {/* Standalone header */}
      <header className="flex h-16 items-center border-b px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />

            <span><TranslatedText k="collections.title" /></span>
          </Link>

          <div className="mx-4 h-5 w-px bg-border" />

          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Folder className="size-4 text-primary" />
            </div>

            <span className="truncate text-sm font-medium">
              {collection.name}
            </span>
          </div>
        </div>
      </header>

      {/* Collection */}
      <main className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <CollectionWorkspace
          collection={{
            id: collection.id,
            name: collection.name,
            createdAt: collection.created_at,
          }}
          initialDocuments={documents}
        />
      </main>
    </div>
  );
}
