import React from "react";

const cx = (...args) => args.filter(Boolean).join(" ");

/**
 * Kartu putih seragam (kontainer panel/section).
 *
 * @param className kelas tambahan (di-merge di belakang style dasar)
 * @param padding   false → tanpa padding bawaan (jika child yang atur sendiri)
 */
export default function Card({
    className = "",
    padding = true,
    children,
    ...props
}) {
    return (
        <div
            className={cx(
                "bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-700",
                padding && "p-6",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
