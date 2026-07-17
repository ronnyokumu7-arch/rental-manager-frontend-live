// src/components/financials/contracts/ContractsTable.tsx
"use client";

import { FileText, Download, Copy, Send, XCircle, MoreVertical } from "lucide-react";
import { useState } from "react";
import type { Contract } from "@/lib/types";

interface ContractsTableProps {
  data: Contract[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onSend: (id: number) => void;
  onVoid: (id: number) => void;
  onGenerate?: (bookingId: number) => void; // ✅ Updated to accept bookingId for regeneration
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
  sent: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  signed: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  void: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function ContractsTable({ 
  data, 
  onDownload, 
  onCopyLink, 
  onSend, 
  onVoid, 
  onGenerate 
}: ContractsTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
          <tr>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Contract</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Booking Ref</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Date Created</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Date Signed</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-surface-border)]">
          {data.map((contract) => {
            const style = statusStyles[contract.status] || statusStyles.draft;
            
            // ✅ Safely check both client_signed_at (from public sign) and signed_at
            const signedDate = (contract as any).client_signed_at || contract.signed_at;

            return (
              <tr key={contract.id} className="hover:bg-[var(--color-surface-hover)] transition-colors group">
                {/* Contract */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-ink)]">{contract.contract_number}</p>
                    </div>
                  </div>
                </td>

                {/* Booking Ref */}
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {'booking_ref' in contract ? (contract as any).booking_ref || "—" : `Booking #${contract.booking_id || "N/A"}`}
                  </p>
                </td>

                {/* Date Created */}
                <td className="px-6 py-4">
                  <p className="text-sm text-[var(--color-ink-muted)]">{formatDate(contract.created_at)}</p>
                </td>

                {/* Date Signed */}
                <td className="px-6 py-4">
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {formatDate(signedDate)}
                  </p>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    {contract.status}
                  </span>
                </td>

                {/* Manage */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {contract.status === "draft" && (
                      <button
                        onClick={() => onSend(contract.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-primary-text)] hover:bg-[var(--color-primary-muted)] transition-all"
                        title="Send to Client"
                      >
                        <Send size={14} />
                      </button>
                    )}
                    
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === contract.id ? null : contract.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                        title="More Actions"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openDropdownId === contract.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          
                          {/* ✅ Generate/Regenerate Contract (passes booking_id) */}
                          {onGenerate && contract.booking_id && (
                            <button
                              onClick={() => { onGenerate(contract.booking_id); setOpenDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                              <FileText size={14} /> {contract.status === "draft" ? "Generate" : "Regenerate"} Contract
                            </button>
                          )}

                          <button
                            onClick={() => { onDownload(contract.id); setOpenDropdownId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                          >
                            <Download size={14} /> Download PDF
                          </button>
                          <button
                            onClick={() => { onCopyLink(contract.id); setOpenDropdownId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                          >
                            <Copy size={14} /> Copy Share Link
                          </button>
                          {(contract.status === "draft" || contract.status === "sent") && (
                            <button
                              onClick={() => { onVoid(contract.id); setOpenDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors border-t border-[var(--color-surface-border)]"
                            >
                              <XCircle size={14} /> Void Contract
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
