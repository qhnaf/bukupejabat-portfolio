import React from "react";

const cx = (...args) => args.filter(Boolean).join(" ");

/**
 * Radio button berbentuk kartu (pilihan visual dengan border + sorotan saat dipilih).
 *
 * @param name      nama input radio (untuk pengelompokan)
 * @param value     nilai yang sedang dipilih
 * @param onChange  dipanggil dengan string nilai saat user memilih
 * @param options   daftar opsi: [{ value, label, className }]
 *                  - label opsional (default: value)
 *                  - className untuk mewarnai teks opsi tertentu
 */
export default function ChoiceCard({ name, value, onChange, options = [] }) {
    return (
        <div className="flex gap-3">
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className={cx(
                        "flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-xl py-2.5 bg-slate-50 transition-all",
                        "hover:border-indigo-300 hover:bg-indigo-50",
                        value === opt.value
                            ? "bg-indigo-50 border-indigo-400"
                            : "border-slate-200",
                    )}
                >
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={(e) => onChange?.(e.target.value)}
                        className="w-4 h-4 text-indigo-500 focus:ring-indigo-400"
                    />
                    <span
                        className={cx(
                            "text-sm font-bold font-mono",
                            opt.className || "text-slate-700",
                        )}
                    >
                        {opt.label ?? opt.value}
                    </span>
                </label>
            ))}
        </div>
    );
}
