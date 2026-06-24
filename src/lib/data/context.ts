import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Holding, Instrument } from "@/types/database";

export type HoldingWithInstrument = Holding & { instruments: Instrument };

export async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Authenticated, but never finished the role-selection step — this can
    // happen if email confirmation is enabled on the Supabase project and
    // the person logged in fresh after confirming, without having gone
    // through the inline role step right after signUp(). Redirect to the
    // standalone completion page, NOT /signup — calling signUp() again for
    // an already-existing auth user will fail.
    redirect("/signup/role");
  }

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  let holdingsCount = 0;
  if (portfolio) {
    const { count } = await supabase
      .from("holdings")
      .select("*", { count: "exact", head: true })
      .eq("portfolio_id", portfolio.id);
    holdingsCount = count ?? 0;
  }

  // active or pending partner row, whichever side this user is on
  const { data: partnerRows } = await supabase
    .from("journey_partner")
    .select("*")
    .or(`adult_id.eq.${user.id},child_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const activePartner = partnerRows?.find((p) => p.status === "active") ?? null;
  const pendingPartner = partnerRows?.find((p) => p.status === "pending") ?? null;

  let partnerProfile = null;
  if (activePartner) {
    const partnerId =
      profile.role === "child" ? activePartner.adult_id : activePartner.child_id;
    if (partnerId) {
      const { data } = await supabase.from("profiles").select("*").eq("id", partnerId).single();
      partnerProfile = data;
    }
  }

  return {
    supabase,
    user,
    profile,
    portfolio,
    activePartner,
    pendingPartner,
    partnerProfile,
    holdingsCount,
  };
}

export async function getHoldingsWithInstruments(
  portfolioId: string
): Promise<HoldingWithInstrument[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("holdings")
    .select("*, instruments(*)")
    .eq("portfolio_id", portfolioId);
  return (data as unknown as HoldingWithInstrument[]) ?? [];
}

export async function getAllInstruments() {
  const supabase = await createClient();
  const { data } = await supabase.from("instruments").select("*").order("ticker");
  return data ?? [];
}

export type PortfolioStats = {
  totalValue: number;
  stockValue: number;
  cashBalance: number;
  totalPL: number;
  topHolding: { name: string; emoji: string; pl: number } | null;
};

function statsFromHoldings(
  holdings: HoldingWithInstrument[],
  cashBalance: number
): PortfolioStats {
  const stockValue = holdings.reduce((s, h) => s + h.quantity * h.instruments.price, 0);
  const costBasis = holdings.reduce((s, h) => s + h.quantity * h.avg_cost, 0);
  let topHolding: PortfolioStats["topHolding"] = null;
  for (const h of holdings) {
    const pl = h.quantity * (h.instruments.price - h.avg_cost);
    if (!topHolding || pl > topHolding.pl) {
      topHolding = { name: h.instruments.name, emoji: h.instruments.logo_emoji, pl };
    }
  }
  return {
    totalValue: stockValue + cashBalance,
    stockValue,
    cashBalance,
    totalPL: stockValue - costBasis,
    topHolding,
  };
}

export type TeammateComparison = {
  me: PortfolioStats;
  partner: PortfolioStats;
  partnerName: string;
  partnerAvatar: string;
  /** Positive when the current user is ahead by total value. */
  valueLead: number;
  partnerHoldings: HoldingWithInstrument[];
};

/**
 * Comparison data for the Home-tab teammate widget. Only meaningful for linked
 * accounts; returns null otherwise. The partner-portfolio reads rely on the
 * "view partner's portfolio/holdings" RLS policies (status = 'active'), which
 * already exist in 0001_init.sql — no extra migration needed.
 */
export async function getTeammateComparison(): Promise<TeammateComparison | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  const { data: partnerRows } = await supabase
    .from("journey_partner")
    .select("*")
    .or(`adult_id.eq.${user.id},child_id.eq.${user.id}`)
    .eq("status", "active")
    .limit(1);
  const active = partnerRows?.[0];
  if (!active) return null;

  const partnerId = profile.role === "child" ? active.adult_id : active.child_id;
  if (!partnerId) return null;

  const [{ data: myPortfolio }, { data: partnerProfile }, { data: partnerPortfolio }] =
    await Promise.all([
      supabase.from("portfolios").select("*").eq("profile_id", user.id).single(),
      supabase.from("profiles").select("*").eq("id", partnerId).single(),
      supabase.from("portfolios").select("*").eq("profile_id", partnerId).single(),
    ]);

  if (!myPortfolio || !partnerPortfolio || !partnerProfile) return null;

  const [myHoldings, partnerHoldings] = await Promise.all([
    getHoldingsWithInstruments(myPortfolio.id),
    getHoldingsWithInstruments(partnerPortfolio.id),
  ]);

  const me = statsFromHoldings(myHoldings, myPortfolio.cash_balance);
  const partner = statsFromHoldings(partnerHoldings, partnerPortfolio.cash_balance);

  return {
    me,
    partner,
    partnerName: partnerProfile.display_name ?? partnerProfile.username ?? "Your teammate",
    partnerAvatar: partnerProfile.avatar_emoji,
    valueLead: me.totalValue - partner.totalValue,
    partnerHoldings,
  };
}
