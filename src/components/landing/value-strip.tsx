"use client";

import { TranslatedText } from "@/components/i18n/translated-text";

import { BrainCircuit, FileText, Search, ShieldCheck } from "lucide-react";

const values = [
  { icon: BrainCircuit, label: "landing.valueAI" },
  { icon: Search, label: "landing.valueSearch" },
  { icon: FileText, label: "landing.valueDocuments" },
  { icon: ShieldCheck, label: "landing.valuePrivacy" },
] as const;

export function ValueStrip() {

  return (
    <section className="border-y border-border/70 bg-muted/20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4">
        {values.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2.5 text-center text-xs font-medium text-muted-foreground sm:text-sm"
          >
            <Icon className="size-4 shrink-0 text-primary" />
            <TranslatedText k={label} />
          </div>
        ))}
      </div>
    </section>
  );
}
