"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/ui/auth-shell";
import { FormField, PrimaryButton } from "@/components/ui/form";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/app/portfolio");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see how your portfolio's doing.">
      {error && (
        <p className="text-loss text-sm mb-4 bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
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
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="mt-6">
          <PrimaryButton type="submit" loading={loading}>
            Log in
          </PrimaryButton>
        </div>
      </form>
      <p className="text-center text-sm text-parchment-dim mt-6">
        New to Covelo?{" "}
        <Link href="/signup" className="text-gold font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
