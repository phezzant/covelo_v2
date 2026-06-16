import { getCurrentUserContext } from "@/lib/data/context";
import { ProfileEditor } from "@/components/app/profile-editor";
import { LogoutButton } from "@/components/app/logout-button";

export default async function ProfilePage() {
  const { profile, activePartner, partnerProfile } = await getCurrentUserContext();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="font-display text-3xl mb-1">My Profile</h1>
      <p className="text-parchment-dim text-sm mb-8">
        This is how you show up on the leaderboard.
      </p>

      <ProfileEditor profile={profile} />

      <div className="mt-10 pt-6 border-t border-parchment/10">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted mb-3">
          Account
        </p>
        <div className="flex items-center justify-between bg-ink-light rounded-xl border border-parchment/10 px-4 py-3.5 mb-3">
          <span className="text-sm text-parchment-dim">Role</span>
          <span className="text-sm font-medium capitalize">{profile.role}</span>
        </div>
        <div className="flex items-center justify-between bg-ink-light rounded-xl border border-parchment/10 px-4 py-3.5 mb-3">
          <span className="text-sm text-parchment-dim">Investment Partner</span>
          <span className="text-sm font-medium">
            {activePartner ? partnerProfile?.display_name ?? "Linked" : "Not linked yet"}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </main>
  );
}
