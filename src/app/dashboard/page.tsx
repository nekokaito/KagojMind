import { FileCheck2, FileText, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { StatCard } from "@/components/dashboard/stat-card";

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      <main className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Your workspace
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                  Turn documents into knowledge.
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Upload your documents, search your knowledge, and ask AI
                  questions about your files.
                </p>
              </div>

              <Button>
                <FileText />
                Upload document
              </Button>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Documents"
                value="12"
                description="Total documents"
                icon={FileText}
              />

              <StatCard
                title="Indexed"
                value="8"
                description="Ready for AI search"
                icon={FileCheck2}
              />

              <StatCard
                title="AI queries"
                value="42"
                description="Questions asked"
                icon={MessageSquare}
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
