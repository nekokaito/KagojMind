"use client";

import { useLayoutEffect, useRef } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/translations";

export function TranslatedText({ k }: { k: TranslationKey }) {
  const { t, isLanguageReady } = useLanguage();
  const text = t(k);
  const elementRef = useRef<HTMLSpanElement>(null);
  const previousTextRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!isLanguageReady) return;
    const previous = previousTextRef.current;
    previousTextRef.current = text;
    const element = elementRef.current;
    if (previous === null || previous === text || !element?.animate) return;

    // Start before paint, on the existing label. No document class, timeout,
    // remount, or delayed language update is needed to restart the animation.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = element.animate(
      [{ opacity: reducedMotion ? 0.7 : 0 }, { opacity: 1 }],
      { duration: reducedMotion ? 100 : 280, easing: "ease-out" },
    );
    return () => animation.cancel();
  }, [text, isLanguageReady]);

  return <span ref={elementRef} className="translated-text">{text}</span>;
}
