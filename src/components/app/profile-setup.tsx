"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOnboarding } from "@/lib/onboarding/context";
import type { Profile } from "@/types/database";

const EMOJI_OPTIONS = ["🦊", "🐯", "🦁", "🐼", "🦉", "🐺", "🦅", "🐢", "🦈", "🐬"];

/**
 * Captures the user's own name (display_name) and avatar. This is the identity
 * the user and their teammate see — distinct from the leaderboard username,
 * which is set later on the Compete tab (paid tier). Firing `save-profile`
 * advances the onboarding profile step.
 */
export function ProfileSetup({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const { fire } = useOnboarding();

  const [emoji, setEmoji] = useState(profile.avatar_emoji);
  const [name, setName] = useState(profile.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0;

  async function handleSave() {
    if (!canSave) {
      setError("Please enter your name.");
      return;
    }
    setError(null);
    setSaving(true);
    setSaved(false);
    const { error: saveError } = await supabase
      .from("profiles")
      .update({ avatar_emoji: emoji, display_name: name.trim() })
      .eq("id", profile.id);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSaved(true);
    router.refresh();
    fire("save-profile");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div
      data-tour="profile-setup"
      className="bg-ink-light border border-parchment/10 rounded-2xl p-6"
    >
      <p className="text-sm text-parchment-dim mb-3">Choose an avatar</p>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {EMOJI_OPTIONS.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`text-2xl py-2.5 rounded-xl border transition-colors ${
              emoji === e ? "border-gold bg-gold/10" : "border-parchment/10 hover:border-parchment/25"
            }`}
            aria-label={`Choose ${e} as avatar`}
          >
            {e}
          </button>
        ))}
      </div>

      <label htmlFor="display-name" className="block text-sm text-parchment-dim mb-1.5">
        Your name
      </label>
      <input
        id="display-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="What should we call you?"
        className="w-full bg-ink border border-parchment/15 rounded-lg px-4 py-2.5 text-parchment placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-colors mb-4"
      />

      {error && (
        <p className="text-loss text-sm mb-4 bg-loss/10 border border-loss/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-gold text-ink font-semibold px-6 py-2.5 rounded-full hover:bg-gold/90 transition-colors text-sm disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </div>
  );
}
