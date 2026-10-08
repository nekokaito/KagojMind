import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CollectionsWorkspace } from "@/components/collections/collections-workspace";
import { createClient } from "@/lib/supabase/server";

export default async function CollectionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: collections } = await supabase
    .from("collections")
    .select(
      `
        id,
        name,
        created_at,
        collection_documents (
          document_id
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  const initialCollections =
    collections?.map((collection) => ({
      id: collection.id,
      name: collection.name,
      createdAt: collection.created_at,
      documentCount: collection.collection_documents?.length ?? 0,
    })) ?? [];

  return (
    <>
      <DashboardHeader />

      <main className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <CollectionsWorkspace initialCollections={initialCollections} />
      </main>
    </>
  );
}
