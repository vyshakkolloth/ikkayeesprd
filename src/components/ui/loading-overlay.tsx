"use client";

import { Loader2Icon } from "lucide-react";

type LoadingOverlayProps = {
  /** Show the overlay when true */
  show: boolean;
};

export default function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2Icon className="size-12 animate-spin text-primary" />
    </div>
  );
}
