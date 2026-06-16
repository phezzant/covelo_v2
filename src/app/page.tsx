import Link from "next/link";
import { TickerStrip } from "@/components/landing/ticker-strip";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      <nav className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-6xl w-full mx-auto">
        <span className="font-display text-2xl font-semibold tracking-tight">Covelo</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-parchment-dim hover:text-parchment transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-gold text-ink px-4 py-2 rounded-full hover:bg-gold/90 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto py-16 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold mb-6">
          Collaborate · Compare · Compete
        </p>
        <h1 className="font-display text-5xl sm:text-7xl leading-[1.05] tracking-tight mb-6">
          Learn to invest,
          <br />
          <span className="italic text-parchment-dim">together.</span>
        </h1>
        <p className="text-lg text-parchment-dim max-w-xl mb-10 leading-relaxed">
          Covelo pairs a child with an Investment Partner — a parent, grandparent,
          or mentor — for a real paper-trading game built on real markets. No
          lectures. Just a shared portfolio, and a reason to talk about money.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="bg-gold text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-gold/90 transition-colors"
          >
            Start playing — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="border border-parchment/20 text-parchment font-semibold px-8 py-3.5 rounded-full hover:bg-parchment/5 transition-colors"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <TickerStrip />

      <section className="grid sm:grid-cols-3 gap-px bg-parchment/10 max-w-6xl w-full mx-auto">
        {[
          {
            label: "For the player",
            title: "Start with $10,000 in practice money",
            body: "Trade real companies at real prices, build a portfolio, and unlock new instruments as you prove you know what you're doing.",
          },
          {
            label: "For the partner",
            title: "Mentor without lecturing",
            body: "Get a window into what your child is learning — and an easy opener for a conversation you didn't know how to start.",
          },
          {
            label: "For both of you",
            title: "Compete as a team",
            body: "Once you're linked, take on other families on the leaderboard. Your decisions, your scoreboard.",
          },
        ].map((card) => (
          <div key={card.label} className="bg-ink p-8 sm:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted mb-4">
              {card.label}
            </p>
            <h3 className="font-display text-2xl mb-3">{card.title}</h3>
            <p className="text-parchment-dim text-sm leading-relaxed">{card.body}</p>
          </div>
        ))}
      </section>

      <footer className="text-center py-10 text-xs text-ink-muted font-mono">
        Covelo — prototype build. All prices shown are illustrative, not real market data.
      </footer>
    </main>
  );
}
