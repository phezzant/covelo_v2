const TICKER_ITEMS = [
  { ticker: "CBA", price: "162.40", change: "+0.8%", up: true },
  { ticker: "BHP", price: "43.85", change: "-1.2%", up: false },
  { ticker: "CSL", price: "289.10", change: "+0.3%", up: true },
  { ticker: "XRO", price: "165.20", change: "+1.8%", up: true },
  { ticker: "AAPL", price: "212.50", change: "+0.4%", up: true },
  { ticker: "TSLA", price: "248.90", change: "-2.3%", up: false },
  { ticker: "NVDA", price: "128.75", change: "+3.2%", up: true },
  { ticker: "WOW", price: "35.70", change: "+0.6%", up: true },
  { ticker: "STO", price: "7.65", change: "-0.6%", up: false },
  { ticker: "REA", price: "215.00", change: "+1.4%", up: true },
];

function TickerItem({ ticker, price, change, up }: (typeof TICKER_ITEMS)[number]) {
  return (
    <span className="inline-flex items-center gap-2 px-6 font-mono text-sm whitespace-nowrap">
      <span className="text-parchment-dim font-semibold">{ticker}</span>
      <span className="text-parchment-dim/70">${price}</span>
      <span className={up ? "text-gain" : "text-loss"}>{change}</span>
    </span>
  );
}

export function TickerStrip() {
  return (
    <div
      className="w-full overflow-hidden border-y border-parchment/10 bg-ink-light py-2.5"
      role="img"
      aria-label="Sample market ticker showing illustrative prices"
    >
      <div className="flex ticker-track">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <TickerItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
