import { TranslatedText } from "@/components/i18n/translated-text";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentUpload } from "@/components/documents/document-upload";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { StatCard } from "@/components/dashboard/stat-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const [documentsResult, indexedResult, queriesResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "ready"),

    supabase
      .from("messages")
      .select("id, conversations!inner(user_id)", {
        count: "exact",
        head: true,
      })
      .eq("role", "user")
      .eq("conversations.user_id", user.id),
  ]);

  const queryErrors = [
    documentsResult.error,
    indexedResult.error,
    queriesResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    console.error("Dashboard statistics query failed:", queryErrors);
  }

  const documentsCount = documentsResult.count;
  const indexedCount = indexedResult.count;
  const queriesCount = queriesResult.count;

  return (
    <>
      <DashboardHeader />

      <main className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <TranslatedText k="dashboard.workspace" />
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                  <TranslatedText k="dashboard.heroTitle" />
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                  <TranslatedText k="dashboard.heroDescription" />
                </p>
              </div>

              <DocumentUpload />
            </section>

            <section
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Workspace statistics"
            >
              <StatCard
                titleKey="dashboard.totalDocuments"
                value={documentsCount === null ? "—" : String(documentsCount)}
                descriptionKey={
                  documentsResult.error
                    ? "dashboard.loadCountError"
                    : "dashboard.totalUploaded"
                }
                icon="documents"
              />

              <StatCard
                titleKey="dashboard.indexed"
                value={indexedCount === null ? "—" : String(indexedCount)}
                descriptionKey={
                  indexedResult.error
                    ? "dashboard.loadCountError"
                    : "dashboard.readyForSearch"
                }
                icon="indexed"
              />

              <StatCard
                titleKey="dashboard.aiQueries"
                value={queriesCount === null ? "—" : String(queriesCount)}
                descriptionKey={
                  queriesResult.error
                    ? "dashboard.loadCountError"
                    : "dashboard.questionsAsked"
                }
                icon="queries"
              />
            </section>

            <section>
              <RecentDocuments />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
