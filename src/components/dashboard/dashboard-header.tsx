import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DocumentSearch } from "@/components/documents/document-search";

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
      <SidebarTrigger />

      <DocumentSearch />

      <div className="ml-auto">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
      </div>
    </header>
  );
}
