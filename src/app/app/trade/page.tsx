import { getAllInstruments } from "@/lib/data/context";
import { InstrumentBrowser } from "@/components/app/instrument-browser";
import { OnboardingBanner } from "@/components/app/onboarding-banner";

export default async function TradePage() {
  const instruments = await getAllInstruments();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <OnboardingBanner page="trade" />

      <h1 className="font-display text-3xl mb-1">Trade</h1>
      <p className="text-parchment-dim text-sm mb-6">
        Research companies, see how they&apos;re performing, and decide what to buy or sell.
      </p>

      <InstrumentBrowser instruments={instruments} />
    </main>
  );
}
