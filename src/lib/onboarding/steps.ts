import type { UserRole } from "@/types/database";

export type OnboardingStep = {
  id: number;
  /** Which tab/route this step belongs to. */
  tab: "portfolio" | "trade" | "compete" | "profile";
  title: string;
  body: string;
  /** Logical action that advances this step (fired by a real UI control). */
  requiredAction: string;
  /** Extra interactions permitted at this step; everything else is gated off. */
  allow?: string[];
  /** Element to spotlight, if any. */
  anchor?: string;
  /**
   * Guidance is rendered inline on the page (a blended banner) rather than as a
   * floating tour card. The tour still draws the spotlight around `anchor`.
   */
  inline?: boolean;
  /** Guidance is rendered by an overlay (trade overlay). Tour shows nothing. */
  inOverlay?: boolean;
  /** Terminal celebration step — not counted in "step X of N". */
  terminal?: boolean;
  /** Render a Continue button in the card (advances via "continue"). */
  showContinue?: boolean;
};

const CHILD_STEPS: OnboardingStep[] = [
  {
    id: 1,
    tab: "portfolio",
    title: "Welcome to Covelo",
    body:
      "This is your home base — a snapshot of everything you own and how it's doing. " +
      "You've been given $10,000 in cash to start, but you don't own any stocks yet. " +
      "Let's fix that. Tap the gold button to go buy your first stock.",
    requiredAction: "goto-trade",
    allow: [],
    anchor: "[data-tour='portfolio-cta']",
    inline: true,
  },
  {
    id: 2,
    tab: "trade",
    title: "This is the Trade tab",
    body:
      "This is where you research companies and decide which ones you want to buy and sell. " +
      "Below are the Top Picks — the hottest companies right now, the ones other people are " +
      "buying. Have a look and pick one you'd like to own a piece of.",
    requiredAction: "select-pick",
    allow: [],
    anchor: "[data-tour='top-picks']",
    inline: true,
  },
  {
    id: 3,
    // Buy form — rendered inside the trade overlay.
    tab: "trade",
    title: "Buy your first shares",
    body:
      "Owning a small piece of a company is called buying Shares. The largest amount is " +
      "already selected, so you can just tap Confirm buy — or choose a smaller amount first.",
    requiredAction: "confirm-buy",
    allow: ["pick-amount"],
    inOverlay: true,
  },
  {
    id: 4,
    // Celebration — rendered inside the trade overlay.
    tab: "trade",
    title: "You're an investor now!",
    body: "Congratulations — you own your first piece of a company.",
    requiredAction: "goto-profile-setup",
    inOverlay: true,
    terminal: true,
  },
  {
    id: 5,
    tab: "compete",
    title: "Set up your profile",
    body:
      "Covelo is all about competing with friends and family — whoever makes the most money " +
      "wins. Before you compete, set up how you'll appear to everyone else. Pick an avatar and " +
      "a leaderboard username, then save.",
    requiredAction: "save-profile",
    allow: ["edit-profile"],
    anchor: "[data-tour='profile-editor']",
    inline: true,
  },
  {
    id: 6,
    tab: "profile",
    title: "Invite your teammate",
    body:
      "Your teammate is a special player — someone you compete with, but also an ally " +
      "you work with to take on others. It's an important choice: they need to be 18 or older, " +
      "and ideally someone with a bit of experience. Mum or Dad is usually a great pick.",
    requiredAction: "send-invite",
    allow: ["open-invite"],
    anchor: "[data-tour='invite-entry']",
    inline: true,
  },
  {
    id: 7,
    tab: "portfolio",
    title: "You're all set",
    body:
      "You've bought your first stock, set up your profile, and invited your teammate. " +
      "When they join, Compete & Compare unlocks for both of you. Welcome to Covelo!",
    requiredAction: "continue",
    showContinue: true,
    terminal: true,
  },
];

const ADULT_STEPS: OnboardingStep[] = [
  {
    id: 1,
    tab: "portfolio",
    title: "Welcome to Covelo",
    body:
      "You're here to help a child learn to invest — and you can play alongside them. This is " +
      "your home base, with your own $10,000 practice balance. Playing yourself is optional; " +
      "your main role is mentor.",
    requiredAction: "continue",
    showContinue: true,
    anchor: "[data-tour='portfolio-cta']",
  },
  {
    id: 5,
    tab: "compete",
    title: "Set up your profile",
    body:
      "Pick an avatar and a leaderboard username — this is how your child will see you once " +
      "you're linked. Save when you're done.",
    requiredAction: "save-profile",
    allow: ["edit-profile"],
    anchor: "[data-tour='profile-editor']",
    inline: true,
  },
  {
    id: 6,
    tab: "profile",
    title: "Invite your child",
    body:
      "Bring your child onto Covelo so you can mentor them and unlock Compete & Compare " +
      "together. Add their name and email to send the invite.",
    requiredAction: "send-invite",
    allow: ["open-invite"],
    anchor: "[data-tour='invite-entry']",
    inline: true,
  },
  {
    id: 7,
    tab: "portfolio",
    title: "You're all set",
    body:
      "Once your child accepts, you'll see their progress here and Compete & Compare opens up " +
      "for both of you. Welcome to Covelo!",
    requiredAction: "continue",
    showContinue: true,
    terminal: true,
  },
];

export function getOnboardingSteps(role: UserRole): OnboardingStep[] {
  return role === "child" ? CHILD_STEPS : ADULT_STEPS;
}
