// src/components/financials/payments/RecordPaymentModal.tsx
import { useState, useEffect } from "react";
import { X, Loader2, Banknote } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { invoicesApi } from "@/lib/api/invoices";
import type { Invoice } from "@/lib/types";
import toast from "react-hot-toast";

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentRecorded: () => void;
}

export default function RecordPaymentModal({ open, onClose, onPaymentRecorded }: RecordPaymentModalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"mpesa" | "manual">("mpesa");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      invoicesApi.list({ status: "sent,overdue" }).then(setInvoices);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Invoice *</label>
          <select
            value={selectedInvoice || ""}
            onChange={(e) => {
              setSelectedInvoice(Number(e.target.value));
              setAmount("");
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          >
            <option value="">Select an invoice...</option>
            {invoices.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.invoice_number} - {inv.currency_code} {Number(inv.amount_due).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {/* Balance Info */}
        {selectedInvoiceData && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Due</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {selectedInvoiceData.currency_code} {Number(selectedInvoiceData.amount_due).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Already Paid</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {selectedInvoiceData.currency_code} {Number(selectedInvoiceData.amount_paid).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Remaining Balance</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {selectedInvoiceData.currency_code} {remaining.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Payment Amount *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={remaining}
            step="0.01"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="0.00"
            required
            disabled={!selectedInvoice}
          />
        </div>

        {/* Method & Reference */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Method *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="manual">Bank / Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reference *</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder={method === "mpesa" ? "e.g., QFG34HJ8L" : "Receipt #"}
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
            {loading ? "Processing..." : "Record Payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
