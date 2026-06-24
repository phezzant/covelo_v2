"use client";

import { useState, useTransition } from "react";
import { Clock, Mail, Link2, Trash2, PencilLine, Check, Copy } from "lucide-react";
import { Overlay } from "@/components/app/overlay";
import { FormField, PrimaryButton } from "@/components/ui/form";
import { cancelInvite, updateInviteEmail } from "@/lib/actions/invite";
import type { JourneyPartner } from "@/types/database";

/**
 * Pending invite state rendered in the Profile tab.
 *
 * Actions available:
 *  1. Copy a share link (immediate alternative to email — no SMTP needed)
 *  2. Change the email address on the invite
 *  3. Cancel the invite (deletes the row so a new one can be created)
 *
 * Email sending is NOT triggered from here — that requires a Supabase Edge
 * Function (see /supabase/functions/send-invite-email/). The share link is
 * the practical workaround until that is deployed.
 */
export function PendingInviteManager({
  pendingPartner,
  inviteBaseUrl,
}: {
  pendingPartner: JourneyPartner;
  inviteBaseUrl: string;
}) {
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Share link: deep-link that pre-fills the adult's email on signup/login.
  // Format: /signup?invite=<inviteId>&email=<invited_email>
  // The adult lands on signup, sees their email pre-filled, creates an account,
  // and the linkage logic matches on invited_email.
  const shareUrl = `${inviteBaseUrl}/signup?invite=${pendingPartner.id}&email=${encodeURIComponent(pendingPartner.invited_email ?? "")}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelInvite(pendingPartner.id);
      setShowCancelConfirm(false);
    });
  }

  const waitingOn = pendingPartner.invited_name ?? "your Investment Partner";

  return (
    <>
      {/* ── Status strip ─────────────────────────────── */}
      <div className="bg-ink-light border border-parchment/10 rounded-xl px-4 py-3 mb-3">
        <div className="flex items-start gap-3">
          <Clock size={18} className="text-ink-muted flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-parchment-dim">
              Waiting on{" "}
              <span className="font-medium text-parchment">{waitingOn}</span> to
              confirm.
            </p>
            {pendingPartner.invited_email && (
              <p className="text-xs text-ink-muted mt-0.5 truncate">
                Sent to {pendingPartner.invited_email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Action tiles ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-2">
        {/* Copy share link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-3 bg-ink-light border border-parchment/10 rounded-xl px-4 py-3 hover:border-gold/30 transition-colors text-left w-full"
        >
          {copied ? (
            <Check size={18} className="text-gain flex-shrink-0" />
          ) : (
            <Link2 size={18} className="text-gold flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium">
              {copied ? "Link copied!" : "Copy invite link"}
            </p>
            <p className="text-xs text-parchment-dim mt-0.5">
              Share directly — they tap it to join Covelo
            </p>
          </div>
          {!copied && (
            <Copy size={14} className="text-ink-muted ml-auto flex-shrink-0" />
          )}
        </button>

        {/* Change email */}
        <button
          onClick={() => setShowChangeEmail(true)}
          className="flex items-center gap-3 bg-ink-light border border-parchment/10 rounded-xl px-4 py-3 hover:border-gold/30 transition-colors text-left w-full"
        >
          <PencilLine size={18} className="text-gold flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Wrong email? Change it</p>
            <p className="text-xs text-parchment-dim mt-0.5">
              Update the address for this invite
            </p>
          </div>
        </button>

        {/* Cancel invite */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="flex items-center gap-3 bg-ink-light border border-loss/20 rounded-xl px-4 py-3 hover:border-loss/40 transition-colors text-left w-full"
        >
          <Trash2 size={18} className="text-loss flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-loss">Cancel invite</p>
            <p className="text-xs text-parchment-dim mt-0.5">
              Start fresh with a different partner
            </p>
          </div>
        </button>
      </div>

      {/* ── Change email overlay ──────────────────────── */}
      {showChangeEmail && (
        <ChangeEmailOverlay
          pendingPartner={pendingPartner}
          onClose={() => setShowChangeEmail(false)}
        />
      )}

      {/* ── Cancel confirm overlay ───────────────────── */}
      {showCancelConfirm && (
        <Overlay onClose={() => setShowCancelConfirm(false)} title="Cancel invite">
          <h2 className="font-display text-2xl mb-2">Cancel this invite?</h2>
          <p className="text-parchment-dim text-sm mb-6">
            The invite to{" "}
            <span className="font-medium text-parchment">
              {pendingPartner.invited_name ?? pendingPartner.invited_email}
            </span>{" "}
            will be removed. You can send a new one whenever you&apos;re ready.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 border border-parchment/20 text-parchment-dim rounded-full py-2.5 text-sm font-medium hover:border-parchment/40 transition-colors"
            >
              Keep it
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1 bg-loss text-white rounded-full py-2.5 text-sm font-semibold hover:bg-loss/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Cancelling…" : "Yes, cancel"}
            </button>
          </div>
        </Overlay>
      )}
    </>
  );
}

/* ── Change email sub-component ───────────────────────────── */
function ChangeEmailOverlay({
  pendingPartner,
  onClose,
}: {
  pendingPartner: JourneyPartner;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(pendingPartner.invited_email ?? "");
  const [name, setName] = useState(pendingPartner.invited_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!email.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await updateInviteEmail(pendingPartner.id, email, name);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
      }
    });
  }

  if (done) {
    return (
      <Overlay onClose={onClose} title="Invite updated">
        <div className="text-center py-4">
          <p className="text-3xl mb-3">✅</p>
          <h2 className="font-display text-2xl mb-2">Invite updated</h2>
          <p className="text-parchment-dim text-sm mb-6">
            The invite now points to{" "}
            <span className="font-medium text-parchment">{email}</span>.
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
    <Overlay onClose={onClose} title="Change invite email">
      <h2 className="font-display text-2xl mb-1">Change invite email</h2>
      <p className="text-parchment-dim text-sm mb-6">
        Update the email address this invite is sent to.
      </p>
      {error && (
        <p className="text-loss text-sm mb-4 bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}
      <FormField
        label="Their name"
        id="change-name"
        type="text"
        placeholder="e.g. Mum, Dad, Billy"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FormField
        label="Their email"
        id="change-email"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="mt-6">
        <PrimaryButton
          type="button"
          loading={isPending}
          onClick={handleSubmit}
          disabled={!email.trim() || isPending}
        >
          Update invite
        </PrimaryButton>
      </div>
    </Overlay>
  );
}
