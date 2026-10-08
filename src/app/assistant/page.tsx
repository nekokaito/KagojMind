import { AssistantWorkspace } from "@/components/assistant/assistant-workspace";
import { createClient } from "@/lib/supabase/server";

export default async function AssistantPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, file_name, file_type, page_count, status, updated_at")
    .eq("user_id", user.id)
    .eq("status", "ready")
    .order("updated_at", { ascending: false });

  return <AssistantWorkspace documents={documents ?? []} />;
}
