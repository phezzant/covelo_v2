"use client";

import { useOnboarding } from "@/lib/onboarding/context";

/**
 * Inline onboarding guidance, blended into the page rather than shown as a
 * floating tour card. Renders only when the current step belongs to `page` and
 * is an inline step. The tour still draws the spotlight around the target.
 */
export function OnboardingBanner({
  page,
}: {
  page: "portfolio" | "trade" | "compete" | "profile";
}) {
  const { active, step, stepNumber, totalSteps } = useOnboarding();
  if (!active || !step || step.tab !== page || !step.inline) return null;

  return (
    <div className="bg-gold/10 border border-gold/30 rounded-2xl p-5 mb-6">
      <p className="font-mono text-xs text-gold mb-2">
        Step {stepNumber} of {totalSteps}
      </p>
      <h2 className="font-display text-xl mb-1.5">{step.title}</h2>
      <p className="text-sm text-parchment leading-relaxed">{step.body}</p>
    </div>
  );
}
