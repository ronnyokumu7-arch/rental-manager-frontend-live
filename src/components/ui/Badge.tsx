import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "neutral"
  | "critical"
  | "info";

export type BadgeSize = "xs" | "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  outline?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Semantic color palette using CSS variables from globals.css
const variantStyles: Record<BadgeVariant, string> = {
  success:   "bg-success-bg text-success-text border-success-border",
  warning:   "bg-warning-bg text-warning-text border-warning-border",
  danger:    "bg-danger-bg text-danger-text border-danger-border",
  critical:  "bg-danger-bg text-danger-text border-danger-border",
  accent:    "bg-accent-bg text-accent-dark border-accent/20",
  neutral:   "bg-surface-hover text-ink-muted border-surface-border",
  info:      "bg-accent-bg text-accent-dark border-accent/20",
};

const variantStylesOutline: Record<BadgeVariant, string> = {
  success:   "bg-transparent text-success-text border-success-border",
  warning:   "bg-transparent text-warning-text border-warning-border",
  danger:    "bg-transparent text-danger-text border-danger-border",
  critical:  "bg-transparent text-danger-text border-danger-border",
  accent:    "bg-transparent text-accent-dark border-accent/40",
  neutral:   "bg-transparent text-ink-muted border-surface-border",
  info:      "bg-transparent text-accent-dark border-accent/40",
};

const dotColors: Record<BadgeVariant, string> = {
  success:   "bg-success",
  warning:   "bg-warning",
  danger:    "bg-danger",
  critical:  "bg-danger",
  accent:    "bg-accent",
  neutral:   "bg-ink-subtle",
  info:      "bg-accent",
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: "text-[9px] px-1.5 py-0.5 gap-1",
  sm: "text-[10px] px-2 py-0.5 gap-1.5",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

export default function Badge({
  variant = "neutral",
  size = "sm",
  dot = false,
  outline = false,
  pulse = false,
  children,
  className = "",
}: BadgeProps) {
  const baseStyles = outline ? variantStylesOutline[variant] : variantStyles[variant];
  
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide border transition-all duration-200 ${baseStyles} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]} ${pulse ? "animate-pulse" : ""}`}
        />
      )}
      {children}
    </span>
  );
}

// ── Entity-Specific Badge Helpers ────────────────────────────────────────────

export function BookingStatusBadge({ status, pulse = false }: { status: string; pulse?: boolean }) {
  const map: Record<string, BadgeVariant> = {
    pending:    "warning",
    confirmed:  "accent",
    active:     "success",
    completed:  "neutral",
    cancelled:  "danger",
    no_show:    "critical",
  };
  const label = status === "no_show" ? "No Show" : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant={map[status] ?? "neutral"} dot pulse={pulse && status === "active"}>
      {label}
    </Badge>
  );
}

export function ClientStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    pending:    "warning",
    active:     "success",
    inactive:   "neutral",
    suspended:  "danger",
  };
  return (
    <Badge variant={map[status] ?? "neutral"} dot>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function VehicleStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    available:    "success",
    rented:       "accent",
    maintenance:  "warning",
    retired:      "neutral",
  };
  return (
    <Badge variant={map[status] ?? "neutral"} dot>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function ContractStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    draft:   "neutral",
    sent:    "accent",
    signed:  "success",
    void:    "danger",
  };
  return (
    <Badge variant={map[status] ?? "neutral"} dot>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    draft:    "neutral",
    sent:     "accent",
    paid:     "success",
    overdue:  "critical",
    void:     "danger",
  };
  return (
    <Badge variant={map[status] ?? "neutral"} dot>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function SubscriptionStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    active:      "success",
    trial:       "accent",
    past_due:    "warning",
    grace:       "warning",
    suspended:   "danger",
    cancelled:   "neutral",
    expired:     "critical",
  };
  const label = status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1);
  return (
    <Badge variant={map[status] ?? "neutral"} dot>
      {label}
    </Badge>
  );
}
