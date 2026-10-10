"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, UploadCloud, BrainCircuit, MessageSquareText } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";

const steps = [
  {
    icon: UploadCloud,
    title: "landing.stepOneTitle",
    description: "landing.stepOneDescription",
    number: "01",
  },
  {
    icon: BrainCircuit,
    title: "landing.stepTwoTitle",
    description: "landing.stepTwoDescription",
    number: "02",
  },
  {
    icon: MessageSquareText,
    title: "landing.stepThreeTitle",
    description: "landing.stepThreeDescription",
    number: "03",
  },
] as const;

export function WorkflowSection() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="border-y border-border/70 bg-muted/20">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-sm font-semibold text-primary">
              {t("landing.workflowEyebrow")}
            </p>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              {t("landing.workflowTitle")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              {t("landing.workflowDescription")}
            </p>
            <Link
              href="/assistant"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              {t("landing.exploreAssistant")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="space-y-4">
            {steps.map(({ icon: Icon, title, description, number }, index) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("landing.step")} {number}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold">{t(title)}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {t(description)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
