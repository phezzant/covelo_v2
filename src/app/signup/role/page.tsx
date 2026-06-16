import { AuthShell } from "@/components/ui/auth-shell";
import { RoleSelector } from "@/components/app/role-selector";

export default function CompleteSignupPage() {
  return (
    <AuthShell
      title="One more thing"
      subtitle="Are you the one learning to invest, or the one helping someone learn?"
    >
      <RoleSelector />
    </AuthShell>
  );
}
