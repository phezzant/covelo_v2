import { Clock, CheckCircle2 } from "lucide-react";
import type { JourneyPartner, UserRole } from "@/types/database";

/**
 * Portfolio-tab status strip. Inviting now happens on the Profile tab, so this
 * only reflects partner status (active / pending) and renders nothing otherwise.
 */
export function PartnerBanner({
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
    const waitingOn = pendingPartner.invited_name ?? "your invite";
    return (
      <div className="flex items-center gap-3 bg-ink-light border border-parchment/10 rounded-xl px-4 py-3">
        <Clock size={18} className="text-ink-muted flex-shrink-0" />
        <p className="text-sm text-parchment-dim">
          Waiting on <span className="font-medium text-parchment">{waitingOn}</span> to confirm as
          your Investment Partner.
        </p>
      </div>
    );
  }

  return null;
}
