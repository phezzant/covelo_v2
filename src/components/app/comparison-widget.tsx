import { TrendingUp, TrendingDown } from "lucide-react";
import type { TeammateComparison } from "@/lib/data/context";

function fmt(n: number) {
  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });
}

function fmtSigned(n: number) {
  const s = n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });
  return n >= 0 ? `+${s}` : s;
}

/**
 * Home-tab "you vs. teammate" widget. Rendered only when the account is linked.
 * Framing is deliberately progress-first, not rank-first: when the user is
 * behind we lead with their own gain and the size of the gap as something to
 * close, never a bare "you're losing" verdict.
 */
export function ComparisonWidget({ data }: { data: TeammateComparison }) {
  const { me, partner, partnerName, partnerAvatar, valueLead } = data;
  const ahead = valueLead >= 0;
  const gap = Math.abs(valueLead);

  const headline = ahead
    ? gap < 1
      ? "You're neck and neck"
      : `You're ahead by ${fmt(gap)}`
    : `${fmt(gap)} to catch ${partnerName}`;

  return (
    <section className="mb-8">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-gold mb-3">
        You vs. {partnerName}
      </p>

      <div className="bg-ink-light border border-gold/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-lg">{headline}</p>
          <span
            className={`flex items-center gap-1 font-mono text-xs ${
              ahead ? "text-gain" : "text-loss"
            }`}
          >
            {ahead ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {fmtSigned(valueLead)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ink rounded-xl border border-gold/30 p-4">
            <p className="text-xs text-ink-muted mb-1">You</p>
            <p className="font-mono text-lg leading-tight">{fmt(me.totalValue)}</p>
            <p
              className={`font-mono text-xs mt-1 ${
                me.totalPL >= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {fmtSigned(me.totalPL)} P&amp;L
            </p>
          </div>
          <div className="bg-ink rounded-xl border border-parchment/10 p-4">
            <p className="text-xs text-ink-muted mb-1">
              <span className="mr-1">{partnerAvatar}</span>
              {partnerName}
            </p>
            <p className="font-mono text-lg leading-tight">{fmt(partner.totalValue)}</p>
            <p
              className={`font-mono text-xs mt-1 ${
                partner.totalPL >= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {fmtSigned(partner.totalPL)} P&amp;L
            </p>
          </div>
        </div>

        {(me.topHolding || partner.topHolding) && (
          <div className="mt-4 pt-4 border-t border-parchment/10 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-ink-muted mb-1">Your best pick</p>
              {me.topHolding ? (
                <p>
                  <span className="mr-1">{me.topHolding.emoji}</span>
                  {me.topHolding.name}{" "}
                  <span className={me.topHolding.pl >= 0 ? "text-gain" : "text-loss"}>
                    ({fmtSigned(me.topHolding.pl)})
                  </span>
                </p>
              ) : (
                <p className="text-ink-muted">Nothing yet</p>
              )}
            </div>
            <div>
              <p className="text-ink-muted mb-1">{partnerName}&apos;s best pick</p>
              {partner.topHolding ? (
                <p>
                  <span className="mr-1">{partner.topHolding.emoji}</span>
                  {partner.topHolding.name}{" "}
                  <span className={partner.topHolding.pl >= 0 ? "text-gain" : "text-loss"}>
                    ({fmtSigned(partner.topHolding.pl)})
                  </span>
                </p>
              ) : (
                <p className="text-ink-muted">Nothing yet</p>
              )}
            </div>
          </div>
        )}

        {data.partnerHoldings.length > 0 && (
          <details className="mt-4 group">
            <summary className="cursor-pointer text-xs text-gold hover:underline list-none">
              View {partnerName}&apos;s portfolio →
            </summary>
            <div className="mt-3 flex flex-col gap-2">
              {data.partnerHoldings.map((h) => {
                const pl = h.quantity * (h.instruments.price - h.avg_cost);
                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between bg-ink rounded-lg border border-parchment/10 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{h.instruments.logo_emoji}</span>
                      <div>
                        <p className="text-sm">{h.instruments.name}</p>
                        <p className="text-xs text-ink-muted">{h.instruments.ticker}</p>
                      </div>
                    </div>
                    <p className={`font-mono text-xs ${pl >= 0 ? "text-gain" : "text-loss"}`}>
                      {fmtSigned(pl)}
                    </p>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}
