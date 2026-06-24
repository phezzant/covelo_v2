"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOnboardingSteps, type OnboardingStep } from "@/lib/onboarding/steps";
import type { UserRole } from "@/types/database";

export type OnboardingProgress = {
  hasHoldings: boolean;
  profileComplete: boolean;
  hasPartnerInvite: boolean;
};

type OnboardingContextValue = {
  active: boolean;
  role: UserRole;
  step: OnboardingStep | null;
  /** 1-based number among non-terminal steps, for "Step X of N". */
  stepNumber: number;
  totalSteps: number;
  fire: (actionId: string) => void;
  allows: (actionId: string) => boolean;
  complete: () => void;
  skip: () => void;
  restart: () => void;
  back: () => void;
};

const Ctx = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      active: false,
      role: "child",
      step: null,
      stepNumber: 0,
      totalSteps: 0,
      fire: () => {},
      allows: () => true,
      complete: () => {},
      skip: () => {},
      restart: () => {},
      back: () => {},
    };
  }
  return ctx;
}

// Whether a step's underlying task is already done, per real app state. This is
// what lets us (a) resume a dropped-out user at the first incomplete step and
// (b) skip steps that don't apply — e.g. an adult who arrived via an invite is
// already linked, so the "invite teammate" step is satisfied and skipped.
function isSatisfied(step: OnboardingStep, p: OnboardingProgress): boolean {
  switch (step.requiredAction) {
    case "goto-trade":
    case "select-pick":
    case "confirm-buy":
    case "to-profile-setup":
    case "to-finish":
      return p.hasHoldings; // the whole buy-flow is one task
    case "save-profile":
      return p.profileComplete;
    case "send-invite":
      return p.hasPartnerInvite;
    // Welcome / finish cards always require an explicit tap; never auto-skipped.
    case "continue":
    default:
      return false;
  }
}

export function OnboardingProvider({
  role,
  completed,
  progress,
  children,
}: {
  role: UserRole;
  completed: boolean;
  progress: OnboardingProgress;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const steps = useMemo(() => getOnboardingSteps(role), [role]);

  // Keep latest progress reachable inside callbacks without re-creating them.
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const smartStartIndex = useMemo(() => {
    const idx = steps.findIndex((s) => !isSatisfied(s, progress));
    return idx >= 0 ? idx : steps.length - 1;
  }, [steps, progress]);

  const [stepIndex, setStepIndex] = useState(smartStartIndex);
  const [active, setActive] = useState(!completed);
  const snoozed = useRef(false);

  const step = active ? steps[stepIndex] ?? null : null;

  const totalSteps = useMemo(() => steps.filter((s) => !s.terminal).length, [steps]);
  const stepNumber = useMemo(() => {
    if (!step) return 0;
    const nonTerminal = steps.filter((s) => !s.terminal);
    const idx = nonTerminal.findIndex((s) => s.id === step.id);
    return idx >= 0 ? idx + 1 : totalSteps;
  }, [step, steps, totalSteps]);

  const persist = useCallback(
    async (newStepId: number, isComplete: boolean) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;
      await supabase
        .from("profiles")
        .update({ onboarding_step: newStepId, onboarding_completed: isComplete })
        .eq("id", user.id);
    },
    [supabase]
  );

  const advance = useCallback(() => {
    setStepIndex((prev) => {
      let next = prev + 1;
      // Skip any forthcoming steps whose task is already done (e.g. a linked
      // adult skips the invite step), but never skip a terminal card.
      while (
        next < steps.length &&
        !steps[next].terminal &&
        isSatisfied(steps[next], progressRef.current)
      ) {
        next += 1;
      }
      if (next >= steps.length) {
        setActive(false);
        void persist(steps[steps.length - 1].id, true);
        router.refresh();
        return prev;
      }
      void persist(steps[next].id, false);
      return next;
    });
  }, [steps, persist, router]);

  const complete = useCallback(() => {
    setActive(false);
    void persist(steps[steps.length - 1]?.id ?? 0, true);
    router.refresh();
  }, [steps, persist, router]);

  const skip = useCallback(() => {
    snoozed.current = true;
    setActive(false);
    void persist(step?.id ?? steps[steps.length - 1].id, true);
    router.refresh();
  }, [step, steps, persist, router]);

  const restart = useCallback(() => {
    snoozed.current = false;
    setStepIndex(0);
    setActive(true);
    void persist(steps[0].id, false);
  }, [steps, persist]);

  const back = useCallback(() => {
    setStepIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      void persist(steps[next].id, false);
      return next;
    });
  }, [steps, persist]);

  const fire = useCallback(
    (actionId: string) => {
      if (!active || !step) return;
      if (step.requiredAction === actionId) advance();
    },
    [active, step, advance]
  );

  const allows = useCallback(
    (actionId: string) => {
      if (!active || !step) return true;
      if (step.requiredAction === actionId) return true;
      return step.allow?.includes(actionId) ?? false;
    },
    [active, step]
  );

  // Drop-out recovery. If the user abandoned the flow without finishing (and
  // didn't explicitly skip — `completed` stays false in that case), landing on
  // the Home tab re-arms the tour at the first incomplete step, which then
  // navigates them onward. Direct visits to a step's own tab re-arm too.
  useEffect(() => {
    if (active || snoozed.current || completed) return;
    const firstUnsatisfiedIdx = steps.findIndex((s) => !isSatisfied(s, progress));
    if (firstUnsatisfiedIdx < 0) return;
    const target = steps[firstUnsatisfiedIdx];
    const onHome = pathname === "/app/home";
    const onTargetTab = pathname === `/app/${target.tab}`;
    if (!onHome && !onTargetTab) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStepIndex(firstUnsatisfiedIdx);
    setActive(true);
  }, [pathname, active, completed, steps, progress]);

  const value: OnboardingContextValue = {
    active,
    role,
    step,
    stepNumber,
    totalSteps,
    fire,
    allows,
    complete,
    skip,
    restart,
    back,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
