"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CodeXml } from "lucide-react";

import { KagojMindLogo } from "@/components/brand/kagojmind-logo";
import { useLanguage } from "@/components/i18n/language-provider";

export function LandingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border/70 bg-muted/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <KagojMindLogo />
            <span className="text-lg font-bold tracking-tight">কাগজ Mind</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("landing.footerTagline")}
          </p>
        </div>

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
            <p className="text-xs text-muted-foreground">{t("landing.madeBy")}</p>
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

      <div className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-5 py-4 text-center text-xs text-muted-foreground sm:px-8 md:text-left">
          © {new Date().getFullYear()} KagojMind. {t("landing.footerRights")}
        </div>
      </div>
    </footer>
  );
}
