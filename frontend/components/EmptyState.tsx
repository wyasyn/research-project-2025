"use client";

import { Search } from "lucide-react";

interface EmptyStateProps {
  query: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">No results found</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t find anything for &quot;{query}&quot;.
          <br />
          Try searching with different keywords.
        </p>
      </div>
    </div>
  );
}
