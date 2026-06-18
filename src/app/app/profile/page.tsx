import { getCurrentUserContext } from "@/lib/data/context";
import { PartnerSection } from "@/components/app/partner-section";
import { LogoutButton } from "@/components/app/logout-button";
import { RestartTourButton } from "@/components/app/restart-tour-button";
import { OnboardingBanner } from "@/components/app/onboarding-banner";

export default async function ProfilePage() {
  const { profile, activePartner, pendingPartner, partnerProfile } =
    await getCurrentUserContext();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <OnboardingBanner page="profile" />

      <h1 className="font-display text-3xl mb-1">My Profile</h1>
      <p className="text-parchment-dim text-sm mb-8">
        Manage your Investment Partner and account.
      </p>

      <p className="font-mono text-xs uppercase tracking-[0.15em] text-gold mb-3">
        Investment Partner
      </p>
      <PartnerSection
        role={profile.role}
        displayName={profile.display_name ?? ""}
        activePartner={activePartner}
        pendingPartner={pendingPartner}
        partnerName={partnerProfile?.display_name}
      />

      <div className="mt-10 pt-6 border-t border-parchment/10">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted mb-3">
          Account
        </p>
        <div className="flex items-center justify-between bg-ink-light rounded-xl border border-parchment/10 px-4 py-3.5 mb-3">
          <span className="text-sm text-parchment-dim">Name</span>
          <span className="text-sm font-medium">{profile.display_name ?? "Not set"}</span>
        </div>
        <div className="flex items-center justify-between bg-ink-light rounded-xl border border-parchment/10 px-4 py-3.5 mb-3">
          <span className="text-sm text-parchment-dim">Role</span>
          <span className="text-sm font-medium capitalize">{profile.role}</span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <RestartTourButton />
        <LogoutButton />
      </div>
    </main>
  );
}
