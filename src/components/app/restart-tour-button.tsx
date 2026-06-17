"use client";

import { RotateCcw } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding/context";

export function RestartTourButton() {
  const { restart, active } = useOnboarding();
  if (active) return null;

  return (
    <button
      onClick={restart}
      className="flex items-center gap-2 text-sm text-parchment-dim hover:text-gold transition-colors"
    >
      <RotateCcw size={15} />
      Replay setup guide
    </button>
  );
}
