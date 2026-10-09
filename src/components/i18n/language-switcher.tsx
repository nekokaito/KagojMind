"use client";

import { Check, Languages } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Languages className="size-4" />
        <span>{language === "bn" ? "ভাষা" : "Language"}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant={language === "en" ? "default" : "outline"}
          onClick={() => setLanguage("en")}
          aria-pressed={language === "en"}
        >
          English
          {language === "en" && <Check className="ml-1 size-3" />}
        </Button>

        <Button
          type="button"
          size="sm"
          variant={language === "bn" ? "default" : "outline"}
          onClick={() => setLanguage("bn")}
          aria-pressed={language === "bn"}
        >
          বাংলা
          {language === "bn" && <Check className="ml-1 size-3" />}
        </Button>
      </div>
    </div>
  );
}
