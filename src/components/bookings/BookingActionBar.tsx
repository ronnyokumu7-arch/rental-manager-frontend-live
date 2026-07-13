// src/components/bookings/BookingActionBar.tsx
"use client";

import { CheckCircle2, PlayCircle, Flag, XCircle, Share2, Loader2, Gauge, FileText } from "lucide-react";
import FloatingActionBar from "@/components/ui/FloatingActionBar";

interface BookingActionBarProps {
  status: string;
  isActionLoading: boolean;
  isTripEnded: boolean;
  onConfirm: () => void;
  onActivate: () => void;
  onCancel: () => void;
  onShareInvoice: () => void;
  onStageEndTrip: () => void;
  onOpenMileageModal: () => void;
  onGenerateQuotation: () => void;
}

export default function BookingActionBar({
  status,
  isActionLoading,
  isTripEnded,
  onConfirm,
  onActivate,
  onCancel,
  onShareInvoice,
  onStageEndTrip,
  onOpenMileageModal,
  onGenerateQuotation,
}: BookingActionBarProps) {
  const isTerminal = status === "completed" || status === "cancelled" || status === "no_show";

  return (
    <FloatingActionBar>
      {/* ── Left Side: Contextual Secondary Action ── */}
      {!isTerminal ? (
        <button
          onClick={onCancel}
          disabled={isActionLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <XCircle size={14} /> Cancel Booking
        </button>
      ) : (
        <button
          onClick={onShareInvoice}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 border border-[var(--color-surface-border)] transition-all active:scale-95"
        >
          <Share2 size={14} /> Share Invoice
        </button>
      )}

      {/* ── Divider ── */}
      <div className="w-px h-8 bg-[var(--color-surface-border)]" />

      {/* ── Right Side: Primary Lifecycle Actions ── */}
      <div className="flex items-center gap-2">
        {status === "pending" && (
          <>
            <ActionButton 
              icon={<FileText size={14} />} 
              label="Generate Quote" 
              onClick={onGenerateQuotation} 
              loading={isActionLoading} 
              variant="primary" 
            />
            <ActionButton 
              icon={<CheckCircle2 size={14} />} 
              label="Confirm Booking" 
              onClick={onConfirm} 
              loading={isActionLoading} 
              variant="success" 
            />
          </>
        )}
        {status === "confirmed" && (
          <ActionButton 
            icon={<PlayCircle size={14} />} 
            label="Start Trip" 
            onClick={onActivate} 
            loading={isActionLoading} 
            variant="primary" 
          />
        )}
        {status === "active" && (
          <>
            {!isTripEnded ? (
              <ActionButton 
                icon={<Flag size={14} />} 
                label="End Trip" 
                onClick={onStageEndTrip} 
                loading={isActionLoading} 
                variant="warning" 
              />
            ) : (
              <ActionButton 
                icon={<Gauge size={14} />} 
                label="Update Mileage" 
                onClick={onOpenMileageModal} 
                loading={isActionLoading} 
                variant="primary" 
              />
            )}
          </>
        )}
        {isTerminal && (
          <ActionButton 
            icon={<Share2 size={14} />} 
            label="Share Invoice" 
            onClick={onShareInvoice} 
            loading={false} 
            variant="secondary" 
          />
        )}
      </div>
    </FloatingActionBar>
  );
}

// ── Internal Sub-component for clean, premium button rendering ──
function ActionButton({ 
  icon, 
  label, 
  onClick, 
  loading, 
  variant 
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading: boolean;
  variant: "primary" | "success" | "warning" | "secondary";
}) {
  const styles: Record<string, string> = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 shadow-sm shadow-[var(--color-primary)]/20",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20",
    warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20",
    secondary: "bg-[var(--color-surface-hover)] text-[var(--color-ink)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)]/80",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${styles[variant]}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
