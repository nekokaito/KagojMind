"use client";

import { motion } from "motion/react";
import {
  FileText,
  Search,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";

const features = [
  {
    icon: FileText,
    title: "landing.featureSummaryTitle",
    description: "landing.featureSummaryDescription",
    number: "01",
  },
  {
    icon: Search,
    title: "landing.featureSearchTitle",
    description: "landing.featureSearchDescription",
    number: "02",
  },
  {
    icon: MessageSquareText,
    title: "landing.featureChatTitle",
    description: "landing.featureChatDescription",
    number: "03",
  },
  {
    icon: ShieldCheck,
    title: "landing.featureSecurityTitle",
    description: "landing.featureSecurityDescription",
    number: "04",
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section
      id="features"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        className="mx-auto mb-14 max-w-2xl text-center"
      >
        <motion.p variants={fadeUp} className="mb-3 text-sm font-semibold text-primary">
          {t("landing.featuresEyebrow")}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
        >
          {t("landing.featuresTitle")}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg"
        >
          {t("landing.featuresDescription")}
        </motion.p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description, number }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ y: -5 }}
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-muted/20"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon className="size-5" />
              </div>
              <span className="font-mono text-xs text-muted-foreground/60">
                {number}
              </span>
            </div>
            <h3 className="text-base font-semibold">{t(title)}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t(description)}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
