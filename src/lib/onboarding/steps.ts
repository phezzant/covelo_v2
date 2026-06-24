import type { UserRole } from "@/types/database";

export type OnboardingTab = "home" | "trade" | "compete" | "profile";

export type OnboardingStep = {
  id: number;
  /** Which tab/route this step belongs to. */
  tab: OnboardingTab;
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

// ── Child journey ──────────────────────────────────────────────────────────
// Home (welcome + $10k) → Trade (top picks) → buy → celebrate →
// Profile (own name + avatar) → Profile (invite teammate) → done.
// Note the deliberate change from the earlier flow: the Compete tab is NOT part
// of onboarding. Leaderboard identity / competing sits behind the paid tier and
// is only surfaced to fully-onboarded users.
const CHILD_STEPS: OnboardingStep[] = [
  {
    id: 1,
    tab: "home",
    title: "Welcome to Covelo",
    body:
      "This is your home base — a snapshot of everything you own and how it's doing. " +
      "You've been given $10,000 in cash to start, but you don't own any stocks yet. " +
      "Let's fix that. Tap the gold button to go buy your first stock.",
    requiredAction: "goto-trade",
    allow: [],
    anchor: "[data-tour='home-cta']",
    inline: true,
  },
  {
    id: 2,
    tab: "trade",
    title: "This is the Trade tab",
    body:
      "This is where you find companies to buy. Below are the Top Picks — the hottest " +
      "companies right now, the ones other people are buying. Have a look and pick one " +
      "you'd like to own a piece of.",
    requiredAction: "select-pick",
    allow: [],
    anchor: "[data-tour='top-picks']",
    inline: true,
  },
  {
    id: 3,
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
    tab: "trade",
    title: "You're an investor now!",
    body: "Congratulations — you own your first piece of a company.",
    requiredAction: "to-profile-setup",
    inOverlay: true,
  },
  {
    id: 5,
    tab: "profile",
    title: "Set up your profile",
    body:
      "Add your name and pick an avatar — this is you. Your name is just for you and your " +
      "teammate; it isn't shown on any public leaderboard. Save when you're done.",
    requiredAction: "save-profile",
    allow: ["edit-profile"],
    anchor: "[data-tour='profile-setup']",
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
    tab: "home",
    title: "You're all set",
    body:
      "You've bought your first stock, set up your profile, and invited your teammate. " +
      "When they join, Compete & Compare unlocks for both of you. Welcome to Covelo!",
    requiredAction: "continue",
    showContinue: true,
    terminal: true,
  },
];

// ── Adult journey ──────────────────────────────────────────────────────────
// Priority is linking the account; trading is secondary. Welcome →
// link teammate (invite OR — if they arrived via an invite and are already
// linked — this step is auto-satisfied and skipped) → buy first stock → done.
const ADULT_STEPS: OnboardingStep[] = [
  {
    id: 1,
    tab: "home",
    title: "Welcome to Covelo",
    body:
      "Covelo is a trading game that helps you hone your investment skills. Learn how to " +
      "trade in a real-world environment, put your strategies to the test with real market " +
      "data, then compare your decisions with your teammate to see who comes out on top.",
    requiredAction: "continue",
    showContinue: true,
  },
  {
    id: 2,
    tab: "profile",
    title: "Bring your teammate on board",
    body:
      "The people closest to you will one day make financial decisions without you. Covelo " +
      "gives you a way to be deliberate about that — invite someone now, and the game turns " +
      "your real financial decisions into lessons they'll actually remember.",
    requiredAction: "send-invite",
    allow: ["open-invite"],
    anchor: "[data-tour='invite-entry']",
    inline: true,
  },
  {
    id: 3,
    tab: "trade",
    title: "Now try it yourself",
    body:
      "The best way to mentor is to play alongside them. Below are the Top Picks — pick a " +
      "company you'd like to own a piece of and place your first trade.",
    requiredAction: "select-pick",
    allow: [],
    anchor: "[data-tour='top-picks']",
    inline: true,
  },
  {
    id: 4,
    tab: "trade",
    title: "Place your first trade",
    body:
      "The largest amount is already selected — tap Confirm buy, or choose a smaller amount " +
      "first.",
    requiredAction: "confirm-buy",
    allow: ["pick-amount"],
    inOverlay: true,
  },
  {
    id: 5,
    tab: "trade",
    title: "You're trading now!",
    body: "Nicely done — you've placed your first trade.",
    requiredAction: "to-finish",
    inOverlay: true,
  },
  {
    id: 6,
    tab: "home",
    title: "You're all set",
    body:
      "Once your teammate accepts, you'll see their progress here and Compete & Compare opens " +
      "up for both of you. Welcome to Covelo!",
    requiredAction: "continue",
    showContinue: true,
    terminal: true,
  },
];

export function getOnboardingSteps(role: UserRole): OnboardingStep[] {
  return role === "child" ? CHILD_STEPS : ADULT_STEPS;
}
