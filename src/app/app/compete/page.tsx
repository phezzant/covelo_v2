import { createClient } from "@/lib/supabase/server";
import { getCurrentUserContext, getHoldingsWithInstruments } from "@/lib/data/context";
import { Lock, Trophy } from "lucide-react";
import { ProfileEditor } from "@/components/app/profile-editor";
import { OnboardingBanner } from "@/components/app/onboarding-banner";

function formatCurrency(n: number) {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 });
}

export default async function CompetePage() {
  const { profile, portfolio, activePartner, partnerProfile } = await getCurrentUserContext();

  const identity = (
    <section className="mb-10">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-gold mb-3">
        Your leaderboard identity
      </p>
      <ProfileEditor profile={profile} />
    </section>
  );

  if (!activePartner) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <OnboardingBanner page="compete" />
        <h1 className="font-display text-3xl mb-1">Compete &amp; Compare</h1>
        <p className="text-parchment-dim text-sm mb-8">
          Covelo is all about competing with friends and family — whoever makes the most money wins.
        </p>

        {identity}

        <div className="flex flex-col items-center text-center border border-dashed border-parchment/15 rounded-2xl py-14 px-6">
          <Lock size={28} className="text-ink-muted mb-4" />
          <p className="font-display text-xl mb-2">Competing is locked for now</p>
          <p className="text-parchment-dim text-sm max-w-sm">
            {profile.role === "child"
              ? "Invite your teammate from the Profile tab to unlock competing and comparing."
              : "Invite your child from the Profile tab — once they're linked, you can compete together."}
          </p>
        </div>
      </main>
    );
  }

  const holdings = portfolio ? await getHoldingsWithInstruments(portfolio.id) : [];
  const myValue =
    (portfolio?.cash_balance ?? 0) +
    holdings.reduce((sum, h) => sum + h.quantity * h.instruments.price, 0);

  const partnerId = profile.role === "child" ? activePartner.adult_id : activePartner.child_id;
  let partnerValue = 0;
  if (partnerId) {
    const supabase = await createClient();
    const { data: partnerPortfolio } = await supabase
      .from("portfolios")
      .select("*")
      .eq("profile_id", partnerId)
      .single();
    if (partnerPortfolio) {
      const partnerHoldings = await getHoldingsWithInstruments(partnerPortfolio.id);
      partnerValue =
        partnerPortfolio.cash_balance +
        partnerHoldings.reduce((sum, h) => sum + h.quantity * h.instruments.price, 0);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <OnboardingBanner page="compete" />
      <h1 className="font-display text-3xl mb-1">Compete &amp; Compare</h1>
      <p className="text-parchment-dim text-sm mb-8">
        You and {partnerProfile?.display_name ?? "your partner"}, head to head.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-10">
        <div className="bg-ink-light border border-gold/30 rounded-2xl p-5 text-center">
          <span className="text-2xl block mb-2">{profile.avatar_emoji}</span>
          <p className="text-xs text-ink-muted mb-1">You</p>
          <p className="font-mono text-lg">{formatCurrency(myValue)}</p>
        </div>
        <div className="bg-ink-light border border-parchment/10 rounded-2xl p-5 text-center">
          <span className="text-2xl block mb-2">{partnerProfile?.avatar_emoji ?? "🧑"}</span>
          <p className="text-xs text-ink-muted mb-1">{partnerProfile?.display_name ?? "Partner"}</p>
          <p className="font-mono text-lg">{formatCurrency(partnerValue)}</p>
        </div>
      </div>

      {identity}

      <div className="flex items-center gap-2 mb-4">
        <Trophy size={16} className="text-gold" />
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-gold">Leaderboard</p>
      </div>
      <div className="border border-dashed border-parchment/15 rounded-2xl p-8 text-center">
        <p className="text-parchment-dim text-sm">
          Friend leaderboards open up once more families have joined. For now, it&apos;s just you and{" "}
          {partnerProfile?.display_name ?? "your partner"}.
        </p>
      </div>
    </main>
  );
}
