import React from "react";

const cx = (...args) => args.filter(Boolean).join(" ");

/**
 * Textarea seragam (pasangan Input untuk input multi-baris).
 *
 * @param label     Teks label (opsional). Jika diisi, otomatis render <label>.
 * @param id        id textarea — wajib diisi bila pakai label agar aksesibel.
 * @param rows      Jumlah baris tampil (default 3).
 * @param className kelas tambahan (di-merge di belakang style dasar)
 *
 * Props lain (value, onChange, placeholder, required, disabled, name ...)
 * diteruskan langsung ke elemen <textarea>.
 */
export default function Textarea({
    label,
    id,
    rows = 3,
    className = "",
    ...props
}) {
    const field = (
        <textarea
            id={id}
            rows={rows}
            className={cx(
                "w-full rounded-xl border border-slate-200 bg-white px-4 py-3",
                "text-sm text-slate-700 focus:outline-none",
                "focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all",
                "resize-y",
                props.disabled && "bg-slate-50 text-slate-400 cursor-not-allowed",
                className,
            )}
            {...props}
        />
    );

    if (!label) return field;

    return (
        <div className="w-full">
            <label
                htmlFor={id}
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest ml-1 mb-2"
            >
                {label}
            </label>
            {field}
        </div>
    );
}
