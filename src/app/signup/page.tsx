"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/ui/auth-shell";
import { FormField, PrimaryButton } from "@/components/ui/form";
import { RoleSelector } from "@/components/app/role-selector";
import Link from "next/link";

type Step = "account" | "confirm-email" | "role";

export default function SignupPage() {
  const supabase = createClient();

  const [step, setStep] = useState<Step>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If "Confirm email" is enabled on the Supabase project (the default
    // for new projects), signUp() returns a user but session is null until
    // the confirmation link is clicked — there's no authenticated session
    // yet to satisfy the profiles-insert RLS policy (auth.uid() = id).
    // Surface this clearly rather than silently failing on the next step.
    if (data.user && !data.session) {
      setStep("confirm-email");
      return;
    }

    setStep("role");
  }

  if (step === "confirm-email") {
    return (
      <AuthShell title="Check your inbox" subtitle="One last step before you can start playing.">
        <div className="bg-ink-light border border-parchment/10 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-3">📬</p>
          <p className="text-sm text-parchment-dim leading-relaxed">
            We&apos;ve sent a confirmation link to <span className="text-parchment">{email}</span>.
            Click it, then come back and log in to finish setting up your account.
          </p>
        </div>
        <p className="text-center text-sm text-parchment-dim mt-6">
          Already confirmed?{" "}
          <Link href="/login" className="text-gold font-medium hover:underline">
            Log in
          </Link>
        </p>
      </AuthShell>
    );
  }

  if (step === "role") {
    return (
      <AuthShell
        title="Welcome to Covelo"
        subtitle="Covelo is a game where you learn to invest in real companies using practice money — alongside a teammate you trust, like a parent or your child."
      >
        <div className="bg-ink-light border border-parchment/10 rounded-2xl p-5 mb-6">
          <p className="text-sm text-parchment-dim leading-relaxed">
            You play as a pair: one of you is learning the ropes, the other is the trusted
            grown-up helping out. To set you up the right way, just tell us which one you are.
          </p>
        </div>
        <RoleSelector />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome to Covelo"
      subtitle="Learn to invest in real companies with $10,000 of practice money — playing alongside someone you trust."
    >
      {error && (
        <p className="text-loss text-sm mb-4 bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}
      <form onSubmit={handleAccountSubmit}>
        <FormField
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          placeholder="At least 6 characters"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="mt-6">
          <PrimaryButton type="submit" loading={loading}>
            Continue
          </PrimaryButton>
        </div>
      </form>
      <p className="text-center text-sm text-parchment-dim mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-gold font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
