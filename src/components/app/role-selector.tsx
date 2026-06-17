"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RoleSelector() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRoleSubmit(role: "child" | "adult") {
    setError(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setError("You need to be logged in to finish setting up your account.");
      setLoading(false);
      return;
    }

    // Name is collected later, during the profile step of onboarding — so we
    // create the profile without a display_name (the column is nullable).
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      role,
    });

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    await supabase.from("portfolios").insert({ profile_id: user.id });

    // Claim any pending invite sent to this email address.
    if (user.email) {
      const matchColumn = role === "adult" ? "adult_id" : "child_id";
      const { data: pendingInvite } = await supabase
        .from("journey_partner")
        .select("*")
        .is(matchColumn, null)
        .eq("invited_email", user.email)
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();

      if (pendingInvite) {
        const update: Record<string, unknown> = {
          status: "active",
          confirmed_at: new Date().toISOString(),
        };
        update[matchColumn] = user.id;
        await supabase
          .from("journey_partner")
          .update(update as never)
          .eq("id", pendingInvite.id);
      }
    }

    setLoading(false);
    router.push("/app/onboarding");
    router.refresh();
  }

  return (
    <>
      {error && (
        <p className="text-loss text-sm mb-4 bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={loading}
          onClick={() => handleRoleSubmit("child")}
          className="flex flex-col items-center gap-2 border border-parchment/15 rounded-xl py-6 hover:border-gold/50 hover:bg-ink-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-3xl">🎮</span>
          <span className="font-medium text-sm">I&apos;m the player</span>
        </button>
        <button
          disabled={loading}
          onClick={() => handleRoleSubmit("adult")}
          className="flex flex-col items-center gap-2 border border-parchment/15 rounded-xl py-6 hover:border-gold/50 hover:bg-ink-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-3xl">🧑‍🏫</span>
          <span className="font-medium text-sm">I&apos;m the partner</span>
        </button>
      </div>
    </>
  );
}
