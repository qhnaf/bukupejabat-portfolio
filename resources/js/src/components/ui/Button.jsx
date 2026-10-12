import React from "react";

// Gabungkan string className, buang yang kosong/null/false.
// (Pengganti kecil library clsx agar tidak menambah dependency.)
const cx = (...args) => args.filter(Boolean).join(" ");

const VARIANT_CLASSES = {
    primary: "bg-sky-500 text-white hover:bg-sky-600",
    indigo: "bg-indigo-600 text-white hover:bg-indigo-700",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
    success: "bg-emerald-500 text-white hover:bg-emerald-600",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    dark: "bg-slate-800 text-white hover:bg-slate-900",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
    outline:
        "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
    outlineIndigo:
        "bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50",
    softSuccess: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    softDanger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
};

const SIZE_CLASSES = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-sm",
};

/**
 * Tombol seragam untuk seluruh aplikasi.
 *
 * @param variant  primary | indigo | danger | success | dark | ghost | outline | outlineIndigo
 * @param size     sm | md | lg
 * @param fullWidth  true → lebar penuh (mis. tombol submit login)
 * @param className  kelas tambahan (di-merge di belakang variant/size)
 */
export default function Button({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    type = "button",
    disabled = false,
    children,
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={cx(
                "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all cursor-pointer active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-60",
                VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
                SIZE_CLASSES[size] || SIZE_CLASSES.md,
                fullWidth && "w-full",
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
