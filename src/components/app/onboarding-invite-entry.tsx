"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/onboarding/context";
import { InvitePartnerOverlay } from "@/components/app/invite-partner-overlay";
import type { UserRole } from "@/types/database";

export function OnboardingInviteEntry({
  role,
  displayName,
}: {
  role: UserRole;
  displayName: string;
}) {
  const { active, step } = useOnboarding();
  const [open, setOpen] = useState(false);

  if (!active || step?.id !== 6) return null;

  return (
    <>
      <button
        data-tour="invite-entry"
        onClick={() => setOpen(true)}
        className="mt-8 w-full bg-gold text-ink font-semibold py-3 rounded-full hover:bg-gold/90 transition-colors text-sm shadow-lg shadow-gold/20"
      >
        {role === "child" ? "Invite my Investment Partner" : "Invite my child"}
      </button>
      {open && (
        <InvitePartnerOverlay
          role={role}
          displayName={displayName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
