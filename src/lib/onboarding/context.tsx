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
  stepIndex: number;
  totalSteps: number;
  fire: (actionId: string) => void;
  allows: (actionId: string) => boolean;
  complete: () => void;
  skip: () => void;
  /** Replay the whole guided tour from the beginning (manual/demo restart). */
  restart: () => void;
};

const Ctx = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      active: false,
      role: "child",
      step: null,
      stepIndex: 0,
      totalSteps: 0,
      fire: () => {},
      allows: () => true,
      complete: () => {},
      skip: () => {},
      restart: () => {},
    };
  }
  return ctx;
}

// Whether a given step's underlying task is already done, per real app state.
function isSatisfied(step: OnboardingStep, p: OnboardingProgress): boolean {
  switch (step.requiredAction) {
    case "goto-research":
    case "reveal-top-picks":
    case "select-pick":
    case "confirm-buy":
      return p.hasHoldings; // the whole buy-flow is one task
    case "save-profile":
      return p.profileComplete;
    case "send-invite":
      return p.hasPartnerInvite;
    case "continue":
      // pure-UI steps (welcome / done): "done" only once everything else is
      return p.hasHoldings && p.profileComplete && p.hasPartnerInvite;
    default:
      return false;
  }
}

// Which tabs may re-arm the tour when opened with their task incomplete.
const REENGAGE_BY_PATH: Record<string, string> = {
  "/app/profile": "save-profile",
  "/app/compete": "send-invite",
};

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

  // First unsatisfied step = smart resume point.
  const smartStartIndex = useMemo(() => {
    const idx = steps.findIndex((s) => !isSatisfied(s, progress));
    return idx >= 0 ? idx : steps.length - 1;
  }, [steps, progress]);

  const [stepIndex, setStepIndex] = useState(smartStartIndex);
  const [active, setActive] = useState(!completed);
  // Once skipped this session, don't auto re-arm until reload or manual restart.
  const snoozed = useRef(false);

  const step = active ? steps[stepIndex] ?? null : null;

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
      const next = prev + 1;
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

  // Criteria-driven re-engagement: opening Profile/Compete with that task still
  // incomplete re-arms the tour at the relevant step (unless snoozed this session).
  useEffect(() => {
    if (active || snoozed.current) return;
    const action = REENGAGE_BY_PATH[pathname];
    if (!action) return;
    const target = steps.find((s) => s.requiredAction === action);
    if (!target) return;
    if (isSatisfied(target, progress)) return;
    const idx = steps.findIndex((s) => s.id === target.id);
    // Re-arming in response to a URL/navigation change is an intentional
    // external-system sync, not derived render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStepIndex(idx);
    setActive(true);
  }, [pathname, active, steps, progress]);

  const value: OnboardingContextValue = {
    active,
    role,
    step,
    stepIndex,
    totalSteps: steps.length,
    fire,
    allows,
    complete,
    skip,
    restart,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
