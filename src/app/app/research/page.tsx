import { getAllInstruments } from "@/lib/data/context";
import { InstrumentBrowser } from "@/components/app/instrument-browser";

export default async function ResearchPage() {
  const instruments = await getAllInstruments();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="font-display text-3xl mb-1">Research &amp; Trade</h1>
      <p className="text-parchment-dim text-sm mb-6">
        Browse companies, see how they&apos;re performing, and make a trade.
      </p>
      <InstrumentBrowser instruments={instruments} />
    </main>
  );
}
