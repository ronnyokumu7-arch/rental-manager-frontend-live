// src/components/financials/payments/RecordPaymentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, Banknote, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { invoicesApi } from "@/lib/api/invoices";
import type { Invoice } from "@/lib/types";
import toast from "react-hot-toast";

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentRecorded: () => void;
}

// ── Design System Constants ──────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function RecordPaymentModal({ open, onClose, onPaymentRecorded }: RecordPaymentModalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"mpesa" | "manual">("mpesa");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);

  useEffect(() => {
    if (open) {
      setFetchingInvoices(true);
      invoicesApi.list()
        .then((data) => {
          const unpaid = data.filter(inv => inv.status !== "paid" && inv.status !== "void");
          setInvoices(unpaid);
        })
        .catch(() => toast.error("Failed to load invoices"))
        .finally(() => setFetchingInvoices(false));
    }
  }, [open]);

  const selectedInvoiceData = invoices.find(inv => inv.id === selectedInvoice);
  const remaining = selectedInvoiceData 
    ? Number(selectedInvoiceData.amount_due) - Number(selectedInvoiceData.amount_paid)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return toast.error("Please select an invoice");
    
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) return toast.error("Enter a valid amount");
    if (paymentAmount > remaining) return toast.error("Amount exceeds remaining balance");

    setLoading(true);
    try {
      await invoicesApi.recordPaymentByToken(selectedInvoice.toString(), {
        amount: paymentAmount,
        method,
        reference,
      });
      
      toast.success("Payment recorded successfully!");
      onPaymentRecorded();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedInvoice(null);
    setAmount("");
    setReference("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Record Payment" subtitle="Log an offline payment transaction" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Invoice Selection */}
        <div>
          <label className={labelClass}>
            Select Unpaid Invoice <span className="text-[var(--color-danger)]">*</span>
          </label>
          <select
            value={selectedInvoice || ""}
            onChange={(e) => {
              setSelectedInvoice(Number(e.target.value));
              setAmount("");
            }}
            className={inputClass}
            required
            disabled={fetchingInvoices}
          >
            <option value="">
              {fetchingInvoices ? "Loading invoices..." : "Select an invoice..."}
            </option>
            {invoices.map(inv => {
              const bal = Number(inv.amount_due) - Number(inv.amount_paid);
              return (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} — {inv.currency_code} {bal.toLocaleString()} remaining
                </option>
              );
            })}
          </select>
          
          {invoices.length === 0 && !fetchingInvoices && (
            <div className="mt-3 p-4 rounded-xl bg-[var(--color-success-bg)]/30 border border-[var(--color-success-bg)] flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[var(--color-success-text)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--color-success-text)] font-medium">
                All invoices are paid up!
              </p>
            </div>
          )}
        </div>

        {/* Balance Info */}
        {selectedInvoiceData && (
          <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Total Due</span>
              <span className="text-sm font-bold text-[var(--color-ink)]">
                {selectedInvoiceData.currency_code} {Number(selectedInvoiceData.amount_due).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Already Paid</span>
              <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                {selectedInvoiceData.currency_code} {Number(selectedInvoiceData.amount_paid).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[var(--color-surface-border)] my-3" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Remaining Balance</span>
              <span className="text-lg font-extrabold text-[var(--color-primary)]">
                {selectedInvoiceData.currency_code} {remaining.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className={labelClass}>
            Payment Amount <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)] text-sm font-semibold">
              {selectedInvoiceData?.currency_code || "KES"}
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
              disabled={!selectedInvoice}
            />
          </div>
        </div>

        {/* Method & Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Method <span className="text-[var(--color-danger)]">*</span>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className={inputClass}
            >
              <option value="mpesa">M-Pesa</option>
              <option value="manual">Bank / Cash</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Reference <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={inputClass}
              placeholder={method === "mpesa" ? "e.g., QFG34HJ8L" : "Receipt #"}
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
          <button 
            type="button" 
            onClick={handleClose} 
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
