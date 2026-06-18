"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, LineChart, Trophy, User } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding/context";

const TABS = [
  { href: "/app/portfolio", label: "Portfolio", icon: TrendingUp },
  { href: "/app/trade", label: "Trade", icon: LineChart },
  { href: "/app/compete", label: "Compete", icon: Trophy },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function TabBar() {
  const pathname = usePathname();
  const { active: onboarding } = useOnboarding();

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 bg-ink-light border-t border-parchment/10 sm:static sm:border-t-0 sm:border-b sm:bg-ink z-30 ${
        onboarding ? "opacity-40 pointer-events-none select-none" : ""
      }`}
      aria-hidden={onboarding ? true : undefined}
    >
      <div className="max-w-3xl mx-auto flex sm:gap-1 sm:px-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              tabIndex={onboarding ? -1 : undefined}
              className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-4 sm:px-4 text-xs sm:text-sm font-medium transition-colors relative ${
                active ? "text-gold" : "text-ink-muted hover:text-parchment-dim"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              <span>{label}</span>
              {active && (
                <span className="hidden sm:block absolute bottom-0 left-4 right-4 h-0.5 bg-gold rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
