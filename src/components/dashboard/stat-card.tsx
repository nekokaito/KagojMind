"use client";

import { FileText, FileCheck2, MessageSquare } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/translations";
import { Card, CardContent } from "@/components/ui/card";

type StatIcon = "documents" | "indexed" | "queries";

type StatCardProps = {
  titleKey: TranslationKey;
  value: string;
  descriptionKey: TranslationKey;
  icon: StatIcon;
};

const icons = {
  documents: FileText,
  indexed: FileCheck2,
  queries: MessageSquare,
};

export function StatCard({
  titleKey,
  value,
  descriptionKey,
  icon,
}: StatCardProps) {
  const { t } = useLanguage();
  const Icon = icons[icon];

  return (
    <Card className="shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t(titleKey)}</p>

            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {t(descriptionKey)}
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
