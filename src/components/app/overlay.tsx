"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Overlay({
  children,
  onClose,
  title,
  hideClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  hideClose?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !hideClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, hideClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-ink-light rounded-t-3xl sm:rounded-3xl border border-parchment/10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between mb-2">
          <div />
          {!hideClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-ink-muted hover:text-parchment transition-colors p-1 -mr-1"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
