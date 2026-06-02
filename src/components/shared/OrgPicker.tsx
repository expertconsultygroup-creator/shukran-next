"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, X, Plus, ArrowLeft } from "lucide-react";
import { ORG_CATEGORIES } from "@/data/organizations";

export function OrgPicker({
  category,
  value,
  onChange,
  placeholder,
  emptyText,
  otherLabel,
  customPlaceholder,
}: {
  category: string;
  value: string;
  onChange: (name: string) => void;
  placeholder: string;
  emptyText: string;
  otherLabel: string;
  customPlaceholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => ORG_CATEGORIES.find((c) => c.id === category)?.items ?? [],
    [category]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((it) => it.name.includes(q) || (it.emirate ?? "").includes(q));
  }, [items, query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Free-text mode for organizations not present in the list.
  if (custom) {
    return (
      <div className="relative">
        <div className="flex items-center rounded-lg overflow-hidden border-b-2 border-[var(--gold)] bg-[var(--input-glass)]">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={customPlaceholder}
            className="flex-1 min-w-0 bg-transparent text-[var(--text-on-input)] px-4 py-3 focus:ring-0 focus:outline-none placeholder:text-[var(--muted)] text-start"
            dir="auto"
            maxLength={200}
          />
          <button
            type="button"
            onClick={() => {
              setCustom(false);
              onChange("");
            }}
            className="flex items-center gap-1 px-3 py-3 text-xs text-[var(--muted)] hover:text-[var(--gold)] shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-[var(--input-glass)] border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 py-3 rounded-lg focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors cursor-pointer text-start"
        dir="auto"
      >
        <span className={value ? "text-[var(--text-on-input)]" : "text-[var(--muted)]"}>
          {value || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && (
            <X
              className="w-4 h-4 text-[var(--muted)] hover:text-[var(--white)]"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            />
          )}
          <ChevronDown className="w-5 h-5 text-[var(--muted)]" />
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 bg-[var(--input-glass)] rounded-lg px-3">
              <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-[var(--text-on-input)] py-2.5 text-sm focus:ring-0 focus:outline-none placeholder:text-[var(--muted)] text-start"
                dir="auto"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--muted)] text-center">{emptyText}</li>
            ) : (
              filtered.map((it) => (
                <li key={it.name}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(it.name);
                      setQuery("");
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-start transition-colors hover:bg-[var(--gold-dim)] ${
                      value === it.name ? "text-[var(--gold)]" : "text-[var(--white)]"
                    }`}
                    dir="auto"
                  >
                    <span className="flex flex-col items-start">
                      <span className="font-bold">{it.name}</span>
                      {it.emirate && (
                        <span className="text-xs text-[var(--muted)]">{it.emirate}</span>
                      )}
                    </span>
                    {value === it.name && <Check className="w-4 h-4 text-[var(--gold)] shrink-0" />}
                  </button>
                </li>
              ))
            )}
          </ul>
          {/* Other / not listed */}
          <button
            type="button"
            onClick={() => {
              setCustom(true);
              setQuery("");
              setOpen(false);
              onChange("");
            }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-[var(--gold)] border-t border-[var(--border)] hover:bg-[var(--gold-dim)] transition-colors text-start"
            dir="auto"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {otherLabel}
          </button>
        </div>
      )}
    </div>
  );
}
