// src/components/financials/invoices/RecordPaymentModal.tsx
import { useState } from "react";
import { X, Loader2, Banknote } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Invoice } from "@/lib/types";

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<boolean>;
}

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Due</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{invoice.currency_code} {Number(invoice.amount_due).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Already Paid</span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{invoice.currency_code} {Number(invoice.amount_paid).toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Remaining Balance</span>
            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{invoice.currency_code} {remaining.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Payment Amount *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={remaining}
            step="0.01"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
            {loading ? "Processing..." : "Record Payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
