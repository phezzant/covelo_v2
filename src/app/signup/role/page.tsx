import { AuthShell } from "@/components/ui/auth-shell";
import { RoleSelector } from "@/components/app/role-selector";

const roleStepTitle = (
  <>
    <span className="block">Real stocks.</span>
    <span className="block font-normal opacity-40">Practice money.</span>
    <span className="block text-gold">Serious bragging rights.</span>
  </>
);

export default function CompleteSignupPage() {
  return (
    <AuthShell
      title={roleStepTitle}
      subtitle="Pick real stocks, build a portfolio, and go head to head with someone in your life — without risking a cent."
    >
      <div className="bg-ink-light border border-parchment/10 rounded-2xl p-5 mb-6">
        <p className="text-sm text-parchment-dim leading-relaxed">
          You&apos;ll each manage your own portfolio, tracking the same market, competing for the
          top spot. Which one are you?
        </p>
      </div>
      <RoleSelector />
    </AuthShell>
  );
}
