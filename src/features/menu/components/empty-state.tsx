import React from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

interface EmptyStateProps {
  message: string;
  clearLabel: string;
  clearUrl: string;
}

export function EmptyState({ message, clearLabel, clearUrl }: EmptyStateProps) {
  return (
    <div className="text-center py-20 flex flex-col items-center justify-center gap-4 bg-white/40 border border-dashed border-brand-gold/10 rounded-3xl p-8 max-w-lg mx-auto">
      <div className="size-16 rounded-full bg-brand-gold/5 flex items-center justify-center text-brand-gold/60 border border-brand-gold/10">
        <UtensilsCrossed className="size-8" />
      </div>
      <p className="text-brand-dark-light font-sans text-base max-w-xs">{message}</p>
      <Link
        href={clearUrl}
        className="text-sm text-brand-gold font-semibold hover:underline cursor-pointer focus:outline-none"
      >
        {clearLabel}
      </Link>
    </div>
  );
}
