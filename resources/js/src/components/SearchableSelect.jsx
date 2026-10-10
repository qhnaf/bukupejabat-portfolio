import React, { useState, useRef, useEffect, useId } from "react";

export default function SearchableSelect({ options, value, onChange, placeholder = "Pilih...", className = "", disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const listboxId = useId();

    const selectedOption = options.find(o => String(o.value) === String(value));
    const displayValue = selectedOption ? selectedOption.label : "";

    const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Gulir opsi aktif ke tampilan saat navigasi keyboard.
    useEffect(() => {
        if (!isOpen || activeIndex < 0) return;
        const el = wrapperRef.current?.querySelector('[data-active="true"]');
        el?.scrollIntoView({ block: "nearest" });
    }, [activeIndex, isOpen]);

    const openDropdown = () => {
        if (disabled) return;
        setIsOpen(true);
        setSearch("");
        const idx = options.findIndex(o => String(o.value) === String(value));
        setActiveIndex(idx);
    };

    const closeDropdown = () => {
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const selectOption = (opt) => {
        onChange(opt.value);
        closeDropdown();
    };

    const onTriggerKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            openDropdown();
        }
    };

    const onInputKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, filteredOptions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            if (activeIndex >= 0 && filteredOptions[activeIndex]) {
                e.preventDefault();
                selectOption(filteredOptions[activeIndex]);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            closeDropdown();
        }
    };

    return (
        <div ref={wrapperRef} className={`relative w-full ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`${className} flex justify-between items-center ${disabled ? "bg-slate-50 cursor-not-allowed" : "cursor-pointer"} rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500`}
                onClick={() => (isOpen ? closeDropdown() : openDropdown())}
                onKeyDown={onTriggerKeyDown}
            >
                <span className={`truncate ${displayValue ? "" : "opacity-60"}`}>
                    {displayValue || placeholder}
                </span>
                <svg className="w-4 h-4 ml-2 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto text-sm font-normal">
                    <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                        <input
                            type="text"
                            autoFocus
                            role="combobox"
                            aria-expanded={isOpen}
                            aria-controls={listboxId}
                            aria-activedescendant={
                                activeIndex >= 0 && filteredOptions[activeIndex]
                                    ? `${listboxId}-opt-${activeIndex}`
                                    : undefined
                            }
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-slate-50 text-slate-700"
                            placeholder="Ketik untuk mencari..."
                            aria-label={placeholder}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setActiveIndex(e.target.value ? 0 : -1); }}
                            onKeyDown={onInputKeyDown}
                        />
                    </div>
                    <div className="py-1" id={listboxId} role="listbox" aria-label={placeholder}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, i) => (
                                <div
                                    key={i}
                                    id={`${listboxId}-opt-${i}`}
                                    role="option"
                                    aria-selected={String(opt.value) === String(value)}
                                    data-active={i === activeIndex}
                                    className={`px-3 py-2 cursor-pointer transition-colors ${
                                        i === activeIndex ? "bg-sky-50" : ""
                                    } ${String(opt.value) === String(value) ? "bg-sky-100 text-sky-700 font-bold" : "text-slate-700"}`}
                                    onClick={() => selectOption(opt)}
                                    onMouseEnter={() => setActiveIndex(i)}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-slate-400 italic text-xs">Tidak ada hasil ditemukan</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
