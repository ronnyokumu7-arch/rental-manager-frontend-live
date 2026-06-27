import React from "react";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
type SpinnerColor = "accent" | "white" | "muted" | "inherit";

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
  centered?: boolean;
  fullPage?: boolean;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, { spinner: string; border: string }> = {
  xs: { spinner: "w-3 h-3", border: "border" },
  sm: { spinner: "w-4 h-4", border: "border-2" },
  md: { spinner: "w-6 h-6", border: "border-2" },
  lg: { spinner: "w-8 h-8", border: "border-[3px]" },
  xl: { spinner: "w-12 h-12", border: "border-[3px]" },
};

const colorStyles: Record<SpinnerColor, string> = {
  accent: "border-accent/25 border-t-accent-dark",
  white: "border-white/25 border-t-white",
  muted: "border-ink-subtle/25 border-t-ink-muted",
  inherit: "border-current/25 border-t-current",
};

export default function Spinner({
  size = "md",
  color = "accent",
  label,
  centered = false,
  fullPage = false,
  className = "",
}: SpinnerProps) {
  const { spinner, border } = sizeStyles[size];

  const spinnerEl = (
    <div
      className={`${spinner} ${border} rounded-full animate-spin ${colorStyles[color]}`}
      role="status"
      aria-label={label || "Loading"}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm">
        {spinnerEl}
        {label && (
          <p className="mt-4 text-sm font-medium text-ink-muted">{label}</p>
        )}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {spinnerEl}
        {label && (
          <p className="mt-4 text-sm font-medium text-ink-muted">{label}</p>
        )}
      </div>
    );
  }

  if (label) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {spinnerEl}
        <span className="text-sm font-medium text-ink-muted">{label}</span>
      </div>
    );
  }

  return <>{spinnerEl}</>;
}