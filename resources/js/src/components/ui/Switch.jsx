import React from "react";

/**
 * Toggle switch (saklar On/Off).
 *
 * @param checked   status toggle (true = On)
 * @param onChange  dipanggil dengan boolean baru saat user menekan switch
 * @param disabled  nonaktifkan switch
 * @param label     teks aksesibilitas (aria-label) bila tidak ada label visual
 * @param id        id elemen input (opsional)
 */
export default function Switch({
    checked,
    onChange,
    disabled = false,
    label,
    id,
}) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                id={id}
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                disabled={disabled}
                aria-label={label}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
        </label>
    );
}
