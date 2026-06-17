import { TabBar } from "@/components/app/tab-bar";
import { OnboardingTour } from "@/components/app/onboarding-tour";
import { OnboardingProvider } from "@/lib/onboarding/context";
import { getCurrentUserContext } from "@/lib/data/context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, activePartner, pendingPartner, holdingsCount } =
    await getCurrentUserContext();

  const progress = {
    hasHoldings: holdingsCount > 0,
    profileComplete: Boolean(
      profile.display_name?.trim() && profile.username?.trim() && profile.avatar_emoji
    ),
    hasPartnerInvite: Boolean(activePartner || pendingPartner),
  };

  return (
    <OnboardingProvider
      role={profile.role}
      completed={profile.onboarding_completed}
      progress={progress}
    >
      <div className="flex-1 flex flex-col">
        <TabBar />
        <div className="flex-1 pb-20 sm:pb-0">{children}</div>
        <OnboardingTour />
      </div>
    </OnboardingProvider>
  );
}
