import React, { useState, useRef, useEffect, useCallback } from "react";

const cx = (...args) => args.filter(Boolean).join(" ");

const SIZE_CLASSES = {
    sm: "h-9 pl-3 pr-8 text-sm rounded-lg",
    md: "h-10 pl-3 pr-9 text-sm rounded-xl",
    lg: "h-12 pl-4 pr-10 text-sm rounded-xl",
};

const ChevronIcon = ({ open }) => (
    <svg
        className={cx(
            "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
        )}
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

/**
 * Dropdown custom — kotak pilihan fully styled (bukan <select> native).
 *
 * @param size            sm | md | lg
 * @param value           value terpilih saat ini
 * @param onChange        (value) => void
 * @param options         [{ value, label }] atau children
 * @param placeholder     teks saat value null/undefined/""
 * @param className       kelas tambahan untuk trigger
 * @param menuClassName   kelas tambahan untuk menu
 * @param disabled
 */
export default function Dropdown({
    size = "md",
    value,
    onChange,
    options = [],
    placeholder = "Pilih...",
    className = "",
    menuClassName = "",
    disabled = false,
    children,
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const selected = options.find((o) => o.value === value);
    const label = selected ? selected.label : placeholder;

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const onDocClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) close();
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open, close]);

    const onTriggerKeyDown = (e) => {
        if (e.key === "Escape") close();
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
        }
    };

    const onMenuKeyDown = (e) => {
        if (e.key === "Escape") close();
    };

    return (
        <div ref={rootRef} className={cx("relative", className)}>
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen((v) => !v)}
                onKeyDown={onTriggerKeyDown}
                className={cx(
                    "relative w-full flex items-center border bg-white text-left font-medium text-slate-600",
                    "hover:border-slate-300 hover:bg-slate-50",
                    "focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 focus:bg-white",
                    "transition-all duration-150 cursor-pointer",
                    disabled && "bg-slate-50 text-slate-400 cursor-not-allowed hover:border-slate-200",
                    !disabled && (open ? "border-sky-400 ring-4 ring-sky-100 bg-white" : "border-slate-200"),
                    SIZE_CLASSES[size] || SIZE_CLASSES.md,
                    "pr-8",
                )}
            >
                <span className={cx("truncate", !selected && "text-slate-400 font-normal")}>
                    {label}
                </span>
                <ChevronIcon open={open} />
            </button>

            {/* Menu */}
            {open && (
                <div
                    role="listbox"
                    tabIndex={-1}
                    onKeyDown={onMenuKeyDown}
                    className={cx(
                        "absolute z-50 bottom-full mb-1.5 w-full overflow-hidden",
                        "rounded-xl border border-slate-200 bg-white",
                        "shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5",
                        "animate-[dropdown-in_120ms_ease-out]",
                        menuClassName,
                    )}
                    style={{ transformOrigin: "bottom" }}
                >
                    <div className="max-h-60 overflow-y-auto py-1">
                        {options.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <div
                                    key={opt.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onChange?.(opt.value);
                                        close();
                                    }}
                                    className={cx(
                                        "flex h-10 cursor-pointer items-center justify-between px-4 text-sm leading-normal transition-colors",
                                        isSelected
                                            ? "bg-sky-50 text-sky-700 font-semibold"
                                            : "text-slate-600 hover:bg-slate-50",
                                    )}
                                >
                                    <span className="leading-normal">{opt.label}</span>
                                    {isSelected && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                            className="text-sky-500 shrink-0 ml-2"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Keyframe animation */}
            <style>{`
                @keyframes dropdown-in {
                    from { opacity: 0; transform: translateY(4px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
