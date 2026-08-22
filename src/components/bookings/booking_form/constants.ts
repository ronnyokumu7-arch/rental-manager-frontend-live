// src/components/bookings/booking_form/constants.ts
/** Shared design tokens + pure helpers for the booking form modules. */

export const inputClass = "w-full pl-10 pr-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
export const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
export const sectionClass = "bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4";

// ✅ BULLETPROOF LOCAL DATE FORMATTER (YYYY-MM-DD)
export const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ MILESTONE 1: 24h slot-based Time Picker (no deps, no AM/PM ambiguity)
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});
