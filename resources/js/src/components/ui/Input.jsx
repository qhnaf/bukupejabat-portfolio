import React from "react";

const cx = (...args) => args.filter(Boolean).join(" ");

const SIZE_CLASSES = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
};

/**
 * Input teks seragam.
 *
 * @param label     Teks label (opsional). Jika diisi, otomatis render <label>.
 * @param id        id input — wajib diisi bila pakai label agar aksesibel.
 * @param size      sm | md
 * @param className kelas tambahan (di-merge di belakang style dasar)
 *
 * Props lain (type, value, onChange, placeholder, required, disabled, ...)
 * diteruskan langsung ke elemen <input>.
 */
export default function Input({
    label,
    id,
    size = "md",
    className = "",
    ...props
}) {
    const input = (
        <input
            id={id}
            className={cx(
                "w-full rounded-xl border border-slate-200 bg-white text-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-sky-300",
                "disabled:bg-slate-50 disabled:text-slate-400",
                SIZE_CLASSES[size] || SIZE_CLASSES.md,
                className,
            )}
            {...props}
        />
    );

    if (!label) return input;

    return (
        <div>
            <label
                htmlFor={id}
                className="block text-xs font-medium text-slate-600 mb-2"
            >
                {label}
            </label>
            {input}
        </div>
    );
}
