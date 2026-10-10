"use client";

import { motion } from "motion/react";
import {
  BrainCircuit,
  Check,
  FileSearch,
  FileText,
  Layers3,
  MessageSquareText,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";

import { KagojMindLogo } from "@/components/brand/kagojmind-logo";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/translations";

export function ProductPreview() {
  const { t } = useLanguage();

  const previewPoints: TranslationKey[] = [
    "landing.previewPointOne",
    "landing.previewPointTwo",
    "landing.previewPointThree",
  ];

  return (
    <>
      <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/10 via-violet-500/[0.06] to-blue-500/10 blur-2xl" />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl shadow-black/[0.08] dark:shadow-black/30"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KagojMindLogo />
            </div>

            <span className="text-sm font-semibold">KagojMind</span>

            <span className="hidden rounded-md border border-border px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
              AI WORKSPACE
            </span>
          </div>

          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-red-400/80" />
            <span className="size-2 rounded-full bg-amber-400/80" />
            <span className="size-2 rounded-full bg-emerald-400/80" />
          </div>
        </div>

        <div className="grid min-h-[370px] grid-cols-[115px_1fr] sm:grid-cols-[155px_1fr]">
          <aside className="border-r border-border bg-muted/30 p-3 sm:p-4">
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-2 text-xs font-medium text-primary">
              <Layers3 className="size-3.5" />
              {t("landing.previewWorkspace")}
            </div>

            <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">
              {t("landing.previewLibrary")}
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] text-muted-foreground sm:text-xs">
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">Project brief.pdf</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted px-2 py-2 text-[10px] font-medium sm:text-xs">
                <FileText className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">Research.pdf</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] text-muted-foreground sm:text-xs">
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">Meeting.docx</span>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-dashed border-border p-2.5 text-center sm:p-3">
              <UploadCloud className="mx-auto mb-1.5 size-4 text-muted-foreground" />
              <p className="text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                {t("landing.previewUpload")}
              </p>
            </div>
          </aside>

          <div className="min-w-0 p-3 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold sm:text-sm">
                  {t("landing.previewDocumentTitle")}
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  PDF · 12 {t("landing.previewPages")}
                </p>
              </div>

              <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-medium text-emerald-600 dark:text-emerald-400 sm:text-[10px]">
                <Check className="size-3" />
                {t("landing.previewIndexed")}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-background p-3 sm:p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                  <Sparkles className="size-4" />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    {t("landing.previewSummary")}
                  </p>

                  <p className="text-[9px] text-muted-foreground">
                    {t("landing.previewGenerated")}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5" aria-hidden="true">
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="h-2 w-[92%] rounded-full bg-muted" />
                <div className="h-2 w-[76%] rounded-full bg-muted" />
              </div>

              <div className="mt-4 space-y-2">
                {previewPoints.map((key) => (
                  <div key={key} className="flex gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />

                    <p className="text-[10px] leading-5 text-muted-foreground sm:text-xs">
                      {t(key)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-3"
            >
              <div className="flex items-center gap-2">
                <MessageSquareText className="size-3.5 text-primary" />

                <p className="text-[10px] font-semibold sm:text-xs">
                  {t("landing.previewQuestion")}
                </p>
              </div>

              <div className="mt-2 flex items-start gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <BrainCircuit className="size-3" />
                </div>

                <p className="text-[10px] leading-5 text-muted-foreground sm:text-xs">
                  {t("landing.previewAnswer")}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-primary">
                <FileSearch className="size-3" />
                {t("landing.previewSource")}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 7, 0], rotate: [0, 1, 0] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-3 top-[18%] hidden items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-xl backdrop-blur sm:flex sm:-right-5"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <Zap className="size-4" />
        </div>

        <div>
          <p className="text-xs font-semibold">
            {t("landing.floatingBadgeTitle")}
          </p>

          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {t("landing.floatingBadgeDescription")}
          </p>
        </div>
      </motion.div>
    </>
  );
}
