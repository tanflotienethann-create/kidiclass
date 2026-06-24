"use client";

import { Check, ChevronDown } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

type KidiclassSelectProps = {
  label?: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function KidiclassSelect({
  label,
  value,
  options,
  placeholder = "Choisir",
  onChange,
}: KidiclassSelectProps) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={selectRef}
      className="relative w-full min-w-0"
      style={
        {
          "--select-accent": "var(--kc-accent, #1db7bd)",
          "--select-soft": "var(--kc-soft, #e9fbfc)",
          "--select-ink": "var(--kc-ink, #075e62)",
        } as CSSProperties
      }
    >
      {label && (
        <span className="mb-2 block text-sm font-black text-gray-800">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-base font-black shadow-sm outline-none transition sm:min-h-[68px] sm:gap-4 sm:rounded-[1.4rem] sm:border-2 sm:px-5 sm:py-4 ${
          open
            ? "border-[var(--select-accent)] ring-4 ring-[var(--select-soft)]"
            : "border-[#d8dde2] hover:border-[var(--select-accent)] hover:bg-[var(--select-soft)]"
        }`}
      >
        <span
          className={`min-w-0 truncate ${
            value ? "text-gray-950" : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </span>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--select-soft)] text-[var(--select-accent)] transition sm:h-11 sm:w-11 ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown size={20} strokeWidth={3} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-[99999] mt-2 overflow-hidden rounded-xl border border-[var(--select-accent)] bg-white p-2 shadow-2xl sm:mt-3 sm:rounded-[1.5rem]">
          <div className="max-h-60 overflow-y-auto pr-1 sm:max-h-72">
            {options.map((option) => {
              const isSelected = option === value;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-black transition sm:rounded-2xl ${
                    isSelected
                      ? "border border-[var(--select-accent)] bg-[var(--select-soft)] text-[var(--select-ink)]"
                      : "text-gray-800 hover:bg-[var(--select-soft)] hover:text-[var(--select-ink)]"
                  }`}
                >
                  <span className="min-w-0 truncate">{option}</span>
                  {isSelected && <Check size={20} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
