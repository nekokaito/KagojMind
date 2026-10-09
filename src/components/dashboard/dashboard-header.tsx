"use client";

import { useLanguage } from "@/components/i18n/language-provider";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DocumentSearch } from "@/components/documents/document-search";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function DashboardHeader() {
  const { t } = useLanguage();
  return (
    <header className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
      <SidebarTrigger />

      <DocumentSearch />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />

        <Button variant="ghost" size="icon" aria-label={t("header.notifications")}>
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  );
}
