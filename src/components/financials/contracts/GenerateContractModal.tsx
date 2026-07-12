// src/components/financials/contracts/GenerateContractModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, FileText, AlertCircle, Link2, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { bookingsApi } from "@/lib/api/bookings";
import { contractsApi } from "@/lib/api/contracts";
import type { Booking, Contract } from "@/lib/types";
import toast from "react-hot-toast";

interface GenerateContractModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated: () => void;
}

// ── Design System Constants ──────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function GenerateContractModal({ open, onClose, onGenerated }: GenerateContractModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open) {
      setFetching(true);
      Promise.all([
        bookingsApi.list(),
        contractsApi.list()
      ])
        .then(([bData, cData]) => {
          setBookings(bData);
          setContracts(cData);
        })
        .catch(() => toast.error("Failed to load data"))
        .finally(() => setFetching(false));
    }
  }, [open]);

  const eligibleBookings = useMemo(() => {
    const contractMap = new Map(contracts.map(c => [c.booking_id, c]));
    
    return bookings.filter(b => {
      const contract = contractMap.get(b.id);
      if (contract) {
        return contract.status !== "signed" && contract.status !== "void";
      }
      return b.status === "pending" || b.status === "confirmed";
    });
  }, [bookings, contracts]);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  const existingContract = contracts.find(c => c.booking_id === selectedBookingId);

  const handleGenerateOrCopy = async () => {
    if (!selectedBookingId) return;
    setLoading(true);
    
    try {
      if (existingContract) {
        toast.loading("Generating share link...", { duration: 1000 });
        const res = await contractsApi.generateShareLink(existingContract.id);
        await navigator.clipboard.writeText(res.share_url);
        toast.dismiss();
        toast.success("Contract link copied to clipboard!");
        onGenerated();
        handleClose();
      } else {
        toast.loading("Generating contract...", { duration: 1000 });
        await contractsApi.regenerate(selectedBookingId);
        toast.dismiss();
        toast.success("Contract generated successfully!");
        onGenerated();
        handleClose();
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || "Failed to process contract");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedBookingId(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Contract Management" subtitle="Generate contract or copy share link" size="md">
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
              const contract = contracts.find(c => c.booking_id === b.id);
              const statusLabel = contract ? `Contract: ${contract.status}` : `Booking: ${b.status}`;
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
                No bookings are currently eligible. Ensure bookings are at least 'Pending' or have a 'Draft' contract.
              </p>
            </div>
          )}
        </div>

        {/* Booking Details Preview */}
        {selectedBooking && (
          <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-[var(--color-primary)]" />
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Booking Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Booking ID</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">{selectedBooking.booking_number || `#${selectedBooking.id}`}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Status</p>
                <p className="text-sm font-bold text-[var(--color-ink)] capitalize">{selectedBooking.status}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Start Date</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {new Date(selectedBooking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">End Date</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {new Date(selectedBooking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            
            {/* Contract Status Indicator */}
            {existingContract && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--color-success-bg)]/30 border border-[var(--color-success-bg)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--color-success-text)]" />
                  <span className="text-xs font-bold text-[var(--color-success-text)]">
                    Contract exists ({existingContract.status})
                  </span>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                  Clicking the button will copy the share link to your clipboard.
                </p>
              </div>
            )}
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
            onClick={handleGenerateOrCopy} 
            disabled={loading || !selectedBookingId} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : existingContract ? (
              <Link2 size={14} />
            ) : (
              <FileText size={14} />
            )}
            {loading 
              ? "Processing..." 
              : existingContract 
                ? "Copy Contract Link" 
                : "Generate Contract"
            }
          </button>
        </div>
      </div>
    </Modal>
  );
}
