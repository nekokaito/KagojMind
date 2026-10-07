import Link from "next/link";
import { FileText, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const documents = [
  {
    title: "Employment Contract",
    type: "PDF",
    pages: 12,
    status: "Ready",
    updated: "2 minutes ago",
  },
  {
    title: "Project Requirements",
    type: "DOCX",
    pages: 8,
    status: "Ready",
    updated: "1 hour ago",
  },
  {
    title: "Research Paper",
    type: "PDF",
    pages: 24,
    status: "Ready",
    updated: "Yesterday",
  },
];

export function RecentDocuments() {
  return (
    <Card className="shadow-none">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="font-semibold">Recent documents</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your recently added knowledge.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/documents">View all</Link>
        </Button>
      </div>

      <div className="divide-y">
        {documents.map((document) => (
          <div
            key={document.title}
            className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/40"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{document.title}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {document.type} · {document.pages} pages · {document.updated}
              </p>
            </div>

            <Badge variant="secondary">{document.status}</Badge>

            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreHorizontal />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
