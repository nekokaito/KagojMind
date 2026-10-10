"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  ChevronsUpDown,
  FileText,
  Folder,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KagojMindLogo } from "../brand/kagojmind-logo";

type UserProfile = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const mainNavigation = [
    {
      title: t("nav.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("nav.documents"),
      href: "/documents",
      icon: FileText,
    },
    {
      title: t("nav.assistant"),
      href: "/assistant",
      icon: Bot,
    },
    {
      title: t("nav.search"),
      href: "/search",
      icon: Search,
    },
    {
      title: t("nav.collections"),
      href: "/collections",
      icon: Folder,
    },
  ];

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    function updateProfile(user: {
      email?: string;
      user_metadata?: Record<string, unknown>;
    }) {
      const metadata = user.user_metadata ?? {};
      const email = user.email ?? "";

      const fullName = metadata.full_name || metadata.name;

      const avatar = metadata.avatar_url || metadata.picture;

      setProfile({
        name:
          (typeof fullName === "string" && fullName.trim()) ||
          email.split("@")[0] ||
          "User",
        email,
        avatarUrl: typeof avatar === "string" ? avatar : null,
      });
    }

    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        setProfile(null);
        return;
      }

      updateProfile(data.user);
    }

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setProfile(null);
        return;
      }

      updateProfile(session.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign-out failed:", error);
      setLoggingOut(false);
    }
  }

  const initials =
    profile?.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <Sidebar>
      {/* Brand */}
      <SidebarHeader className="border-b">
        <Link href="/" className="flex items-center gap-2 px-2 py-3">
          <KagojMindLogo className="size-6" />

          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">কাগজ Mind</span>

            <span className="text-[11px] text-muted-foreground">
              {t("brand.tagline")}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.workspace")}</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.account")}</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === "/settings" ||
                    pathname.startsWith("/settings/")
                  }
                  tooltip={t("nav.settings")}
                >
                  <Link href="/settings">
                    <Settings />
                    <span>{t("nav.settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Profile and preferences */}
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-auto min-h-12"
                  tooltip={profile?.name || t("account.profile")}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage
                      src={profile?.avatarUrl ?? undefined}
                      alt={profile?.name ?? "User"}
                    />

                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.name || t("common.loading")}
                    </span>

                    <span className="truncate text-xs text-muted-foreground">
                      {profile?.email || ""}
                    </span>
                  </div>

                  <ChevronsUpDown className="ml-auto size-4 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {profile?.name || t("account.profile")}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {profile?.email || ""}
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Language preference */}
                <div className="px-2 py-2">
                  <LanguageSwitcher />
                </div>

                <DropdownMenuSeparator />

                {/* Settings */}
                <DropdownMenuItem onSelect={() => router.push("/settings")}>
                  <Settings className="mr-2 size-4" />
                  {t("nav.settings")}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Sign out */}
                <DropdownMenuItem
                  disabled={loggingOut}
                  onSelect={() => void handleLogout()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  {loggingOut ? t("account.signingOut") : t("account.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
