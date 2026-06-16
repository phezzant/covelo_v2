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
