"use client";

import React from "react";
import { Filter, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onClearAll?: () => void;
}

export default function FilterBar({ filters, onClearAll }: FilterBarProps) {
  const activeCount = filters.filter((f) => f.value !== null).length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-ink-muted">
        <Filter size={16} strokeWidth={1.8} />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {filters.map((filter) => (
        <div key={filter.id} className="relative">
          <select
            value={filter.value || ""}
            onChange={(e) => filter.onChange(e.target.value || null)}
            className={`input pl-3 pr-8 py-1.5 text-sm font-medium appearance-none cursor-pointer
              ${filter.value ? "bg-accent-bg text-accent-dark border-accent/30" : ""}`}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {filter.value && (
            <button
              onClick={() => filter.onChange(null)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      ))}

      {activeCount > 0 && onClearAll && (
        <button
          onClick={onClearAll}
          className="btn-ghost btn-sm text-danger hover:bg-danger-bg"
        >
          Clear all ({activeCount})
        </button>
      )}
    </div>
  );
}
