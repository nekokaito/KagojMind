"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, LayoutDashboard, Check } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";

type LandingUser = { id: string; email?: string };

type LandingHeroProps = {
  user: LandingUser | null;
  authLoading: boolean;
  children: ReactNode;
};

const highlights = [
  "landing.highlightOne",
  "landing.highlightTwo",
  "landing.highlightThree",
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function LandingHero({
  user,
  authLoading,
  children,
}: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pb-32 lg:pt-32">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
        className="relative z-10"
      >
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl text-4xl font-bold leading-[1.12] tracking-[-0.045em] sm:text-5xl md:text-6xl xl:text-7xl"
        >
          {t("landing.heroTitle")}{" "}
          <span className="bg-gradient-to-r from-primary via-violet-500 to-blue-500 bg-clip-text text-transparent">
            {t("landing.heroHighlight")}
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        >
          {t("landing.heroDescription")}
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/assistant"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 active:translate-y-0"
          >
            {t("landing.start")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {!user && !authLoading && (
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
            >
              {t("landing.createAccount")}
            </Link>
          )}

          {user && (
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <LayoutDashboard className="size-4" />
              {t("landing.openDashboard")}
            </Link>
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-x-5 gap-y-3"
        >
          {highlights.map((key) => (
            <div
              key={key}
              className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm"
            >
              <Check className="size-4 shrink-0 text-emerald-500" />
              {t(key)}
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="relative mx-auto w-full max-w-[600px] lg:ml-auto">
        {children}
      </div>
    </section>
  );
}
