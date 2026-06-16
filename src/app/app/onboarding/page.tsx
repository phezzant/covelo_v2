import { redirect } from "next/navigation";

// The guided tutorial is implemented as an overlay (OnboardingTour) inside
// the /app layout, not as its own page — it navigates the user between
// real tabs while spotlighting real CTAs. This route just sends people to
// the Portfolio tab, where the tour picks up automatically based on
// profile.onboarding_completed / onboarding_step.
export default function OnboardingRedirect() {
  redirect("/app/portfolio");
}
