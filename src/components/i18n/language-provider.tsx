"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== LANGUAGE_STORAGE_KEY) return;
    memoryLanguage = null;
    callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Language {
  if (memoryLanguage) return memoryLanguage;
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "en" || saved === "bn") {
      memoryLanguage = saved;
      return saved;
    }
  } catch {}
  memoryLanguage = "en";
  return memoryLanguage;
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
    if (nextLanguage === getSnapshot()) return;
    memoryLanguage = nextLanguage;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {}
    document.documentElement.lang = nextLanguage;
    listeners.forEach((listener) => listener());
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key],
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, isLanguageReady }),
    [language, setLanguage, t, isLanguageReady],
  );

  return (
    <LanguageContext.Provider value={value}>
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
