"use client";

import { useState } from "react";
import { CalendarDays, Check, Loader2, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Summary = {
  overview: string;
  keyPoints: string[];
  importantDates: string[];
  entities: string[];
};

type AiSummaryProps = {
  documentId: string;
};

type SummaryResponse = {
  success?: boolean;
  summary?: Summary;
  error?: string;
  errorType?: "AI_BUSY";
};

export function AiSummary({ documentId }: AiSummaryProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateSummary() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/documents/${documentId}/summary`, {
        method: "POST",
      });

      const data = (await response.json()) as SummaryResponse;

      if (data.errorType === "AI_BUSY") {
        setError(
          data.error ??
            "I'm a little busy right now ✨ Please try again in a little while.",
        );

        return;
      }

      if (!response.ok || !data.success || !data.summary) {
        throw new Error(data.error ?? "Failed to generate summary.");
      }

      setSummary(data.summary);
    } catch (error) {
      console.error("Summary generation failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the summary.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!summary) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">AI Summary</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Get a concise overview and the most important information from
                this document.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <Sparkles className="size-4 text-destructive" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    AI is taking a little break
                  </p>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            className="mt-5"
            onClick={generateSummary}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing document...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">AI Summary</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Generated from your document
              </p>
            </div>
          </div>

          <Badge variant="secondary">AI</Badge>
        </div>

        <Separator className="my-6" />

        <section>
          <h3 className="text-sm font-semibold">Overview</h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {summary.overview}
          </p>
        </section>

        {summary.keyPoints.length > 0 && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold">Key Points</h3>

            <div className="mt-3 space-y-3">
              {summary.keyPoints.map((point, index) => (
                <div key={`${point}-${index}`} className="flex gap-3 text-sm">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-3 text-primary" />
                  </div>

                  <p className="leading-5 text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {summary.importantDates.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />

              <h3 className="text-sm font-semibold">Important Dates</h3>
            </div>

            <div className="mt-3 space-y-2">
              {summary.importantDates.map((date, index) => (
                <div
                  key={`${date}-${index}`}
                  className="rounded-lg bg-muted/50 p-3 text-sm"
                >
                  {date}
                </div>
              ))}
            </div>
          </section>
        )}

        {summary.entities.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center gap-2">
              <Users className="size-4" />

              <h3 className="text-sm font-semibold">Key Entities</h3>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {summary.entities.map((entity, index) => (
                <Badge key={`${entity}-${index}`} variant="outline">
                  {entity}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <Button
          variant="outline"
          className="mt-6"
          onClick={generateSummary}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
