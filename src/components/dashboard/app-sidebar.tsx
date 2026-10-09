"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  FileText,
  Folder,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  ChevronsUpDown,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

type UserProfile = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

const mainNavigation = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "AI Assistant", href: "/assistant", icon: Bot },
  { title: "Search", href: "/search", icon: Search },
  { title: "Collections", href: "/collections", icon: Folder },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted || error || !data.user) return;

      const user = data.user;
      const metadata = user.user_metadata ?? {};
      const email = user.email ?? "";

      setProfile({
        name:
          metadata.full_name || metadata.name || email.split("@")[0] || "User",
        email,
        avatarUrl: metadata.avatar_url || metadata.picture || null,
      });
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

      const user = session.user;
      const metadata = user.user_metadata ?? {};
      const email = user.email ?? "";

      setProfile({
        name:
          metadata.full_name || metadata.name || email.split("@")[0] || "User",
        email,
        avatarUrl: metadata.avatar_url || metadata.picture || null,
      });
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

      if (error) throw error;

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
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>

          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">KagojMind</span>
            <span className="text-[11px] text-muted-foreground">
              Document intelligence
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>

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

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === "/settings" ||
                    pathname.startsWith("/settings/")
                  }
                  tooltip="Settings"
                >
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-auto min-h-12"
                  tooltip={profile?.name || "Account"}
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
                      {profile?.name || "Loading account..."}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile?.email || " "}
                    </span>
                  </div>

                  <ChevronsUpDown className="ml-auto size-4 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {profile?.name || "Account"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={() => router.push("/settings")}>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  disabled={loggingOut}
                  onSelect={() => void handleLogout()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  {loggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
