"use client";

import { TranslatedText } from "@/components/i18n/translated-text";

import { useLanguage } from "@/components/i18n/language-provider";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { t } = useLanguage();
  const { setTheme } = useTheme();
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    document.documentElement.classList.remove("theme-transition");
  }, []);

  const changeTheme = (theme: string) => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    document.documentElement.classList.add("theme-transition");
    // Establish the transition rules before next-themes updates the root class.
    void document.documentElement.offsetWidth;
    setTheme(theme);
    transitionTimer.current = setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
      transitionTimer.current = null;
    }, 250);
  };
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("theme.chooseAppearance")}
        disabled
      >
        <Sun className="size-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("theme.chooseAppearance")}>
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeTheme("light")}>
          <Sun className="mr-2 size-4" />
          <TranslatedText k="settings.light" />
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => changeTheme("dark")}>
          <Moon className="mr-2 size-4" />
          <TranslatedText k="settings.dark" />
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => changeTheme("system")}>
          <Monitor className="mr-2 size-4" />
          <TranslatedText k="settings.system" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
