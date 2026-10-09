import { TranslatedText } from "@/components/i18n/translated-text";
import { notFound, redirect } from "next/navigation";
import { AiSummary } from "@/components/documents/ai-summary";

import { DocumentViewer } from "@/components/documents/document-viewer";
import { createClient } from "@/lib/supabase/server";

export default async function DocumentPage({
  params,
}: PageProps<"/documents/[id]">) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: document, error } = await supabase
    .from("documents")
    .select(
      `
        id,
        title,
        file_name,
        file_type,
        file_url,
        file_size,
        page_count,
        status,
        created_at,
        updated_at
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !document) {
    notFound();
  }

  if (document.status !== "ready") {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold"><TranslatedText k="documents.notReady" /></h1>

          <p className="mt-2 text-sm text-muted-foreground">
            <TranslatedText k="documents.stillProcessing" />
          </p>
        </div>
      </div>
    );
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.file_url, 60 * 60);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error("Unable to create document preview URL.");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DocumentViewer document={document} signedUrl={signedUrlData.signedUrl} />

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <AiSummary documentId={document.id} />
      </div>
    </div>
  );
}
