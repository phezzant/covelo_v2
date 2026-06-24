"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOnboarding } from "@/lib/onboarding/context";

const TAB_PATH: Record<string, string> = {
  portfolio: "/app/portfolio",
  trade: "/app/trade",
  compete: "/app/compete",
  profile: "/app/profile",
};

const PAD = 10;

export function OnboardingTour() {
  const { active, step, stepNumber, totalSteps, fire, skip } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();

  const [rect, setRect] = useState<DOMRect | null>(null);
  const [anchorMissing, setAnchorMissing] = useState(false);
  const missingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || !step) return;
    const target = TAB_PATH[step.tab];
    if (target && pathname !== target) router.push(target);
  }, [active, step, pathname, router]);

  useEffect(() => {
    if (!active || !step || step.inOverlay || !step.anchor) {
      if (missingTimer.current) clearTimeout(missingTimer.current);
      return;
    }
    if (missingTimer.current) clearTimeout(missingTimer.current);
    missingTimer.current = setTimeout(() => setAnchorMissing(true), 6000);

    let raf = 0;
    let polls = 0;
    const measure = () => {
      const el = step.anchor ? document.querySelector(step.anchor) : null;
      if (el) {
        setRect(el.getBoundingClientRect());
        setAnchorMissing(false);
        if (missingTimer.current) clearTimeout(missingTimer.current);
      } else if (polls < 300) {
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

  // Inline steps blend copy into the page and get a highlight ring only (no
  // full-screen dim, which would obscure the inline banner). The dim + card is
  // reserved for deliberate modal moments (adult welcome, the finish screen).
  const showCard = !step.inline;
  const hasRing = !!rect && !!step.anchor;

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

  const ring = hasRing ? (
    <div
      className="z-40 pointer-events-none rounded-2xl"
      style={{
        position: "fixed",
        top: hy,
        left: hx,
        width: hw,
        height: hh,
        border: "2px solid var(--color-gold)",
        boxShadow: "0 0 24px 4px var(--color-gold), inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    />
  ) : null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {showCard && hasRing && (
        <>
          {panel({ top: 0, left: 0, right: 0, height: Math.max(hy, 0), pointerEvents: "auto" }, "t")}
          {panel({ top: hy + hh, left: 0, right: 0, bottom: 0, pointerEvents: "auto" }, "b")}
          {panel({ top: Math.max(hy, 0), left: 0, width: Math.max(hx, 0), height: hh, pointerEvents: "auto" }, "l")}
          {panel({ top: Math.max(hy, 0), left: hx + hw, right: 0, height: hh, pointerEvents: "auto" }, "r")}
        </>
      )}
      {showCard && !hasRing && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-40 pointer-events-auto"
          style={{ background: dim }}
        />
      )}
      {ring}

      {showCard && (
        <div
          className="fixed inset-x-4 sm:inset-x-0 sm:mx-auto sm:max-w-sm top-1/2 -translate-y-1/2 bg-ink-light border border-gold/30 rounded-2xl p-5 shadow-2xl pointer-events-auto z-40"
          role="dialog"
          aria-label="Getting started"
        >
          {!step.terminal && (
            <p className="font-mono text-xs text-gold mb-2">
              Step {stepNumber} of {totalSteps}
            </p>
          )}
          <h3 className="font-display text-xl mb-1.5">{step.title}</h3>
          <p className="text-sm text-parchment-dim mb-4 leading-relaxed">{step.body}</p>
          {step.showContinue && (
            <button
              onClick={() => fire("continue")}
              className="bg-gold text-ink font-semibold px-5 py-2 rounded-full hover:bg-gold/90 transition-colors text-sm w-full"
            >
              {step.terminal ? "Start exploring" : "Continue"}
            </button>
          )}
        </div>
      )}

      {/* Spotlight steps still need a way out and an anti-soft-lock escape. */}
      <div className="fixed bottom-4 inset-x-0 flex justify-center gap-4 pointer-events-auto z-40">
        {anchorMissing && !step.showContinue && (
          <button
            onClick={() => fire(step.requiredAction)}
            className="text-xs text-parchment-dim hover:text-parchment transition-colors underline"
          >
            Skip this step →
          </button>
        )}
        <button
          onClick={skip}
          className="text-xs text-ink-muted hover:text-parchment-dim transition-colors"
        >
          Skip tour
        </button>
      </div>
    </div>
  );
}
