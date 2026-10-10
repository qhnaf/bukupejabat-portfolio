import React from "react";

const cx = (...args) => args.filter(Boolean).join(" ");

const SIZE_CLASSES = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    // Tinggi tetap 48px (h-12) seperti desain PengaturanAkun.
    lg: "px-4 h-12 text-sm",
};

/**
 * Input teks seragam.
 *
 * @param label     Teks label (opsional). Jika diisi, otomatis render <label>.
 * @param id        id input — wajib diisi bila pakai label agar aksesibel.
 * @param size      sm | md | lg
 * @param icon      Elemen React (biasanya <svg>) yang ditampilkan di depan input.
 * @param className kelas tambahan (di-merge di belakang style dasar)
 *
 * Props lain (type, value, onChange, placeholder, required, disabled, name ...)
 * diteruskan langsung ke elemen <input>.
 */
export default function Input({
    label,
    id,
    size = "md",
    icon = null,
    className = "",
    ...props
}) {
    const field = (
        <div
            className={cx(
                "flex items-center gap-3 rounded-xl border border-slate-200 bg-white",
                "focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all",
                props.disabled && "bg-slate-50 cursor-not-allowed",
                SIZE_CLASSES[size] || SIZE_CLASSES.md,
            )}
        >
            {icon && (
                <span
                    className={cx(
                        "shrink-0 text-slate-400",
                        size === "lg" ? "pl-4" : "pl-3",
                    )}
                    aria-hidden="true"
                >
                    {icon}
                </span>
            )}
            <input
                id={id}
                className={cx(
                    "w-full bg-transparent text-slate-700 focus:outline-none",
                    icon ? "pr-4" : "px-0",
                    props.disabled && "text-slate-400",
                    // Padding kiri input mengikuti keberadaan icon.
                    !icon && "pl-0",
                    "py-0", // tinggi sudah diatur container lewat size
                    className,
                )}
                {...props}
            />
        </div>
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
