import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-semibold">Welcome to KagojMind</h1>

      <p className="mt-2 text-muted-foreground">
        You are logged in as {user.email}
      </p>
    </main>
  );
}
