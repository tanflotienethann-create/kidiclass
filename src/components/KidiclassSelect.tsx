"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
    <div ref={selectRef} className="relative w-full min-w-0">
      {label && (
        <span className="mb-2 block text-sm font-black text-gray-800">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-[68px] w-full items-center justify-between gap-4 rounded-[1.4rem] border-2 bg-white px-5 py-4 text-left text-base font-black shadow-sm outline-none transition ${
          open
            ? "border-[#1db7bd] ring-4 ring-[#1db7bd]/15"
            : "border-[#bfedf0] hover:border-[#1db7bd] hover:bg-[#f8ffff]"
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
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd] transition ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown size={22} strokeWidth={3} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-[99999] mt-3 overflow-hidden rounded-[1.5rem] border border-[#bfedf0] bg-white p-2 shadow-2xl">
          <div className="max-h-72 overflow-y-auto pr-1">
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
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                    isSelected
                      ? "bg-[#1db7bd] text-white"
                      : "text-gray-800 hover:bg-[#e9fbfc] hover:text-[#1db7bd]"
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