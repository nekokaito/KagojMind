"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LandingUser = {
  id: string;
  email?: string;
};

export function useLandingAuth() {
  const [user, setUser] = useState<LandingUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!error) {
        const sessionUser = data.session?.user;

        setUser(
          sessionUser ? { id: sessionUser.id, email: sessionUser.email } : null,
        );
      }

      setAuthLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const sessionUser = session?.user;

      setUser(
        sessionUser ? { id: sessionUser.id, email: sessionUser.email } : null,
      );

      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    setSigningOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out failed:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Sign out failed:", error);
      return false;
    } finally {
      setSigningOut(false);
    }
  }

  return {
    user,
    authLoading,
    signingOut,
    signOut,
  };
}
