// src/components/financials/overview/QuickActions.tsx
import { Plus, DollarSign } from "lucide-react";

interface QuickActionsProps {
  onCreateInvoice: () => void;
  onRecordPayment: () => void;
}

export default function QuickActions({ onCreateInvoice, onRecordPayment }: QuickActionsProps) {
  return (
    <div className="space-y-3">
      <button 
        onClick={onCreateInvoice}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/10 transition-colors text-left group"
      >
        <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-primary)] shadow-sm transition-transform group-hover:scale-105">
          <Plus size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-ink)]">Create Invoice</p>
          <p className="text-xs text-[var(--color-ink-muted)]">Bill a client instantly</p>
        </div>
      </button>
      
      <button 
        onClick={onRecordPayment}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-success-bg)]/30 border border-[var(--color-success-bg)] hover:bg-[var(--color-success-bg)]/50 transition-colors text-left group"
      >
        <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-success-text)] shadow-sm transition-transform group-hover:scale-105">
          <DollarSign size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-ink)]">Record Payment</p>
          <p className="text-xs text-[var(--color-ink-muted)]">Log offline transactions</p>
        </div>
      </button>
    </div>
  );
}
