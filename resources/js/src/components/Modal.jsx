import React, { useEffect, useId, useRef } from "react";

const SIZE_CLASSES = {
    md: "max-w-lg",
    lg: "max-w-2xl",
};

/**
 * Modal seragam.
 *
 * @param open     true/false — tampilkan/sembunyikan
 * @param onClose  dipanggil saat user menekan Escape / klik backdrop / tombol ✕
 * @param title    judul dialog (dipakai juga untuk aria-labelledby)
 * @param size     md | lg
 * @param children isi modal
 */
export default function Modal({ open, onClose, title, size = "md", children }) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`relative bg-white rounded-2xl shadow-2xl w-full ${
                    SIZE_CLASSES[size] || SIZE_CLASSES.md
                } mx-4 p-6 text-slate-800 max-h-[90vh] overflow-y-auto focus:outline-none`}
            >
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3
                        id={titleId}
                        className="text-xl font-bold text-slate-800"
                    >
                        {title}
                    </h3>
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
