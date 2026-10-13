import React from "react";

const cx = (...args) => args.filter(Boolean).join(" ");

const SIZE_CLASSES = {
    sm: "h-9 pl-3 pr-8 text-sm",
    md: "h-10 pl-3 pr-9 text-sm",
    lg: "h-12 pl-4 pr-10 text-sm",
};

// Panah custom (SVG chevron) — menggantikan panah default browser
const ARROW =
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M2.5 4.5 6 8l3.5-3.5'/%3E%3C/svg%3E\") no-repeat right 0.65rem center / 12px";

/**
 * Dropdown (<select>) seragam.
 *
 * @param size       sm | md | lg
 * @param className  kelas tambahan (di-merge di belakang style dasar)
 *
 * Props lain (value, onChange, name, disabled, children ...)
 * diteruskan langsung ke elemen <select>.
 */
export default function Select({
    size = "md",
    className = "",
    children,
    ...props
}) {
    return (
        <select
            className={cx(
                "w-full appearance-none rounded-xl border border-slate-200 bg-white text-slate-600 font-medium",
                "hover:border-slate-300 hover:bg-slate-50",
                "focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 focus:bg-white",
                "transition-all duration-150 cursor-pointer",
                props.disabled &&
                    "bg-slate-50 text-slate-400 cursor-not-allowed hover:border-slate-200 hover:bg-slate-50",
                SIZE_CLASSES[size] || SIZE_CLASSES.md,
                className,
            )}
            style={{ backgroundImage: ARROW }}
            {...props}
        >
            {children}
        </select>
    );
}
