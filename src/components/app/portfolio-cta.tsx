"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding/context";

/**
 * The Portfolio tab's primary "root" navigation CTA. It's dynamic: the label
 * reflects the most important next action for the user. During onboarding it's
 * the spotlight target and advances the flow when tapped.
 */
export function PortfolioCta({ hasHoldings }: { hasHoldings: boolean }) {
  const router = useRouter();
  const { fire, active, step } = useOnboarding();

  const label = hasHoldings ? "Trade stocks" : "Buy your first stock";

  function handleClick() {
    fire("goto-trade"); // advances onboarding step 1 if active; no-op otherwise
    router.push("/app/trade");
  }

  const isHighlighted = active && step?.anchor === "[data-tour='portfolio-cta']";

  return (
    <button
      data-tour="portfolio-cta"
      onClick={handleClick}
      className={`mt-4 w-full flex items-center justify-center gap-2 bg-gold text-ink font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-colors text-sm shadow-lg shadow-gold/20 ${isHighlighted ? "gold-ring-pulse" : ""}`}
    >
      {label}
      <ArrowRight size={16} />
    </button>
  );
}
