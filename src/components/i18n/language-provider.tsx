"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  translations,
  type Language,
  type TranslationKey,
} from "@/lib/i18n/translations";

const LANGUAGE_STORAGE_KEY = "kagojmind-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  isLanguageReady: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// tiny external store backed by localStorage
const listeners = new Set<() => void>();
let memoryLanguage: Language | null = null;

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Language {
  if (memoryLanguage) return memoryLanguage;
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "en" || saved === "bn") return saved;
  } catch {}
  return "en";
}

function getServerSnapshot(): Language {
  return "en";
}

const subscribeNoop = () => () => {};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isLanguageReady = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const setLanguage = useCallback((nextLanguage: Language) => {
    memoryLanguage = nextLanguage;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {}
    listeners.forEach((listener) => listener());
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key],
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, isLanguageReady }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }

  return context;
}
