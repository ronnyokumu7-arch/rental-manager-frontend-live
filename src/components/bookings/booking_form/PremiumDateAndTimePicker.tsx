"use client";

import { CalendarDays } from 'lucide-react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import TimePicker from "./TimePicker";
import { formatDateToLocalYYYYMMDD, inputClass, labelClass } from "./constants";

// ✅ MILESTONE 1: Date + TIME picker (time always visible = transparent pricing)
export default function PremiumDateAndTimePicker({
  value,
  onChange,
  label,
  required = false,
  minDate,
}: {
  value: string; // "YYYY-MM-DDTHH:mm:ss" or ""
  onChange: (datetime: string) => void;
  label: string;
  required?: boolean;
  minDate?: string;
}) {
  const [datePart, timeRaw] = value ? value.split("T") : ["", ""];
  const timePart = timeRaw ? timeRaw.slice(0, 5) : "";

  const emit = (d: string, t: string) => onChange(`${d}T${t}:00`);

  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div className="flex gap-2">
        {/* Date */}
        <div className="relative flex-1 min-w-0">
          <CalendarDays size={16} className="absolute left-3 top-3 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
          <Flatpickr
            value={datePart}
            onChange={(dates) => {
              if (dates[0]) emit(formatDateToLocalYYYYMMDD(dates[0]), timePart || "09:00");
            }}
            options={{
              dateFormat: "Y-m-d",
              minDate: minDate || "today",
              disableMobile: true,
            }}
            className={inputClass}
            placeholder="Select date..."
          />
        </div>
        {/* Time — 24h slot picker, always visible */}
        <TimePicker
          value={timePart || "09:00"}
          onChange={(t) => emit(datePart || formatDateToLocalYYYYMMDD(new Date()), t)}
        />
      </div>
    </div>
  );
}
