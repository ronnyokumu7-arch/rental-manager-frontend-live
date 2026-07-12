// src/components/financials/contracts/ContractsTable.tsx
"use client";

import { FileText, Download, Link2, Send, XCircle } from "lucide-react";
import type { Contract, ContractStatus } from "@/lib/types";

interface ContractsTableProps {
  data: Contract[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onSend: (id: number) => void;
  onVoid: (id: number) => void;
}

export default function ContractsTable({ data, onDownload, onCopyLink, onSend, onVoid }: ContractsTableProps) {
  
  const getStatusStyle = (status: ContractStatus) => {
    switch (status) {
      case "signed": return "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";
      case "void": return "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]";
      case "sent": return "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]";
      case "draft": return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
      default: return "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]";
    }
  };

  return (
    <div className="overflow-x-auto dark:bg-[var(--color-surface-hover)]">
      <table className="w-full text-sm">
        {/* Header: Slightly darker in dark mode for contrast */}
        <thead className="bg-[var(--color-surface-hover)] dark:bg-[var(--color-surface)] border-b border-[var(--color-surface-border)]">
          <tr>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Contract</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Created Date</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
          </tr>
        </thead>
        
        {/* Body: Rows inherit the dark wrapper background, hover adjusts for dark mode */}
        <tbody className="divide-y divide-[var(--color-surface-border)]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-ink-muted)]">
                No contracts found.
              </td>
            </tr>
          ) : (
            data.map((c) => {
              const date = new Date(c.created_at);
              const isVoidOrSigned = c.status === "void" || c.status === "signed";
              const statusStyle = getStatusStyle(c.status);

              return (
                <tr 
                  key={c.id} 
                  className="hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface)] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-ink)]">{c.contract_number}</p>
                        <p className="text-xs text-[var(--color-ink-muted)]">Booking #{c.booking_id || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--color-ink)]">
                      {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onDownload(c.id)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all" 
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        onClick={() => onCopyLink(c.id)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all" 
                        title="Copy Share Link"
                      >
                        <Link2 size={14} />
                      </button>
                      {!isVoidOrSigned && (
                        <>
                          <button 
                            onClick={() => onSend(c.id)} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-success)] hover:text-white transition-all" 
                            title="Email to Client"
                          >
                            <Send size={14} />
                          </button>
                          <button 
                            onClick={() => onVoid(c.id)} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-danger)] hover:text-white transition-all" 
                            title="Void Contract"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
