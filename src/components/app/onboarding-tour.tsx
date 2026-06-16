"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOnboardingSteps } from "@/lib/onboarding/steps";
import type { UserRole } from "@/types/database";

const TAB_PATH: Record<string, string> = {
  portfolio: "/app/portfolio",
  research: "/app/research",
  compete: "/app/compete",
  profile: "/app/profile",
};

export function OnboardingTour({
  role,
  initialStep,
  completed,
}: {
  role: UserRole;
  initialStep: number;
  completed: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const steps = getOnboardingSteps(role);
  const [stepIndex, setStepIndex] = useState(() => {
    const idx = steps.findIndex((s) => s.id === initialStep);
    return idx >= 0 ? idx : 0;
  });
  const [dismissed, setDismissed] = useState(completed);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = steps[stepIndex];

  // navigate to the right tab for the current step
  useEffect(() => {
    if (dismissed || !step) return;
    const targetPath = TAB_PATH[step.tab];
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath);
    }
  }, [step, pathname, dismissed, router]);

  // find and track the spotlighted element's position
  const updateRect = useCallback(() => {
    if (!step?.targetSelector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(step.targetSelector);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (dismissed) return;
    // small delay to let the page render after navigation
    const t = setTimeout(updateRect, 150);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect, dismissed, pathname]);

  async function persistStep(newStepId: number, isComplete: boolean) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        onboarding_step: newStepId,
        onboarding_completed: isComplete,
      })
      .eq("id", user.id);
  }

  async function handleNext() {
    if (stepIndex >= steps.length - 1) {
      setDismissed(true);
      await persistStep(step.id, true);
      router.refresh();
      return;
    }
    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    await persistStep(steps[nextIndex].id, false);
  }

  async function handleSkip() {
    setDismissed(true);
    await persistStep(step?.id ?? steps[steps.length - 1].id, true);
    router.refresh();
  }

  if (dismissed || !step) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* dimmed backdrop with a cut-out around the spotlighted element */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx={16}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 41, 0.78)"
          mask="url(#spotlight-mask)"
        />
        {rect && (
          <rect
            x={rect.left - 8}
            y={rect.top - 8}
            width={rect.width + 16}
            height={rect.height + 16}
            rx={16}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="2"
          />
        )}
      </svg>

      <div
        className="absolute inset-x-4 bottom-24 sm:bottom-8 sm:inset-x-auto sm:right-8 sm:max-w-sm bg-ink-light border border-gold/30 rounded-2xl p-5 shadow-2xl pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Onboarding tutorial"
      >
        <p className="font-mono text-xs text-gold mb-2">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h3 className="font-display text-xl mb-1.5">{step.title}</h3>
        <p className="text-sm text-parchment-dim mb-4 leading-relaxed">{step.body}</p>
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs text-ink-muted hover:text-parchment-dim transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="bg-gold text-ink font-semibold px-5 py-2 rounded-full hover:bg-gold/90 transition-colors text-sm"
          >
            {stepIndex >= steps.length - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
