"use client"

import * as React from "react"
import { AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CategoryErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CategoryError({
  error,
  reset,
}: CategoryErrorProps) {
  React.useEffect(() => {
    console.error("Categories Page Error Boundary:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 border rounded-lg bg-background/50 m-6">
      <div className="p-4 bg-destructive/10 text-destructive rounded-full mb-4">
        <AlertTriangleIcon className="size-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Something went wrong</h3>
      <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
        An error occurred while loading category dashboard data. This could be due to a lost connection or server issue.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    </div>
  )
}
