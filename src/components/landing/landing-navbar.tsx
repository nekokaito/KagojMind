"use client";

import Link from "next/link";
import { ArrowUpRight, LayoutDashboard, LogOut } from "lucide-react";

import { KagojMindLogo } from "@/components/brand/kagojmind-logo";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useLanguage } from "@/components/i18n/language-provider";

type LandingUser = { id: string; email?: string };

type LandingNavbarProps = {
  user: LandingUser | null;
  authLoading: boolean;
  signingOut: boolean;
  onSignOut: () => Promise<boolean>;
};

export function LandingNavbar({
  user,
  authLoading,
  signingOut,
  onSignOut,
}: LandingNavbarProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="KagojMind home"
        >
          <KagojMindLogo />
          <span className="text-lg font-bold tracking-tight">
            কাগজ Mind<span className="text-primary">.</span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
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
          <a
            href="#how-rag-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("landing.navHowRagWorks")}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {authLoading ? (
            <div
              className="h-9 w-24 animate-pulse rounded-lg bg-muted"
              aria-label="Loading account"
            />
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
                onClick={() => void onSignOut()}
                disabled={signingOut}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">
                  {signingOut ? t("landing.signingOut") : t("landing.signOut")}
                </span>
              </button>
            </>
          ) : (
            <>
              <LanguageToggle />
              <ThemeToggle />
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
  );
}
