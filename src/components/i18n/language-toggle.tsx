"use client";

import { Languages } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const next = language === "en" ? "bn" : "en";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(next)}
      aria-label={language === "en" ? "Switch to Bangla" : "Switch to English"}
      title={language === "en" ? "বাংলা" : "English"}
      className="h-8 gap-1.5 rounded-full border border-border/70 px-2.5 text-xs font-medium"
    >
      <Languages className="size-3.5" />
      {language === "en" ? "বাংলা" : "EN"}
    </Button>
  );
}
