"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding/context";

type Progress = {
  hasHoldings: boolean;
  profileComplete: boolean;
  hasPartnerInvite: boolean;
};

/**
 * The Home tab's primary "root" navigation CTA. Its label and destination
 * reflect the single most important next action for the user, per the IA's
 * priority order: buy a stock → finish profile → invite teammate → (done) trade.
 *
 * This doubles as drop-out recovery: a user who abandoned onboarding and lands
 * back on Home always sees — and is one tap from — the step they still owe.
 */
export function HomeCta({ progress }: { progress: Progress }) {
  const router = useRouter();
  const { fire, active, step } = useOnboarding();

  let label: string;
  let href: string;
  let action: string | null;

  if (!progress.hasHoldings) {
    label = "Buy your first stock";
    href = "/app/trade";
    action = "goto-trade";
  } else if (!progress.profileComplete) {
    label = "Finish your profile";
    href = "/app/profile";
    action = null;
  } else if (!progress.hasPartnerInvite) {
    label = "Invite your teammate";
    href = "/app/profile";
    action = null;
  } else {
    label = "Trade stocks";
    href = "/app/trade";
    action = null;
  }

  function handleClick() {
    if (action) fire(action); // advances onboarding step 1 if active; no-op otherwise
    router.push(href);
  }

  const isHighlighted = active && step?.anchor === "[data-tour='home-cta']";

  return (
    <button
      data-tour="home-cta"
      onClick={handleClick}
      className={`mt-4 w-full flex items-center justify-center gap-2 bg-gold text-ink font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-colors text-sm shadow-lg shadow-gold/20 ${isHighlighted ? "gold-ring-pulse" : ""}`}
    >
      {label}
      <ArrowRight size={16} />
    </button>
  );
}
