"use client";

import { useLanguage } from "@/components/i18n/language-provider";

import { useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type SettingsWorkspaceProps = {
  profile: {
    fullName: string;
    avatarUrl: string | null;
  };
  email: string;
};

type ApiResponse = {
  success: boolean;
  error?: string;
  profile?: {
    fullName: string;
    avatarUrl: string | null;
  };
};

export function SettingsWorkspace({ profile, email }: SettingsWorkspaceProps) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(profile.fullName);

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = fullName.trim();

    if (!name) {
      toast.error(t("settings.nameRequired"), {
        description: t("settings.enterName"),
      });
      return;
    }

    if (name.length > 100) {
      toast.error(t("settings.nameTooLong"), {
        description: t("settings.nameLimit"),
      });
      return;
    }

    try {
      setIsSavingProfile(true);

      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to update your profile.");
      }

      if (!data.profile) {
        throw new Error("The server returned an invalid profile response.");
      }

      setFullName(data.profile.fullName);

      toast.success(t("settings.profileUpdated"), {
        description: t("settings.savedSuccessfully"),
      });
    } catch (error) {
      console.error("Profile update failed:", error);

      toast.error(t("settings.profileUpdateFailed"), {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword) {
      toast.error(t("settings.currentPasswordRequired"), {
        description: t("settings.enterCurrentPassword"),
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("settings.passwordTooShort"), {
        description: t("settings.passwordMin"),
      });
      return;
    }

    if (newPassword.length > 72) {
      toast.error(t("settings.passwordTooLong"), {
        description: t("settings.passwordMax"),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("settings.passwordMismatch"), {
        description: t("settings.confirmPasswordCorrectly"),
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(t("settings.chooseNewPassword"), {
        description: t("settings.passwordMustDiffer"),
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to change your password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success(t("settings.passwordChanged"), {
        description: t("settings.passwordSaved"),
      });
    } catch (error) {
      console.error("Password change failed:", error);

      toast.error(t("settings.passwordChangeFailed"), {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("settings.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("settings.subtitle")}</p>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {t("settings.manageDescription")}
        </p>
      </div>

      {/* Profile settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <User className="size-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">{t("settings.profile")}</h2>

              <p className="text-sm text-muted-foreground">
                {t("settings.personalInfoDescription")}
              </p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form onSubmit={updateProfile} className="space-y-6">
            {/* Profile avatar */}
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                {fullName.trim().charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium">
                  {fullName || t("settings.yourProfile")}
                </p>

                <p className="text-sm text-muted-foreground">
                  {t("settings.privateProfile")}
                </p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">{t("settings.fullName")}</Label>

                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder={t("settings.yourName")}
                  maxLength={100}
                  autoComplete="name"
                  disabled={isSavingProfile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("settings.email")}</Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-9"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Email changes are currently disabled.
                </p>
              </div>
            </div>

            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? t("common.saving") : t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Lock className="size-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">{t("settings.password")}</h2>

              <p className="text-sm text-muted-foreground">
                {t("settings.keepSecure")}
              </p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form onSubmit={changePassword} className="max-w-xl space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>

              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                disabled={isChangingPassword}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">{t("settings.newPassword")}</Label>

              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                disabled={isChangingPassword}
              />

              <p className="text-xs text-muted-foreground">
                {t("settings.useEightChars")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("settings.confirmPassword")}</Label>

              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                disabled={isChangingPassword}
              />
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? t("settings.changingPassword") : t("settings.changePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
