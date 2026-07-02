"use client";

import { useEffect, useRef, useState } from "react";

export interface Option {
  value: string;
  label: string;
}

export default function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-44 items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-4 py-2.5 text-left shadow-soft transition hover:border-blossom"
      >
        <span className="flex flex-col leading-tight">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">
            {label}
          </span>
          <span className="text-sm font-medium text-ink">{current?.label}</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 max-h-72 w-full min-w-[12rem] overflow-auto rounded-2xl border border-black/5 bg-white p-1.5 shadow-soft">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                o.value === value
                  ? "bg-blossom/50 font-semibold text-ink"
                  : "text-ink/80 hover:bg-babyblue/40"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
