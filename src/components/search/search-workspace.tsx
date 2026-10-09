"use client";

import { useLanguage } from "@/components/i18n/language-provider";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileText, Loader2, Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SearchResult = {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  page: number | null;
  chunkIndex: number;
  similarity: number;
};

type SearchResponse = {
  success?: boolean;
  query?: string;
  results?: SearchResult[];
  error?: string;
};

type SearchWorkspaceProps = {
  initialQuery?: string;
};

function formatSimilarity(similarity: number, relevantLabel: string) {
  return `${Math.round(similarity * 100)}% ${relevantLabel}`;
}

function getPreview(content: string) {
  const clean = content.replace(/\s+/g, " ").trim();

  if (clean.length <= 280) {
    return clean;
  }

  return `${clean.slice(0, 280)}...`;
}

export function SearchWorkspace({ initialQuery = "" }: SearchWorkspaceProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmedQuery,
        }),
      });

      const data = (await response.json()) as SearchResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Search failed.");
      }

      setResults(data.results ?? []);
      setSearchedQuery(trimmedQuery);
    } catch (error) {
      console.error("Search failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while searching.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuggestion(suggestion: string) {
    setQuery(suggestion);
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search.askPlaceholder")}
            className="h-11 pl-9"
            maxLength={500}
          />
        </div>

        <Button type="submit" size="lg" disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          Search
        </Button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {searchedQuery && !isLoading && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                {t("search.resultsFor")}
              </p>

              <p className="mt-1 truncate font-medium">
                &quot;{searchedQuery}&quot;
              </p>
            </div>

            <Badge variant="secondary" className="shrink-0">
              {results.length} {results.length === 1 ? t("search.result") : t("search.results")}
            </Badge>
          </div>

          {results.length === 0 ? (
            <Card className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Sparkles className="size-5" />
              </div>

              <h3 className="mt-4 font-medium">{t("search.noRelevantResults")}</h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {t("search.tryDifferent")}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="overflow-hidden transition-colors hover:bg-muted/30"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/documents/${result.documentId}`}
                            className="font-medium hover:underline"
                          >
                            {result.documentTitle}
                          </Link>

                          <Badge variant="secondary" className="text-xs">
                            {formatSimilarity(result.similarity, t("search.relevantPercent"))}
                          </Badge>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {getPreview(result.content)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {result.page !== null && (
                            <span>Page {result.page}</span>
                          )}

                          <span>Section {result.chunkIndex + 1}</span>

                          <Link
                            href={`/documents/${result.documentId}`}
                            className="ml-auto inline-flex items-center gap-1 font-medium text-foreground hover:underline"
                          >
                            Open document
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!searchedQuery && (
        <Card className="mt-8">
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="size-6 text-primary" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              {t("search.searchKnowledge")}
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              {t("search.searchDescription")}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                t("search.suggestionObjective"),
                t("search.suggestionMethodology"),
                t("search.suggestionDates"),
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
