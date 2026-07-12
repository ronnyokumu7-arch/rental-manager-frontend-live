// src/components/financials/invoices/CreateInvoiceModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { bookingsApi } from "@/lib/api/bookings";
import { invoicesApi } from "@/lib/api/invoices";
import type { Booking, Invoice } from "@/lib/types";
import toast from "react-hot-toast";

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// ── Design System Constants ──────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function CreateInvoiceModal({ open, onClose, onCreated }: CreateInvoiceModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  
  const [customAmount, setCustomAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open) {
      setFetching(true);
      Promise.all([
        bookingsApi.list(),
        invoicesApi.list()
      ])
        .then(([bData, iData]) => {
          setBookings(bData);
          setInvoices(iData);
        })
        .catch(() => toast.error("Failed to load data"))
        .finally(() => setFetching(false));
    }
  }, [open]);

  const eligibleBookings = useMemo(() => {
    const invoiceMap = new Map(invoices.map(inv => [inv.booking_id, inv]));
    
    return bookings.filter(b => {
      const isBookingActive = ['pending', 'confirmed', 'active'].includes(b.status);
      if (!isBookingActive) return false;

      const invoice = invoiceMap.get(b.id);
      if (!invoice) return true;
      
      return invoice.status !== 'paid' && invoice.status !== 'void';
    });
  }, [bookings, invoices]);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  const existingInvoice = invoices.find(inv => inv.booking_id === selectedBookingId);

  useEffect(() => {
    if (selectedBooking) {
      if (existingInvoice) {
        setCustomAmount(existingInvoice.amount_due.toString());
        setDueDate(existingInvoice.due_date.split('T')[0]);
        setNotes(existingInvoice.notes || "");
      } else {
        setCustomAmount(selectedBooking.total_amount.toString());
        setDueDate(selectedBooking.end_date.split('T')[0]);
        setNotes(`Auto-generated for Booking #${selectedBooking.booking_number}`);
      }
    } else {
      setCustomAmount("");
      setDueDate("");
      setNotes("");
    }
  }, [selectedBookingId]);

  const handleSubmit = async () => {
    if (!selectedBookingId || !customAmount || !dueDate) return;
    
    setLoading(true);
    try {
      const payload = {
        amount_due: parseFloat(customAmount),
        due_date: new Date(dueDate).toISOString(),
        notes: notes,
        ...( !existingInvoice ? { booking_id: selectedBookingId } : {} )
      };

      if (existingInvoice) {
        await invoicesApi.update(existingInvoice.id, payload as any);
        toast.success("Invoice customized and updated successfully!");
      } else {
        await invoicesApi.create(payload as any);
        toast.success("Custom invoice created successfully!");
      }
      
      onCreated();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to process invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedBookingId(null);
    onClose();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid": return "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";
      case "overdue": return "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]";
      case "void": return "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]";
      case "sent": return "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]";
      default: return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Customize Invoice" subtitle="Override costs, add fees, or adjust due dates" size="md">
      <div className="space-y-6">
        
        {/* Booking Selection */}
        <div>
          <label className={labelClass}>
            Select Booking <span className="text-[var(--color-danger)]">*</span>
          </label>
          <select
            value={selectedBookingId || ""}
            onChange={(e) => setSelectedBookingId(Number(e.target.value))}
            className={inputClass}
            disabled={fetching}
          >
            <option value="">
              {fetching ? "Loading bookings..." : eligibleBookings.length === 0 ? "No eligible bookings" : "Select a booking..."}
            </option>
            {eligibleBookings.map(b => {
              const invoice = invoices.find(inv => inv.booking_id === b.id);
              const statusLabel = invoice ? `Invoice: ${invoice.status}` : `No Invoice Yet`;
              return (
                <option key={b.id} value={b.id}>
                  {b.booking_number || `Booking #${b.id}`} — {statusLabel}
                </option>
              );
            })}
          </select>
          
          {eligibleBookings.length === 0 && !fetching && (
            <div className="mt-3 p-4 rounded-xl bg-[var(--color-warning-bg)]/30 border border-[var(--color-warning-bg)] flex items-start gap-3">
              <AlertCircle size={16} className="text-[var(--color-warning-text)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--color-warning-text)] font-medium">
                No bookings are eligible. Ensure bookings are 'Pending/Active' and invoices are not 'Paid'.
              </p>
            </div>
          )}
        </div>

        {/* Booking & Invoice Preview */}
        {selectedBooking && (
          <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Booking Details</span>
              {existingInvoice && (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(existingInvoice.status)}`}>
                  {existingInvoice.status}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Client Amount</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {selectedBooking.currency_code} {Number(selectedBooking.total_amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">End Date</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {new Date(selectedBooking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customization Form */}
        {selectedBooking && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Custom Amount (KES) <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)] text-sm font-semibold">KES</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className={`${inputClass} pl-16`}
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-[var(--color-ink-muted)] mt-1.5">Use this to apply discounts or add delivery fees.</p>
            </div>

            <div>
              <label className={labelClass}>
                Due Date <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Notes / Add-ons</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="e.g., +KES 500 for airport pickup, 10% loyalty discount applied..."
              />
            </div>
          </div>
        )}

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
            onClick={handleSubmit} 
            disabled={loading || !selectedBookingId || !customAmount} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {loading ? "Processing..." : existingInvoice ? "Update Invoice" : "Generate Invoice"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
