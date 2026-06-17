import type { UserRole } from "@/types/database";

export type OnboardingStep = {
  id: number;
  tab: "portfolio" | "research" | "compete" | "profile";
  title: string;
  body: string;
  /**
   * The logical action that satisfies this step. A real UI control fires it
   * via useOnboarding().fire(actionId); when it matches, the flow advances.
   * Use "continue" for steps advanced by the tutorial's own Continue button.
   */
  requiredAction: string;
  /** Extra interactions permitted at this step (everything else is disabled). */
  allow?: string[];
  /** Selector of the element to spotlight, if any. */
  anchor?: string;
  /** Where the tutorial text card sits relative to the spotlight. */
  placement?: "top" | "bottom" | "center";
  /**
   * The step's guidance is rendered by an overlay component (e.g. the trade
   * overlay) rather than the tour card, because the relevant UI lives above
   * the tour in the stacking order. The tour suppresses its own card.
   */
  inOverlay?: boolean;
  /** Render a Continue button in the card (advances via "continue"). */
  showContinue?: boolean;
};

const CHILD_STEPS: OnboardingStep[] = [
  {
    id: 1,
    tab: "portfolio",
    title: "Welcome to Covelo",
    body:
      "This is your home base — where you can see how your portfolio is performing. " +
      "You've been handed $10,000 in cash to start, but you don't own any stocks yet. " +
      "Don't worry about taking it all in. Let's dive in and buy your first stock — " +
      "it'll make a lot more sense once you see what happens.",
    requiredAction: "goto-research",
    allow: [],
    anchor: "[data-tour='portfolio-spotlight']",
    placement: "bottom",
  },
  {
    id: 2,
    tab: "research",
    title: "This is the Research tab",
    body:
      "This is where you find out whether a company is worth investing in. " +
      "If you like the look of one, you can buy a piece of it. " +
      "Let's start by browsing some of today's Top Picks.",
    requiredAction: "reveal-top-picks",
    allow: [],
    anchor: "[data-tour='reveal-cta']",
    placement: "bottom",
  },
  {
    id: 3,
    tab: "research",
    title: "Today's Top Picks",
    body:
      "These are the companies people are most interested in right now. They're making " +
      "waves — you might even recognise some from the news. Swipe through and tap one " +
      "that looks interesting to you.",
    requiredAction: "select-pick",
    allow: [],
    anchor: "[data-tour='top-picks']",
    placement: "bottom",
  },
  {
    id: 4,
    // Guidance is rendered inside the trade overlay (which sits above the tour).
    tab: "research",
    title: "Buy your first shares",
    body:
      "Owning a small piece of a company is called buying Shares. Pick an amount, then " +
      "tap Buy. If the company does well, the value of your portfolio goes up. Give it a " +
      "go — you can always sell later if you change your mind.",
    requiredAction: "confirm-buy",
    allow: ["pick-amount"],
    inOverlay: true,
  },
  {
    id: 5,
    tab: "profile",
    title: "Nice — you're an investor now",
    body:
      "You own your first stock. Now let's set up your profile so you show up on the " +
      "leaderboard. Add your name, pick an avatar, and choose a username — then save.",
    requiredAction: "save-profile",
    allow: ["edit-profile"],
    anchor: "[data-tour='profile-editor']",
    placement: "top",
  },
  {
    id: 6,
    tab: "compete",
    title: "Invite your Investment Partner",
    body:
      "Last step. Investing big decisions is better with a grown-up you trust — Mum, Dad, " +
      "a grandparent. Add their name and email and we'll invite them to join you. Once " +
      "they're in, Compete & Compare unlocks.",
    requiredAction: "send-invite",
    allow: ["open-invite"],
    anchor: "[data-tour='invite-entry']",
    placement: "top",
  },
  {
    id: 7,
    tab: "portfolio",
    title: "You're all set",
    body:
      "You've got a portfolio with your first stock, a profile that's ready to go, and " +
      "your Investment Partner invited. When they join, you'll be able to compete and " +
      "compare. Welcome to Covelo.",
    requiredAction: "continue",
    showContinue: true,
    placement: "center",
  },
];

const ADULT_STEPS: OnboardingStep[] = [
  {
    id: 1,
    tab: "portfolio",
    title: "Welcome to Covelo",
    body:
      "You're here to help a child learn to invest — and you can play alongside them if " +
      "you like. This is your home base. You've got your own $10,000 practice balance; " +
      "using it yourself is optional, your main role is mentorship.",
    requiredAction: "continue",
    showContinue: true,
    anchor: "[data-tour='total-value']",
    placement: "bottom",
  },
  {
    id: 5,
    tab: "profile",
    title: "Set up your profile",
    body:
      "Add your name, pick an avatar, and choose a username. This is how your child will " +
      "see you once you're linked. Save when you're done.",
    requiredAction: "save-profile",
    allow: ["edit-profile"],
    anchor: "[data-tour='profile-editor']",
    placement: "top",
  },
  {
    id: 6,
    tab: "compete",
    title: "Invite your child",
    body:
      "Bring your child onto Covelo so you can mentor them and unlock Compete & Compare " +
      "together. Add their name and email to send the invite.",
    requiredAction: "send-invite",
    allow: ["open-invite"],
    anchor: "[data-tour='invite-entry']",
    placement: "top",
  },
  {
    id: 7,
    tab: "portfolio",
    title: "You're all set",
    body:
      "Once your child accepts, you'll see their progress here and Compete & Compare " +
      "opens up for both of you. Welcome to Covelo.",
    requiredAction: "continue",
    showContinue: true,
    placement: "center",
  },
];

export function getOnboardingSteps(role: UserRole): OnboardingStep[] {
  return role === "child" ? CHILD_STEPS : ADULT_STEPS;
}
