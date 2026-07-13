import React from "react";

export function MenuSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Search bar skeleton */}
      <div className="max-w-xl mx-auto h-11 bg-muted rounded-full" />

      {/* Categories skeleton */}
      <div className="w-full flex justify-center gap-6 py-4 overflow-x-auto">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
            <div className="size-16 md:size-20 rounded-full bg-muted" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Top Picks title skeleton */}
      <div className="h-6 w-32 bg-muted rounded mb-4" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-32 bg-muted rounded-[20px]" />
        ))}
      </div>
    </div>
  );
}
