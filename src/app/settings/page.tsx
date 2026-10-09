import { redirect } from "next/navigation";

import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("user_id", user.id)
    .single();

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <DashboardHeader />

        <main className="mx-auto w-full max-w-5xl p-6 md:p-8">
          <SettingsWorkspace
            profile={{
              fullName: profile?.full_name ?? "",
              avatarUrl: profile?.avatar_url ?? null,
            }}
            email={user.email ?? ""}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
