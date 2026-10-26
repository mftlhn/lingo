"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";

export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 3500);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="toast toast-end toast-bottom z-50">
      <div role="status" aria-live="polite" className="alert alert-success shadow-lg">
        <Check size={18} />
        <span>{message}</span>
        <button className="btn btn-ghost btn-xs btn-circle" onClick={onDismiss} aria-label="Tutup notifikasi">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
