import { InputHTMLAttributes } from "react";

export function FormField({
  label,
  id,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-parchment-dim mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className="w-full bg-ink-light border border-parchment/15 rounded-lg px-4 py-2.5 text-parchment placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-colors"
        {...props}
      />
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className="w-full bg-gold text-ink font-semibold py-3 rounded-full hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
