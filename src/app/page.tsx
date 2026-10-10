"use client";

import {
  LandingNavbar,
  LandingHero,
  ProductPreview,
  ValueStrip,
  FeaturesSection,
  WorkflowSection,
  LandingCTA,
  LandingFooter,
} from "@/components/landing";
import { RagVisualization } from "@/components/landing/rag-visualization";
import { useLandingAuth } from "@/hooks/use-landing-auth";

export default function HomePage() {
  const { user, authLoading, signingOut, signOut } = useLandingAuth();

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[120px]" />
        <div className="absolute right-[-200px] top-[650px] h-[400px] w-[400px] rounded-full bg-blue-500/[0.06] blur-[110px]" />
      </div>

      <LandingNavbar
        user={user}
        authLoading={authLoading}
        signingOut={signingOut}
        onSignOut={signOut}
      />

      <LandingHero user={user} authLoading={authLoading}>
        <ProductPreview />
      </LandingHero>

      <ValueStrip />
      <FeaturesSection />
      <WorkflowSection />
      <RagVisualization />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
