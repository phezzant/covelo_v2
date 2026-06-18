"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Overlay } from "@/components/app/overlay";
import { FormField, PrimaryButton } from "@/components/ui/form";
import { useOnboarding } from "@/lib/onboarding/context";
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
  const { active, step, fire } = useOnboarding();
  const guiding = active && step?.requiredAction === "send-invite";

  const isChild = role === "child";
  // The user's own name is captured here if it wasn't set earlier.
  const needsOwnName = !displayName.trim();

  const [ownName, setOwnName] = useState(displayName);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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

    // Capture the inviter's own name if we don't have it yet.
    if (needsOwnName && ownName.trim()) {
      await supabase
        .from("profiles")
        .update({ display_name: ownName.trim() })
        .eq("id", user.id);
    }

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
    if (guiding) fire("send-invite");
  }

  if (sent) {
    return (
      <Overlay onClose={onClose} title="Invite sent">
        <div className="text-center py-4">
          <p className="text-3xl mb-3">📨</p>
          <h2 className="font-display text-2xl mb-2">Invite sent</h2>
          <p className="text-parchment-dim text-sm mb-6">
            We&apos;ve let {name} know. Once they confirm, you&apos;ll
            {isChild ? " unlock Compete & Compare." : " be able to play together."}
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
          ? "Who will be your Investment Partner? They need to be 18 or older — Mum, Dad, or another grown-up you trust is usually the best choice."
          : `${ownName || "You"}, who's the child you'd like to bring along on Covelo?`}
      </p>
      {error && (
        <p className="text-loss text-sm mb-4 bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        {needsOwnName && (
          <FormField
            label="Your name"
            id="own-name"
            type="text"
            placeholder="So they know who's inviting them"
            value={ownName}
            onChange={(e) => setOwnName(e.target.value)}
            required
          />
        )}
        <FormField
          label={isChild ? "Your partner's name" : "Their name"}
          id="invite-name"
          type="text"
          placeholder={isChild ? "e.g. Mum, Dad, Billy" : "Their name"}
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
            {isChild ? "Invite my Investment Partner" : "Send invite"}
          </PrimaryButton>
        </div>
      </form>
    </Overlay>
  );
}
