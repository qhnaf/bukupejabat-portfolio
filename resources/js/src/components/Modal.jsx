import React, { useEffect, useId, useRef } from "react";

export default function Modal({ open, onClose, title, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  // Pindahkan fokus ke dialog saat dibuka; kembalikan ke pemicu saat ditutup.
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    };
  }, [open]);

  // Tutup modal dengan tombol Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 focus:outline-none"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id={titleId} className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="text-slate-500 hover:text-slate-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
