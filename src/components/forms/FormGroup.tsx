import React from "react";

interface FormGroupProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  horizontal?: boolean;
  className?: string;
}

export default function FormGroup({
  label,
  hint,
  error,
  required = false,
  children,
  horizontal = false,
  className = "",
}: FormGroupProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${horizontal ? "sm:flex-row sm:items-start sm:gap-4" : ""} ${className}`}>
      {label && (
        <label className={`text-xs font-semibold text-ink-muted uppercase tracking-wide ${horizontal ? "sm:w-32 sm:pt-2.5" : ""}`}>
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="flex-1 flex flex-col gap-1">
        {children}
        {hint && !error && <p className="text-xs text-ink-subtle mt-1">{hint}</p>}
        {error && (
          <p className="text-xs text-danger font-medium mt-1 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
