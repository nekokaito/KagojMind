import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { DocumentUpload } from "@/components/documents/document-upload";
import { DocumentList } from "@/components/documents/document-list";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DocumentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: documents, error } = await supabase
    .from("documents")
    .select(
      "id, title, file_name, file_type, file_size, page_count, status, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <>
      <DashboardHeader />
      <main className="space-y-8 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your documents and build your knowledge base.
            </p>
          </div>

          <DocumentUpload />
        </div>

        <DocumentList documents={documents ?? []} />
      </main>
    </>
  );
}
