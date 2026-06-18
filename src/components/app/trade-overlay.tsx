"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Overlay } from "@/components/app/overlay";
import { PrimaryButton } from "@/components/ui/form";
import { useOnboarding } from "@/lib/onboarding/context";
import type { Instrument, TradeSide } from "@/types/database";

const DENOMINATIONS = [50, 100, 250, 500];
const MAX_DENOM = Math.max(...DENOMINATIONS);

const CONFETTI_COLORS = ["var(--color-gold)", "#7dd3a8", "#f4a5c0", "#9bb8f0", "#f4d35e"];

// Deterministic scatter from the index — pure, and visually plenty varied.
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37 + 13) % 100,
  delay: ((i * 53) % 60) / 100,
  dur: 1.4 + ((i * 29) % 120) / 100,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + ((i * 17) % 60) / 10,
}));

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes covelo-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(360px) rotate(540deg); opacity: 0; }
        }
      `}</style>
      {CONFETTI.map((pc, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${pc.left}%`,
            width: pc.size,
            height: pc.size * 1.6,
            background: pc.color,
            borderRadius: 1,
            animation: `covelo-fall ${pc.dur}s ${pc.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function TradeOverlay({
  instrument,
  onClose,
}: {
  instrument: Instrument;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { active, step, fire, back } = useOnboarding();

  // Onboarding buy step: guide the first purchase.
  const guidingBuy = active && step?.requiredAction === "confirm-buy";

  const [side, setSide] = useState<TradeSide>("buy");
  const [amount, setAmount] = useState<number | null>(guidingBuy ? MAX_DENOM : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const shares = amount ? amount / instrument.price : 0;
  const effectiveSide: TradeSide = guidingBuy ? "buy" : side;

  async function handleTrade() {
    if (!amount) return;
    setError(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError("You need to be logged in to trade.");
      setLoading(false);
      return;
    }

    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (!portfolio) {
      setError("Couldn't find your portfolio.");
      setLoading(false);
      return;
    }

    if (effectiveSide === "buy" && amount > portfolio.cash_balance) {
      setError("You don't have enough cash for this trade.");
      setLoading(false);
      return;
    }

    const { error: tradeError } = await supabase.from("trades").insert({
      portfolio_id: portfolio.id,
      instrument_id: instrument.id,
      side: effectiveSide,
      quantity: shares,
      price: instrument.price,
      total: amount,
    });

    if (tradeError) {
      setError(tradeError.message);
      setLoading(false);
      return;
    }

    const { data: existingHolding } = await supabase
      .from("holdings")
      .select("*")
      .eq("portfolio_id", portfolio.id)
      .eq("instrument_id", instrument.id)
      .maybeSingle();

    if (effectiveSide === "buy") {
      if (existingHolding) {
        const newQty = existingHolding.quantity + shares;
        const newAvgCost =
          (existingHolding.quantity * existingHolding.avg_cost + amount) / newQty;
        await supabase
          .from("holdings")
          .update({ quantity: newQty, avg_cost: newAvgCost })
          .eq("id", existingHolding.id);
      } else {
        await supabase.from("holdings").insert({
          portfolio_id: portfolio.id,
          instrument_id: instrument.id,
          quantity: shares,
          avg_cost: instrument.price,
        });
      }
      await supabase
        .from("portfolios")
        .update({ cash_balance: portfolio.cash_balance - amount })
        .eq("id", portfolio.id);
    } else {
      if (!existingHolding || existingHolding.quantity < shares) {
        setError("You don't own enough shares to sell that much.");
        setLoading(false);
        return;
      }
      const newQty = existingHolding.quantity - shares;
      if (newQty <= 0.0001) {
        await supabase.from("holdings").delete().eq("id", existingHolding.id);
      } else {
        await supabase.from("holdings").update({ quantity: newQty }).eq("id", existingHolding.id);
      }
      await supabase
        .from("portfolios")
        .update({ cash_balance: portfolio.cash_balance + amount })
        .eq("id", portfolio.id);
    }

    setLoading(false);
    setConfirmed(true);
    if (guidingBuy) {
      setCelebrate(true);
      fire("confirm-buy"); // advances onboarding to the celebration step
    }
    router.refresh();
  }

  // Closing the buy form during onboarding steps back to the Trade tab.
  function handleBuyClose() {
    if (guidingBuy) back();
    onClose();
  }

  // Onboarding celebration screen.
  if (confirmed && celebrate) {
    return (
      <Overlay onClose={() => {}} title="Purchase complete" hideClose>
        <div className="relative text-center py-4">
          <Confetti />
          <p className="text-5xl mb-3">🎉</p>
          <h2 className="font-display text-2xl mb-2">You&apos;re an investor now!</h2>
          <p className="text-parchment mb-4">
            Congratulations — you now own a piece of{" "}
            <span className="font-semibold">{instrument.name}</span>.
          </p>
          <p className="text-parchment-dim text-sm mb-6">
            A portfolio usually means owning shares in lots of different companies, not just one — so
            come back later and buy some more with the cash you&apos;ve got. But for now, let&apos;s
            set up your profile.
          </p>
          <button
            onClick={() => {
              fire("goto-profile-setup");
              onClose();
            }}
            className="bg-gold text-ink font-semibold px-6 py-2.5 rounded-full hover:bg-gold/90 transition-colors text-sm"
          >
            Set up profile
          </button>
        </div>
      </Overlay>
    );
  }

  // Normal (non-onboarding) confirmation.
  if (confirmed) {
    return (
      <Overlay onClose={onClose} title="Trade confirmed">
        <div className="text-center py-4">
          <p className="text-3xl mb-3">{effectiveSide === "buy" ? "✅" : "💰"}</p>
          <h2 className="font-display text-2xl mb-2">
            {effectiveSide === "buy" ? "Bought" : "Sold"} {instrument.name}
          </h2>
          <p className="text-parchment-dim text-sm mb-6">
            {shares.toFixed(4)} shares at ${instrument.price.toFixed(2)} each.
          </p>
          <button
            onClick={onClose}
            className="bg-gold text-ink font-semibold px-6 py-2.5 rounded-full hover:bg-gold/90 transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={guidingBuy ? handleBuyClose : onClose} title={instrument.name}>
      {guidingBuy && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-5">
          <p className="text-sm text-parchment leading-relaxed">
            Now you&apos;re looking at <span className="font-semibold">{instrument.name}</span>. The
            price per share is <span className="font-semibold">${instrument.price.toFixed(2)}</span>.
            This moves with the most recent transaction — whenever someone buys or sells. The graph
            shows how the price has changed across today. We&apos;ll explain all this in more detail
            later, but for now, try buying some shares in {instrument.name}.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{instrument.logo_emoji}</span>
        <div>
          <h2 className="font-display text-xl leading-tight">{instrument.name}</h2>
          <p className="text-xs text-ink-muted">
            {instrument.ticker} · {instrument.sector}
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 my-4">
        <span className="font-mono text-3xl">${instrument.price.toFixed(2)}</span>
        <span
          className={`font-mono text-sm ${
            instrument.day_change_pct >= 0 ? "text-gain" : "text-loss"
          }`}
        >
          {instrument.day_change_pct >= 0 ? "+" : ""}
          {instrument.day_change_pct.toFixed(1)}% today
        </span>
      </div>

      <svg viewBox="0 0 200 40" className="w-full h-10 mb-4" aria-hidden="true">
        <polyline
          points="0,30 20,25 40,28 60,18 80,22 100,12 120,16 140,8 160,14 180,6 200,10"
          fill="none"
          stroke={instrument.day_change_pct >= 0 ? "var(--color-gain)" : "var(--color-loss)"}
          strokeWidth="2"
        />
      </svg>

      {instrument.description && !guidingBuy && (
        <p className="text-sm text-parchment-dim mb-5">{instrument.description}</p>
      )}

      <div className="flex bg-ink rounded-full p-1 mb-5">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
            effectiveSide === "buy" ? "bg-gold text-ink" : "text-parchment-dim"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => !guidingBuy && setSide("sell")}
          disabled={guidingBuy}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
            effectiveSide === "sell" ? "bg-gold text-ink" : "text-parchment-dim"
          } ${guidingBuy ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          Sell
        </button>
      </div>

      {error && (
        <p className="text-loss text-sm mb-4 bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <p className="text-sm text-parchment-dim mb-2">
        How much would you like to {effectiveSide}?
      </p>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {DENOMINATIONS.map((d) => (
          <button
            key={d}
            onClick={() => setAmount(d)}
            className={`py-2.5 rounded-lg font-mono text-sm border transition-colors ${
              amount === d
                ? "bg-gold text-ink border-gold"
                : "border-parchment/15 text-parchment hover:border-gold/40"
            }`}
          >
            ${d}
          </button>
        ))}
      </div>

      {amount && (
        <p className="text-xs text-ink-muted mb-4 font-mono">
          ≈ {shares.toFixed(4)} shares of {instrument.ticker}
        </p>
      )}

      <div className={guidingBuy && amount ? "rounded-full ring-2 ring-gold/60 animate-pulse" : ""}>
        <PrimaryButton onClick={handleTrade} disabled={!amount} loading={loading}>
          Confirm {effectiveSide}
        </PrimaryButton>
      </div>
    </Overlay>
  );
}
