"use client";

import { useState } from "react";
import { Users, Clock, CheckCircle2 } from "lucide-react";
import type { JourneyPartner, UserRole } from "@/types/database";
import { InvitePartnerOverlay } from "@/components/app/invite-partner-overlay";

export function PartnerBanner({
  role,
  displayName,
  activePartner,
  pendingPartner,
  partnerName,
}: {
  role: UserRole;
  displayName: string;
  activePartner: JourneyPartner | null;
  pendingPartner: JourneyPartner | null;
  partnerName?: string | null;
}) {
  const [showInvite, setShowInvite] = useState(false);

  if (activePartner) {
    return (
      <div data-tour="partner-banner" className="flex items-center gap-3 bg-gold/10 border border-gold/25 rounded-xl px-4 py-3">
        <CheckCircle2 size={18} className="text-gold flex-shrink-0" />
        <p className="text-sm">
          <span className="font-medium">{partnerName ?? "Your Investment Partner"}</span> is your
          Investment Partner. Compete/Compare is unlocked.
        </p>
      </div>
    );
  }

  if (pendingPartner) {
    const waitingOnLabel =
      pendingPartner.initiated_by === "child_invited_adult"
        ? pendingPartner.invited_name ?? "your invited adult"
        : pendingPartner.invited_name ?? "your invited child";

    return (
      <div data-tour="partner-banner" className="flex items-center gap-3 bg-ink-light border border-parchment/10 rounded-xl px-4 py-3">
        <Clock size={18} className="text-ink-muted flex-shrink-0" />
        <p className="text-sm text-parchment-dim">
          Waiting on <span className="font-medium text-parchment">{waitingOnLabel}</span> to
          confirm as your Investment Partner.
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        data-tour="partner-banner"
        onClick={() => setShowInvite(true)}
        className="w-full flex items-center gap-3 bg-ink-light border border-parchment/10 rounded-xl px-4 py-3 hover:border-gold/30 transition-colors text-left"
      >
        <Users size={18} className="text-gold flex-shrink-0" />
        <p className="text-sm">
          {role === "child" ? (
            <>
              <span className="font-medium">Invite your Investment Partner</span> — usually a
              parent or guardian — to unlock Compete/Compare.
            </>
          ) : (
            <>
              <span className="font-medium">Invite your child</span> to play alongside you and
              unlock Compete/Compare.
            </>
          )}
        </p>
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
