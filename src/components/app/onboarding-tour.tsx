"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOnboarding } from "@/lib/onboarding/context";

const TAB_PATH: Record<string, string> = {
  portfolio: "/app/portfolio",
  research: "/app/research",
  compete: "/app/compete",
  profile: "/app/profile",
};

const PAD = 10; // spotlight padding around the target element

export function OnboardingTour() {
  const { active, step, stepIndex, totalSteps, fire, skip } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();

  const [rect, setRect] = useState<DOMRect | null>(null);
  const [anchorMissing, setAnchorMissing] = useState(false);
  const missingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route to the tab this step belongs to.
  useEffect(() => {
    if (!active || !step) return;
    const target = TAB_PATH[step.tab];
    if (target && pathname !== target) router.push(target);
  }, [active, step, pathname, router]);

  // Track the spotlight target's position. Elements mount asynchronously after
  // navigation, so poll briefly until it appears, then keep it in sync.
  useEffect(() => {
    if (!active || !step || step.inOverlay || !step.anchor) {
      if (missingTimer.current) clearTimeout(missingTimer.current);
      return;
    }
    if (missingTimer.current) clearTimeout(missingTimer.current);
    // anti-soft-lock: if the target never appears, reveal a quiet fallback.
    missingTimer.current = setTimeout(() => setAnchorMissing(true), 6000);

    let raf = 0;
    let polls = 0;
    const measure = () => {
      const el = step.anchor ? document.querySelector(step.anchor) : null;
      if (el) {
        setRect(el.getBoundingClientRect());
        setAnchorMissing(false);
        if (missingTimer.current) clearTimeout(missingTimer.current);
      } else if (polls < 60) {
        polls += 1;
        raf = requestAnimationFrame(measure);
      }
    };
    measure();

    const onMove = () => {
      const el = step.anchor ? document.querySelector(step.anchor) : null;
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
      if (missingTimer.current) clearTimeout(missingTimer.current);
    };
  }, [active, step, pathname]);

  if (!active || !step || step.inOverlay) return null;

  const hasHole = !!rect && !!step.anchor && !step.inOverlay;
  const placement: "top" | "bottom" | "center" = !rect
    ? "center"
    : rect.top + rect.height / 2 < window.innerHeight / 2
      ? "bottom"
      : "top";

  // Spotlight hole geometry
  const hx = rect ? rect.left - PAD : 0;
  const hy = rect ? rect.top - PAD : 0;
  const hw = rect ? rect.width + PAD * 2 : 0;
  const hh = rect ? rect.height + PAD * 2 : 0;

  const dim = "rgba(15, 23, 41, 0.82)";
  const panel = (style: React.CSSProperties, key: string) => (
    <div
      key={key}
      onClick={(e) => e.stopPropagation()}
      style={{ position: "fixed", background: dim, ...style }}
      className="z-40"
    />
  );

  const cardPositionClass =
    placement === "top"
      ? "top-6 sm:top-10"
      : placement === "bottom"
        ? "bottom-6 sm:bottom-10"
        : "top-1/2 -translate-y-1/2";

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Dim backdrop. With a hole, four panels surround it so the spotlit
          element stays fully clickable; without one, a single dim layer. */}
      {hasHole ? (
        <>
          {panel({ top: 0, left: 0, right: 0, height: Math.max(hy, 0), pointerEvents: "auto" }, "t")}
          {panel(
            { top: hy + hh, left: 0, right: 0, bottom: 0, pointerEvents: "auto" },
            "b"
          )}
          {panel(
            { top: Math.max(hy, 0), left: 0, width: Math.max(hx, 0), height: hh, pointerEvents: "auto" },
            "l"
          )}
          {panel(
            { top: Math.max(hy, 0), left: hx + hw, right: 0, height: hh, pointerEvents: "auto" },
            "r"
          )}
          {/* glow ring around the spotlight */}
          <div
            className="z-40 pointer-events-none rounded-2xl"
            style={{
              position: "fixed",
              top: hy,
              left: hx,
              width: hw,
              height: hh,
              border: "2px solid var(--color-gold)",
              boxShadow:
                "0 0 0 9999px rgba(0,0,0,0), 0 0 24px 4px var(--color-gold), inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          />
        </>
      ) : (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-40 pointer-events-auto"
          style={{ background: dim }}
        />
      )}

      {/* Tutorial text card */}
      <div
        className={`fixed inset-x-4 sm:inset-x-0 sm:mx-auto sm:max-w-sm ${cardPositionClass} bg-ink-light border border-gold/30 rounded-2xl p-5 shadow-2xl pointer-events-auto z-40`}
        role="dialog"
        aria-modal="false"
        aria-label="Getting started"
      >
        <p className="font-mono text-xs text-gold mb-2">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h3 className="font-display text-xl mb-1.5">{step.title}</h3>
        <p className="text-sm text-parchment-dim mb-4 leading-relaxed">{step.body}</p>

        {step.showContinue && (
          <button
            onClick={() => fire("continue")}
            className="bg-gold text-ink font-semibold px-5 py-2 rounded-full hover:bg-gold/90 transition-colors text-sm w-full"
          >
            {stepIndex >= totalSteps - 1 ? "Start exploring" : "Continue"}
          </button>
        )}

        {!step.showContinue && anchorMissing && (
          <button
            onClick={() => fire(step.requiredAction)}
            className="block text-xs text-ink-muted hover:text-parchment-dim transition-colors underline mb-2"
          >
            Skip this step →
          </button>
        )}

        <div className="mt-3 pt-3 border-t border-parchment/10 flex justify-center">
          <button
            onClick={skip}
            className="text-xs text-ink-muted hover:text-parchment-dim transition-colors"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
