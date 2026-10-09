"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  FileSearch,
  FileText,
  CodeXml,
  Layers3,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { KagojMindLogo } from "@/components/brand/kagojmind-logo";
import Image from "next/image";

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
];

const highlights = [
  "landing.highlightOne",
  "landing.highlightTwo",
  "landing.highlightThree",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!error) {
        setUser(
          data.session?.user
            ? {
                id: data.session.user.id,
                email: data.session.user.email,
              }
            : null,
        );
      }

      setAuthLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
            }
          : null,
      );

      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out failed:", error.message);
      }
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[120px]" />
        <div className="absolute right-[-200px] top-[650px] h-[400px] w-[400px] rounded-full bg-blue-500/[0.06] blur-[110px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="KagojMind home"
          >
            <KagojMindLogo />

            <span className="text-lg font-bold tracking-tight">
              কাগজ Mind
              <span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("landing.navFeatures")}
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("landing.navHowItWorks")}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {authLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
                >
                  <LayoutDashboard className="size-4" />
                  {t("landing.dashboard")}
                </Link>
                <LanguageToggle />
                <ThemeToggle />
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">
                    {signingOut
                      ? t("landing.signingOut")
                      : t("landing.signOut")}
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
                >
                  {t("landing.login")}
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] sm:px-4"
                >
                  {t("landing.signup")}
                  <ArrowUpRight className="size-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pb-32 lg:pt-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12 },
            },
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
                {t(key as Parameters<typeof t>[0])}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Animated product preview */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[600px] lg:ml-auto"
        >
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
            {/* Fake app window header */}
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
              <div className="flex gap-1.5">
                <span className="size-2 rounded-full bg-red-400/80" />
                <span className="size-2 rounded-full bg-amber-400/80" />
                <span className="size-2 rounded-full bg-emerald-400/80" />
              </div>
            </div>

            <div className="grid min-h-[370px] grid-cols-[115px_1fr] sm:grid-cols-[155px_1fr]">
              {/* Preview sidebar */}
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

              {/* Preview content */}
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

                  <div className="space-y-2.5">
                    <div className="h-2 w-full rounded-full bg-muted" />
                    <div className="h-2 w-[92%] rounded-full bg-muted" />
                    <div className="h-2 w-[76%] rounded-full bg-muted" />
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      "landing.previewPointOne",
                      "landing.previewPointTwo",
                      "landing.previewPointThree",
                    ].map((key) => (
                      <div key={key} className="flex gap-2">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <p className="text-[10px] leading-5 text-muted-foreground sm:text-xs">
                          {t(key as Parameters<typeof t>[0])}
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

          {/* Floating AI badge */}
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
        </motion.div>
      </section>

      {/* Trust / value strip */}
      <section className="border-y border-border/70 bg-muted/20">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4">
          {[
            { icon: BrainCircuit, label: "landing.valueAI" },
            { icon: Search, label: "landing.valueSearch" },
            { icon: FileText, label: "landing.valueDocuments" },
            { icon: ShieldCheck, label: "landing.valuePrivacy" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2.5 text-center text-xs font-medium text-muted-foreground sm:text-sm"
            >
              <Icon className="size-4 shrink-0 text-primary" />
              {t(label as Parameters<typeof t>[0])}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
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
          <motion.p
            variants={fadeUp}
            className="mb-3 text-sm font-semibold text-primary"
          >
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

              <h3 className="text-base font-semibold">
                {t(title as Parameters<typeof t>[0])}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(description as Parameters<typeof t>[0])}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-border/70 bg-muted/20"
      >
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
              {[
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
              ].map(({ icon: Icon, title, description, number }, index) => (
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
                    <h3 className="mt-1 text-sm font-semibold">
                      {t(title as Parameters<typeof t>[0])}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {t(description as Parameters<typeof t>[0])}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-12 sm:py-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.09] via-transparent to-blue-500/[0.07]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -right-20 -top-36 size-72 rounded-full border border-primary/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -bottom-48 -left-20 size-80 rounded-full border border-primary/10"
          />

          <div className="relative">
            <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="size-6" />
            </div>

            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("landing.ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              {t("landing.ctaDescription")}
            </p>

            <Link
              href="/assistant"
              className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              {t("landing.start")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <KagojMindLogo />
              <span className="text-lg font-bold tracking-tight">
                কাগজ Mind
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("landing.footerTagline")}
            </p>
          </div>

          {/* Creator card */}
          <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background px-4 py-3 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              <Image
                src="/author/author.jpg"
                alt="Siddiq Sazzad"
                width={40}
                height={40}
                className="size-full rounded-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {t("landing.madeBy")}
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                Siddiq Sazzad
              </p>
            </div>

            <a
              href="https://github.com/nekokaito"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Siddiq Sazzad on GitHub"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <CodeXml className="size-3.5" />
              nekokaito
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50">
          <div className="mx-auto max-w-7xl px-5 py-4 text-center text-xs text-muted-foreground sm:px-8 md:text-left">
            © {new Date().getFullYear()} KagojMind. {t("landing.footerRights")}
          </div>
        </div>
      </footer>
    </main>
  );
}
