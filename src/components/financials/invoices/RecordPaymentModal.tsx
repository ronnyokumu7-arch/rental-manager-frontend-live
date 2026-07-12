// src/components/financials/invoices/RecordPaymentModal.tsx
"use client";

import { useState } from "react";
import { Loader2, Banknote } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Invoice } from "@/lib/types";

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<boolean>;
}

// ── Design System Constants ──────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function RecordPaymentModal({ invoice, open, onClose, onSubmit }: RecordPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!invoice) return null;
  const remaining = Number(invoice.amount_due) - Number(invoice.amount_paid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) return;
    
    setLoading(true);
    const success = await onSubmit(paymentAmount);
    setLoading(false);
    
    if (success) {
      setAmount("");
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Offline Payment" subtitle={`Invoice ${invoice.invoice_number}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Invoice Summary Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Total Due</span>
            <span className="text-sm font-bold text-[var(--color-ink)]">
              {invoice.currency_code} {Number(invoice.amount_due).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Already Paid</span>
            <span className="text-sm font-medium text-[var(--color-ink-muted)]">
              {invoice.currency_code} {Number(invoice.amount_paid).toLocaleString()}
            </span>
          </div>
          <div className="border-t border-[var(--color-surface-border)] my-3" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Remaining Balance</span>
            <span className="text-lg font-extrabold text-[var(--color-primary)]">
              {invoice.currency_code} {remaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Amount Input */}
        <div>
          <label className={labelClass}>
            Payment Amount <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)] text-sm font-semibold">
              {invoice.currency_code}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={remaining}
              step="0.01"
              className={`${inputClass} pl-16`}
              placeholder="0.00"
              required
            />
          </div>
          <p className="text-[10px] text-[var(--color-ink-muted)] mt-1.5">
            Maximum amount: {invoice.currency_code} {remaining.toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
            {loading ? "Processing..." : "Record Payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
