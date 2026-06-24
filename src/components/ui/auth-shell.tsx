import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="font-display text-2xl font-semibold mb-10">
        Covelo
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-2">{title}</h1>
        <p className="text-parchment-dim text-sm mb-8">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
