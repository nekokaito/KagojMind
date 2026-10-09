"use client";

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
      toast.error("Name is required", {
        description: "Please enter your full name.",
      });
      return;
    }

    if (name.length > 100) {
      toast.error("Name is too long", {
        description: "Your name must be 100 characters or less.",
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

      toast.success("Profile updated", {
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Profile update failed:", error);

      toast.error("Couldn't update profile", {
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
      toast.error("Current password required", {
        description: "Enter your current password to continue.",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password is too short", {
        description: "Your new password must contain at least 8 characters.",
      });
      return;
    }

    if (newPassword.length > 72) {
      toast.error("Password is too long", {
        description: "Your new password must contain 72 characters or less.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Confirm your new password correctly.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Choose a new password", {
        description:
          "Your new password must differ from your current password.",
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

      toast.success("Password changed", {
        description: "Your new password has been saved successfully.",
      });
    } catch (error) {
      console.error("Password change failed:", error);

      toast.error("Couldn't change password", {
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
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account and security preferences.
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
              <h2 className="font-semibold">Profile</h2>

              <p className="text-sm text-muted-foreground">
                Update your personal information.
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
                  {fullName || "Your profile"}
                </p>

                <p className="text-sm text-muted-foreground">
                  Your profile information is private.
                </p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full name</Label>

                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  autoComplete="name"
                  disabled={isSavingProfile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

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
              {isSavingProfile ? "Saving..." : "Save changes"}
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
              <h2 className="font-semibold">Password</h2>

              <p className="text-sm text-muted-foreground">
                Keep your KagojMind account secure.
              </p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form onSubmit={changePassword} className="max-w-xl space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>

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
              <Label htmlFor="new-password">New password</Label>

              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                disabled={isChangingPassword}
              />

              <p className="text-xs text-muted-foreground">
                Use at least 8 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>

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
              {isChangingPassword ? "Changing password..." : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
