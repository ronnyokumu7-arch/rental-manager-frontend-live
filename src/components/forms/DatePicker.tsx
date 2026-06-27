// src/components/forms/DatePicker.tsx
"use client";
import React from "react";

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
  min,
  max,
  className = "",
}: DatePickerProps) {
  return (
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      placeholder={placeholder}
      className={`w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${className}`}
    />
  );
}
