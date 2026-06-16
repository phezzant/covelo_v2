"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Overlay } from "@/components/app/overlay";
import { FormField, PrimaryButton } from "@/components/ui/form";
import type { UserRole } from "@/types/database";

export function InvitePartnerOverlay({
  role,
  displayName,
  onClose,
}: {
  role: UserRole;
  displayName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const isChild = role === "child";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError("You need to be logged in to send an invite.");
      setLoading(false);
      return;
    }

    // Try to find an existing profile with this email via auth lookup is not
    // available client-side with the anon key, so for this prototype we match
    // on a profiles.username/display_name-free lookup: we simply store the
    // invited_email/name and leave adult_id/child_id null until the invited
    // person signs up and claims the invite (see /app/onboarding claim step).
    const { error: insertError } = await supabase.from("journey_partner").insert({
      adult_id: isChild ? null : user.id,
      child_id: isChild ? user.id : null,
      initiated_by: isChild ? "child_invited_adult" : "adult_invited_child",
      invited_name: name,
      invited_email: email,
      status: "pending",
    });

    setLoading(false);

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "There's already a pending invite for this account."
          : insertError.message
      );
      return;
    }

    setSent(true);
    router.refresh();
  }

  if (sent) {
    return (
      <Overlay onClose={onClose} title="Invite sent">
        <div className="text-center py-4">
          <p className="text-3xl mb-3">📨</p>
          <h2 className="font-display text-2xl mb-2">Invite sent</h2>
          <p className="text-parchment-dim text-sm mb-6">
            We&apos;ve let {name} know. Once they confirm, you&apos;ll
            {isChild ? " unlock Compete/Compare." : " be able to play together."}
          </p>
          <button
            onClick={onClose}
            className="bg-gold text-ink font-semibold px-6 py-2.5 rounded-full hover:bg-gold/90 transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose} title="Invite your Investment Partner">
      <h2 className="font-display text-2xl mb-1">
        {isChild ? "Invite your Investment Partner" : "Invite your child"}
      </h2>
      <p className="text-parchment-dim text-sm mb-6">
        {isChild
          ? "Because it involves big decisions, we recommend partnering with an adult — Mum, Dad, Grandpa, etc."
          : `${displayName}, who's the child you'd like to bring along on Covelo?`}
      </p>
      {error && (
        <p className="text-loss text-sm mb-4 bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <FormField
          label="Their name"
          id="invite-name"
          type="text"
          placeholder={isChild ? "e.g. Mum, Dad, Grandpa" : "Their name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormField
          label="Their email"
          id="invite-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="mt-6">
          <PrimaryButton type="submit" loading={loading}>
            Send invite
          </PrimaryButton>
        </div>
      </form>
    </Overlay>
  );
}
