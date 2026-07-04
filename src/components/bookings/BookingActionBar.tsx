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
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-danger-text hover:bg-danger-bg transition-colors disabled:opacity-50"
        >
          <XCircle size={14} /> Cancel Booking
        </button>
      ) : (
        <button
          onClick={onShareInvoice}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-ink hover:bg-surface-hover transition-colors"
        >
          <Share2 size={14} /> Share Invoice
        </button>
      )}

      {/* ── Divider ── */}
      <div className="w-px h-6 bg-surface-border" />

      {/* ── Right Side: Primary Lifecycle Actions ── */}
      <div className="flex items-center gap-2">
        {status === "pending" && (
          <>
            {/* ✅ GENERATE QUOTATION (DRAFT INVOICE) BUTTON */}
            <ActionButton 
              icon={<FileText size={14} />} 
              label="Generate Quote" 
              onClick={onGenerateQuotation} 
              loading={isActionLoading} 
              variant="accent" 
            />
            
            {/* ✅ CONFIRM BOOKING BUTTON (Manual override) */}
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
            variant="accent" 
          />
        )}
        
        {/* ✅ THE MORPHING LOGIC FOR ACTIVE TRIPS */}
        {status === "active" && (
          <>
            {!isTripEnded ? (
              // STAGE 1: End Trip (Warning/Amber)
              <ActionButton 
                icon={<Flag size={14} />} 
                label="End Trip" 
                onClick={onStageEndTrip} 
                loading={isActionLoading} 
                variant="warning" 
              />
            ) : (
              // STAGE 2: Update Mileage (Accent/Blue)
              <ActionButton 
                icon={<Gauge size={14} />} 
                label="Update Mileage" 
                onClick={onOpenMileageModal} 
                loading={isActionLoading} 
                variant="accent" 
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

// ── Internal Sub-component for clean button rendering ──
function ActionButton({ icon, label, onClick, loading, variant }: any) {
  const styles: Record<string, string> = {
    accent: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20",
    warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20",
    secondary: "bg-surface-hover text-ink border border-surface-border hover:bg-surface-border",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
