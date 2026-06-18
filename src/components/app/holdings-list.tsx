import Link from "next/link";
import type { HoldingWithInstrument } from "@/lib/data/context";

function formatCurrency(n: number) {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 });
}

export function HoldingsList({ holdings }: { holdings: HoldingWithInstrument[] }) {
  if (holdings.length === 0) {
    return (
      <div className="border border-dashed border-parchment/15 rounded-2xl p-8 text-center">
        <p className="text-parchment-dim">You don&apos;t own anything yet — use the button above to buy your first stock.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {holdings.map((h) => {
        const value = h.quantity * h.instruments.price;
        const pl = (h.instruments.price - h.avg_cost) * h.quantity;
        const plPositive = pl >= 0;
        return (
          <Link
            key={h.id}
            href={`/app/trade?instrument=${h.instruments.ticker}`}
            className="flex items-center justify-between bg-ink-light rounded-xl border border-parchment/10 px-4 py-3.5 hover:border-gold/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{h.instruments.logo_emoji}</span>
              <div>
                <p className="font-medium text-sm">{h.instruments.ticker}</p>
                <p className="text-xs text-ink-muted">
                  {h.quantity} share{h.quantity !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">{formatCurrency(value)}</p>
              <p className={`font-mono text-xs ${plPositive ? "text-gain" : "text-loss"}`}>
                {plPositive ? "+" : ""}
                {formatCurrency(pl)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
