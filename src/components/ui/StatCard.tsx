"use client";
import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

export type StatCardVariant = "dark" | "light";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: StatCardVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  loading?: boolean;
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "dark",
  action,
  loading = false,
  className = "",
}: StatCardProps) {
  const isDark = variant === "dark";

  const TrendIcon =
    trend?.value === 0
      ? Minus
      : trend && trend.value > 0
      ? TrendingUp
      : TrendingDown;

  // Semantic trend colors
  const trendColor =
    trend?.value === 0
      ? isDark ? "text-white/40" : "text-ink-muted"
      : trend && trend.value > 0
      ? "text-success-text"
      : "text-danger-text";

  const trendBg =
    trend?.value === 0
      ? isDark ? "bg-white/10" : "bg-surface-hover"
      : trend && trend.value > 0
      ? "bg-success-bg"
      : "bg-danger-bg";

  if (isDark) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl p-6 card-dark ${className}`}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-brand-500/10 blur-2xl" />
        
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <p className="text-brand-100/60 text-xs font-semibold uppercase tracking-widest">
            {title}
          </p>
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-brand-500" strokeWidth={1.8} />
            </div>
          )}
        </div>

        {/* Value */}
        {loading ? (
          <div className="h-9 w-24 rounded-lg bg-white/10 animate-pulse mb-2" />
        ) : (
          <p className="text-3xl font-bold text-white tracking-tight mb-1">
            {value}
          </p>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-white/40 text-xs mb-3">{subtitle}</p>
        )}

        {/* Trend + Action row */}
        <div className="flex items-center justify-between mt-3">
          {trend !== undefined ? (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${trendBg}`}>
              <TrendIcon size={12} className={trendColor} strokeWidth={2.5} />
              <span className={`text-xs font-semibold ${trendColor}`}>
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-white/30 text-xs">{trend.label}</span>
              )}
            </div>
          ) : (
            <span />
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs text-brand-500 hover:text-brand-100 font-medium transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Light variant
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 bg-surface-card border border-surface-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200 ${className}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-widest">
          {title}
        </p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-accent-bg flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-accent-dark" strokeWidth={1.8} />
          </div>
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div className="h-9 w-24 rounded-lg bg-surface-hover animate-pulse mb-2" />
      ) : (
        <p className="text-3xl font-bold text-ink tracking-tight mb-1">
          {value}
        </p>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-ink-subtle text-xs mb-3">{subtitle}</p>
      )}

      {/* Trend + Action */}
      <div className="flex items-center justify-between mt-3">
        {trend !== undefined ? (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${trendBg}`}>
            <TrendIcon size={12} className={trendColor} strokeWidth={2.5} />
            <span className={`text-xs font-semibold ${trendColor}`}>
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            {trend.label && (
              <span className="text-ink-subtle text-xs ml-0.5">{trend.label}</span>
            )}
          </div>
        ) : (
          <span />
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs text-accent-dark hover:text-accent-darker font-medium transition-colors"
          >
            {action.label} →
          </button>
        )}
      </div>
    </div>
  );
}
