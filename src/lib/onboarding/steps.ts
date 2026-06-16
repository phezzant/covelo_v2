import type { UserRole } from "@/types/database";

export type OnboardingStep = {
  id: number;
  tab: "portfolio" | "research" | "compete" | "profile";
  title: string;
  body: string;
  // CSS selector of the element to spotlight on the page, if any
  targetSelector?: string;
};

const CHILD_STEPS: OnboardingStep[] = [
  {
    id: 1,
    tab: "portfolio",
    title: "Welcome to Covelo",
    body: "Let's get you set up. This will only take a minute.",
  },
  {
    id: 2,
    tab: "portfolio",
    title: "You've got $10,000 to play with",
    body: "That's your starting cash. Everything from here is about deciding what to do with it.",
    targetSelector: "[data-tour='portfolio-summary']",
  },
  {
    id: 3,
    tab: "portfolio",
    title: "Make your first trade",
    body: "Head to Research & Trade to buy your first shares.",
    targetSelector: "[data-tour='nav-research']",
  },
  {
    id: 4,
    tab: "research",
    title: "Browse Top Picks",
    body: "These are companies other players are buying. CBA is a good place to start — it's one of Australia's biggest banks.",
    targetSelector: "[data-tour='top-picks']",
  },
  {
    id: 5,
    tab: "research",
    title: "Tap a company to see more",
    body: "You'll see the current price, how it's moved recently, and how much you can buy.",
    targetSelector: "[data-tour='instrument-list']",
  },
  {
    id: 6,
    tab: "profile",
    title: "Now let's build your profile",
    body: "Pick an avatar and a username — this is how you'll show up on the leaderboard.",
    targetSelector: "[data-tour='profile-editor']",
  },
  {
    id: 7,
    tab: "portfolio",
    title: "Invite your Investment Partner",
    body: "Because it involves big decisions, we recommend partnering with an adult — Mum, Dad, Grandpa, etc. You'll need them to unlock Compete & Compare.",
    targetSelector: "[data-tour='partner-banner']",
  },
  {
    id: 8,
    tab: "portfolio",
    title: "You're all set",
    body: "Head back to your Portfolio any time to see how your money's performing.",
  },
];

const ADULT_STEPS: OnboardingStep[] = [
  {
    id: 1,
    tab: "portfolio",
    title: "Welcome to Covelo",
    body: "You're here to help a child learn to invest — and maybe play a bit yourself.",
  },
  {
    id: 2,
    tab: "portfolio",
    title: "Your $10,000 practice balance",
    body: "If you'd like to play alongside your child, this is your own starting cash. Your role is mostly oversight and mentorship — playing yourself is optional.",
    targetSelector: "[data-tour='portfolio-summary']",
  },
  {
    id: 6,
    tab: "profile",
    title: "Set up your profile",
    body: "Pick an avatar and username — your child will see this when you're linked.",
    targetSelector: "[data-tour='profile-editor']",
  },
  {
    id: 7,
    tab: "portfolio",
    title: "Invite your child",
    body: "Bring them onto Covelo so you can mentor them and unlock Compete & Compare together.",
    targetSelector: "[data-tour='partner-banner']",
  },
  {
    id: 8,
    tab: "portfolio",
    title: "You're all set",
    body: "Once your child accepts, you'll see their progress here too.",
  },
];

export function getOnboardingSteps(role: UserRole): OnboardingStep[] {
  return role === "child" ? CHILD_STEPS : ADULT_STEPS;
}
