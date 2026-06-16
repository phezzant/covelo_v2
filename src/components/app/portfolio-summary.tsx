function formatCurrency(n: number) {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 });
}

export function PortfolioSummary({
  totalValue,
  stockValue,
  cashBalance,
  totalPL,
}: {
  totalValue: number;
  stockValue: number;
  cashBalance: number;
  totalPL: number;
}) {
  const plPositive = totalPL >= 0;

  return (
    <div data-tour="portfolio-summary" className="bg-ink-light rounded-2xl border border-parchment/10 p-6 sm:p-8">
      <p className="text-sm text-ink-muted mb-1">Total portfolio value</p>
      <p className="font-mono text-4xl sm:text-5xl font-medium mb-6">{formatCurrency(totalValue)}</p>

      <div className="grid grid-cols-3 gap-4 pt-5 border-t border-parchment/10">
        <div>
          <p className="text-xs text-ink-muted mb-1">Stock value</p>
          <p className="font-mono text-base sm:text-lg">{formatCurrency(stockValue)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted mb-1">Cash</p>
          <p className="font-mono text-base sm:text-lg">{formatCurrency(cashBalance)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted mb-1">Total P&amp;L</p>
          <p className={`font-mono text-base sm:text-lg ${plPositive ? "text-gain" : "text-loss"}`}>
            {plPositive ? "+" : ""}
            {formatCurrency(totalPL)}
          </p>
        </div>
      </div>
    </div>
  );
}
