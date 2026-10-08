import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SearchWorkspace } from "@/components/search/search-workspace";
import { createClient } from "@/lib/supabase/server";

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const params = await searchParams;

  const initialQuery = typeof params.q === "string" ? params.q : "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <DashboardHeader />

      <main className="mx-auto w-full max-w-5xl p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Search</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Search across everything in your knowledge base.
          </p>
        </div>

        <SearchWorkspace initialQuery={initialQuery} />
      </main>
    </>
  );
}
