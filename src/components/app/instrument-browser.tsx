"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Instrument } from "@/types/database";
import { TradeOverlay } from "@/components/app/trade-overlay";
import { useOnboarding } from "@/lib/onboarding/context";

export function InstrumentBrowser({ instruments }: { instruments: Instrument[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Instrument | null>(null);
  const { active, step, allows, fire } = useOnboarding();

  const filtered = useMemo(() => {
    if (!query.trim()) return instruments;
    const q = query.toLowerCase();
    return instruments.filter(
      (i) => i.name.toLowerCase().includes(q) || i.ticker.toLowerCase().includes(q)
    );
  }, [instruments, query]);

  const topPicks = instruments.slice(0, 5);

  // During step 2 the browser is hidden — the only action is the reveal CTA.
  if (active && step?.id === 2) return null;

  const searchDisabled = active && !allows("search");
  const listDisabled = active && !allows("select-any");
  const pickAllowed = allows("select-pick");

  function handlePick(inst: Instrument) {
    if (active && !pickAllowed) return;
    setSelected(inst);
    fire("select-pick");
  }

  function handleListSelect(inst: Instrument) {
    if (listDisabled) return;
    setSelected(inst);
  }

  return (
    <div>
      <div className={`relative mb-6 ${searchDisabled ? "opacity-40 pointer-events-none" : ""}`}>
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          placeholder="Search companies…"
          value={query}
          disabled={searchDisabled}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-ink-light border border-parchment/15 rounded-full pl-10 pr-4 py-2.5 text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-colors"
        />
      </div>

      {!query && (
        <div data-tour="top-picks" className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-gold mb-3">
            Top picks
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {topPicks.map((inst) => (
              <button
                key={inst.id}
                onClick={() => handlePick(inst)}
                className="flex-shrink-0 bg-ink-light border border-parchment/10 rounded-xl px-4 py-3 hover:border-gold/30 transition-colors text-left min-w-[140px]"
              >
                <span className="text-xl mb-1 block">{inst.logo_emoji}</span>
                <p className="font-medium text-sm">{inst.ticker}</p>
                <p className="font-mono text-xs text-ink-muted">${inst.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted mb-3">
        {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : "All companies"}
      </p>
      <div
        data-tour="instrument-list"
        className={`flex flex-col gap-2 ${listDisabled ? "opacity-40 pointer-events-none" : ""}`}
      >
        {filtered.map((inst) => (
          <button
            key={inst.id}
            onClick={() => handleListSelect(inst)}
            className="flex items-center justify-between bg-ink-light rounded-xl border border-parchment/10 px-4 py-3.5 hover:border-gold/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{inst.logo_emoji}</span>
              <div>
                <p className="font-medium text-sm">{inst.name}</p>
                <p className="text-xs text-ink-muted">
                  {inst.ticker} · {inst.sector}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">${inst.price.toFixed(2)}</p>
              <p
                className={`font-mono text-xs ${
                  inst.day_change_pct >= 0 ? "text-gain" : "text-loss"
                }`}
              >
                {inst.day_change_pct >= 0 ? "+" : ""}
                {inst.day_change_pct.toFixed(1)}%
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && <TradeOverlay instrument={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
