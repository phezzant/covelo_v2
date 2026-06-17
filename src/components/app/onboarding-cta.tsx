"use client";

import { useOnboarding } from "@/lib/onboarding/context";

/**
 * A gold call-to-action that only appears during a specific onboarding step and
 * advances the flow when tapped. Used to inject the forced "next move" directly
 * into a real page (e.g. below the portfolio summary) rather than a tour button.
 */
export function OnboardingCta({
  stepId,
  action,
  dataTour,
  children,
}: {
  stepId: number;
  action: string;
  dataTour?: string;
  children: React.ReactNode;
}) {
  const { active, step, fire } = useOnboarding();
  if (!active || step?.id !== stepId) return null;

  return (
    <button
      data-tour={dataTour}
      onClick={() => fire(action)}
      className="mt-4 w-full bg-gold text-ink font-semibold py-3 rounded-full hover:bg-gold/90 transition-colors text-sm shadow-lg shadow-gold/20"
    >
      {children}
    </button>
  );
}
