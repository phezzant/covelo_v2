import { TabBar } from "@/components/app/tab-bar";
import { OnboardingTour } from "@/components/app/onboarding-tour";
import { getCurrentUserContext } from "@/lib/data/context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUserContext();

  return (
    <div className="flex-1 flex flex-col">
      <TabBar />
      <div className="flex-1 pb-20 sm:pb-0">{children}</div>
      <OnboardingTour
        role={profile.role}
        initialStep={profile.onboarding_step || 1}
        completed={profile.onboarding_completed}
      />
    </div>
  );
}
