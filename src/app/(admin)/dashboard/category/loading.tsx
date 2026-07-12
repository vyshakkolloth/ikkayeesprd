import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryLoading() {
  return (
    <div className="space-y-6 w-full px-4 lg:px-6 py-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32 self-start sm:self-auto" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="border rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 bg-muted/10">
        <Skeleton className="h-10 w-full md:flex-1" />
        <div className="flex gap-3 w-full md:w-auto">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="size-4" />
              <Skeleton className="size-10 rounded-md" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-32 ml-auto" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
