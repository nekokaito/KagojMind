"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  FileText,
  Layers3,
  Database,
  Search,
  BrainCircuit,
  Sparkles,
  Check,
  ArrowDown,
  FileSearch,
} from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/translations";

const stageKeys: TranslationKey[] = [
  "rag.stageUpload",
  "rag.stageChunk",
  "rag.stageRetrieve",
  "rag.stageGenerate",
];

const descriptionKeys: TranslationKey[] = [
  "rag.uploadDescription",
  "rag.chunkDescription",
  "rag.retrieveDescription",
  "rag.generateDescription",
];

const stageIcons = [FileText, Layers3, Database, BrainCircuit];

const stageColors = [
  "text-violet-500",
  "text-blue-500",
  "text-teal-500",
  "text-primary",
];

const chunks: {
  title: TranslationKey;
  text: TranslationKey;
  score: string;
}[] = [
  {
    title: "rag.chunkOneTitle",
    text: "rag.chunkOneText",
    score: "94%",
  },
  {
    title: "rag.chunkTwoTitle",
    text: "rag.chunkTwoText",
    score: "87%",
  },
  {
    title: "rag.chunkThreeTitle",
    text: "rag.chunkThreeText",
    score: "81%",
  },
];

export function RagVisualization() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const interval = setInterval(() => {
      setActiveStage((current) => (current + 1) % 4);
    }, 3200);

    return () => clearInterval(interval);
  }, [reduceMotion]);

  const visibleStage = reduceMotion ? 3 : activeStage;

  return (
    <section
      id="how-rag-works"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          {t("rag.eyebrow")}
        </div>

        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("rag.title")}
        </h2>

        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          {t("rag.description")}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-blue-500/[0.04]" />

        {/* RAG pipeline stages */}
        <div className="relative grid gap-5 md:grid-cols-4 md:gap-3">
          {stageKeys.map((key, index) => {
            const Icon = stageIcons[index];
            const isActive = visibleStage === index;
            const isComplete = visibleStage > index;

            return (
              <div key={key} className="relative">
                <motion.div
                  animate={{
                    y: isActive && !reduceMotion ? -3 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-2xl border bg-background p-4 transition-colors ${
                    isActive ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl bg-muted ${stageColors[index]}`}
                    >
                      <Icon className="size-5" />
                    </div>

                    <span className="font-mono text-xs text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold">{t(key)}</h3>

                  <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">
                    {t(descriptionKeys[index])}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs">
                    {isComplete ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : isActive ? (
                      <motion.span
                        animate={reduceMotion ? {} : { opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                        }}
                        className="size-2 rounded-full bg-primary"
                      />
                    ) : (
                      <span className="size-2 rounded-full bg-muted-foreground/30" />
                    )}

                    <span className="text-muted-foreground">
                      {isComplete
                        ? t("rag.complete")
                        : isActive
                          ? t("rag.processing")
                          : t("rag.waiting")}
                    </span>
                  </div>
                </motion.div>

                {index < 3 && (
                  <div className="absolute -bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center md:-right-3 md:bottom-auto md:left-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0">
                    <ArrowDown className="size-4 text-muted-foreground md:hidden" />

                    <motion.div
                      className={`hidden h-px w-5 md:block ${
                        visibleStage > index ? "bg-primary" : "bg-border"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Retrieval and answer panels */}
        <div className="relative mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Search className="size-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  {t("rag.retrievedTitle")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("rag.retrievedSubtitle")}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={visibleStage >= 2 ? "retrieved" : "searching"}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {visibleStage < 2 ? (
                  <div className="rounded-xl border border-dashed border-border p-5 text-center">
                    <Database className="mx-auto mb-2 size-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {t("rag.searching")}
                    </p>
                  </div>
                ) : (
                  chunks.map((chunk, index) => (
                    <motion.div
                      key={chunk.title}
                      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: reduceMotion ? 0 : index * 0.12,
                      }}
                      className="rounded-xl border border-teal-500/20 bg-teal-500/[0.04] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-xs font-medium">
                          <FileText className="size-3.5 text-teal-600 dark:text-teal-400" />
                          {t(chunk.title)}
                        </span>

                        <span className="rounded-md bg-teal-500/10 px-2 py-1 text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                          {chunk.score}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {t(chunk.text)}
                      </p>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>

            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              {t("rag.scoreNote")}
            </p>
          </div>

          {/* Generated answer */}
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BrainCircuit className="size-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  {t("rag.answerTitle")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("rag.answerSubtitle")}
                </p>
              </div>

              <Sparkles className="ml-auto size-4 text-primary" />
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {t("rag.questionLabel")}
              </p>

              <p className="mt-1 text-sm font-medium">{t("rag.question")}</p>
            </div>

            <AnimatePresence mode="wait">
              {visibleStage === 3 ? (
                <motion.div
                  key="answer"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-4"
                >
                  <p className="text-sm leading-6 text-foreground">
                    {t("rag.answer")}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] font-medium text-primary">
                      <FileSearch className="size-3.5" />
                      {t("rag.sourceOne")}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] font-medium text-primary">
                      <FileSearch className="size-3.5" />
                      {t("rag.sourceTwo")}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="generating"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground"
                >
                  <Sparkles className="size-4 text-primary" />
                  {t("rag.waitingForAnswer")}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stage navigation */}
        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="text-xs leading-5 text-muted-foreground">
            {t("rag.footerNote")}
          </p>

          <div className="flex items-center gap-2">
            {stageKeys.map((key, index) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveStage(index)}
                aria-label={`${t(key)} ${index + 1}`}
                aria-pressed={visibleStage === index}
                className={`h-2 rounded-full transition-all ${
                  visibleStage === index
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
