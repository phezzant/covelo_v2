import {
  getCurrentUserContext,
  getHoldingsWithInstruments,
  getTeammateComparison,
} from "@/lib/data/context";
import { PortfolioSummary } from "@/components/app/portfolio-summary";
import { HoldingsList } from "@/components/app/holdings-list";
import { PartnerBanner } from "@/components/app/partner-banner";
import { HomeCta } from "@/components/app/home-cta";
import { ComparisonWidget } from "@/components/app/comparison-widget";
import { OnboardingBanner } from "@/components/app/onboarding-banner";

export default async function HomePage() {
  const { profile, portfolio, activePartner, pendingPartner, partnerProfile, holdingsCount } =
    await getCurrentUserContext();

  const holdings = portfolio ? await getHoldingsWithInstruments(portfolio.id) : [];

  const stockValue = holdings.reduce((sum, h) => sum + h.quantity * h.instruments.price, 0);
  const costBasis = holdings.reduce((sum, h) => sum + h.quantity * h.avg_cost, 0);
  const cashBalance = portfolio?.cash_balance ?? 0;
  const totalValue = stockValue + cashBalance;
  const totalPL = stockValue - costBasis;

  // Teammate comparison only exists for linked accounts.
  const comparison = activePartner ? await getTeammateComparison() : null;

  const progress = {
    hasHoldings: holdingsCount > 0,
    profileComplete: Boolean(profile.display_name?.trim()),
    hasPartnerInvite: Boolean(activePartner || pendingPartner),
  };
  const fullyOnboarded =
    progress.hasHoldings && progress.profileComplete && progress.hasPartnerInvite;

  const firstName = profile.display_name?.trim().split(" ")[0];

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <OnboardingBanner page="home" />

      <PartnerBanner
        role={profile.role}
        displayName={profile.display_name ?? ""}
        activePartner={activePartner}
        pendingPartner={pendingPartner}
        partnerName={partnerProfile?.display_name}
      />

      <h1 className="font-display text-3xl mt-6 mb-1">
        {firstName ? `Welcome back, ${firstName}` : "Welcome to Covelo"}
      </h1>
      <p className="text-parchment-dim text-sm mb-6">Here&apos;s how your portfolio&apos;s doing.</p>

      <div data-tour="portfolio-spotlight">
        <PortfolioSummary
          totalValue={totalValue}
          stockValue={stockValue}
          cashBalance={cashBalance}
          totalPL={totalPL}
        />
        <HomeCta progress={progress} />
      </div>

      {comparison && (
        <div className="mt-10">
          <ComparisonWidget data={comparison} />
        </div>
      )}

      <h2 className="font-display text-xl mt-10 mb-4">Your holdings</h2>
      <HoldingsList holdings={holdings} />

      {fullyOnboarded && !activePartner && (
        <p className="text-xs text-ink-muted mt-8 text-center">
          Your teammate hasn&apos;t joined yet — Compete &amp; Compare unlocks once they do.
        </p>
      )}
    </main>
  );
}
