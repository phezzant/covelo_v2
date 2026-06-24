"use client";

import { useState } from "react";
import { Users, CheckCircle2 } from "lucide-react";
import type { JourneyPartner, UserRole } from "@/types/database";
import { InvitePartnerOverlay } from "@/components/app/invite-partner-overlay";
import { PendingInviteManager } from "@/components/app/pending-invite-manager";
import { useOnboarding } from "@/lib/onboarding/context";

export function PartnerSection({
  role,
  displayName,
  activePartner,
  pendingPartner,
  partnerName,
  inviteBaseUrl,
}: {
  role: UserRole;
  displayName: string;
  activePartner: JourneyPartner | null;
  pendingPartner: JourneyPartner | null;
  partnerName?: string | null;
  inviteBaseUrl: string;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const { active, step } = useOnboarding();
  const isHighlighted = active && step?.anchor === "[data-tour='invite-entry']";

  if (activePartner) {
    return (
      <div className="flex items-center gap-3 bg-gold/10 border border-gold/25 rounded-xl px-4 py-3">
        <CheckCircle2 size={18} className="text-gold flex-shrink-0" />
        <p className="text-sm">
          <span className="font-medium">{partnerName ?? "Your Investment Partner"}</span> is your
          Investment Partner. Compete &amp; Compare is unlocked.
        </p>
      </div>
    );
  }

  if (pendingPartner) {
    return (
      <PendingInviteManager
        pendingPartner={pendingPartner}
        inviteBaseUrl={inviteBaseUrl}
      />
    );
  }

  return (
    <>
      <button
        data-tour="invite-entry"
        onClick={() => setShowInvite(true)}
        className={`w-full flex items-center justify-center gap-2 bg-gold text-ink font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-colors text-sm shadow-lg shadow-gold/20 ${isHighlighted ? "gold-ring-pulse" : ""}`}
      >
        <Users size={18} className="flex-shrink-0" />
        {role === "child" ? "Invite my Investment Partner" : "Invite my child"}
      </button>
      {showInvite && (
        <InvitePartnerOverlay
          role={role}
          displayName={displayName}
          onClose={() => setShowInvite(false)}
        />
      )}
    </>
  );
}
