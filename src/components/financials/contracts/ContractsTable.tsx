"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MoreVertical,
  Download,
  Copy,
  Send,
  Ban,
  Calendar,
  Hash,
} from "lucide-react";

export type ContractStatus = "draft" | "sent" | "signed" | "void";

export interface ContractItem {
  id: number;
  contract_number: string;
  booking_ref?: string | number;
  client_name?: string;
  client_phone?: string;
  status: ContractStatus;
  created_at?: string;
  signed_at?: string;
  pdf_url?: string;
  public_token?: string;
}

interface ContractsTableProps {
  data: ContractItem[];
  allData?: ContractItem[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onSend: (id: number) => void;
  onVoid: (id: number) => void;
  onGenerate?: (bookingId: number) => void;
}

const statusStyles: Record<ContractStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  sent: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  signed: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  void: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

const statusLabels: Record<ContractStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  signed: "Signed",
  void: "Void",
};

const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
};

export default function ContractsTable({
  data,
  allData,
  onDownload,
  onCopyLink,
  onSend,
  onVoid,
}: ContractsTableProps) {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  const mobileItems = allData || data;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdownId !== null && !target.closest(`[data-dropdown-id="${openDropdownId}"]`)) {
        setOpenDropdownId(null);
        setDropdownPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  const handleToggleDropdown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    } else {
      setOpenDropdownId(id);
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const activeContract = (allData || data).find((c) => c.id === openDropdownId);

  return (
    <div className="w-full">
      {/* ── MOBILE CARD VIEW ── */}
      <div className="block md:hidden space-y-3">
        {mobileItems.map((c) => {
          return (
            <div
              key={c.id}
              onClick={() => {
                if (c.booking_ref) {
                  router.push(`/dashboard/bookings/${c.booking_ref}`);
                }
              }}
              className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[var(--color-ink)] truncate leading-tight">
                      {c.contract_number || `C20260${c.id}`}
                    </h4>
                    <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5 font-medium">
                      {c.client_name || "Unassigned Client"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Options Menu Button */}
                  <div
                    className="relative"
                    data-dropdown-id={c.id}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleToggleDropdown(e, c.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-all cursor-pointer"
                      title="Actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="border-t border-[var(--color-surface-border)]/60 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Booking Ref */}
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-ink-subtle)] flex items-center gap-1">
                      <Hash size={10} /> Booking Ref
                    </p>
                    <p className="font-bold text-[var(--color-ink)] truncate mt-0.5">
                      {c.booking_ref ? `#${c.booking_ref}` : "—"}
                    </p>
                  </div>

                  {/* Date Signed / Created */}
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-ink-subtle)] flex items-center gap-1">
                      <Calendar size={10} /> Date
                    </p>
                    <p className="font-medium text-[var(--color-ink-muted)] truncate mt-0.5">
                      {c.signed_at ? formatDateShort(c.signed_at) : formatDateShort(c.created_at)}
                    </p>
                  </div>

                  {/* Status + Icon-Only Action Buttons */}
                  <div className="col-span-2 border-t border-[var(--color-surface-border)]/60 pt-3 mt-3 flex items-center justify-between">
                    {/* Status Badge - Consistent padding with other tables */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        statusStyles[c.status]?.bg || "bg-slate-500/10"
                      } ${statusStyles[c.status]?.text || "text-slate-500"}`}
                    >
                      {statusLabels[c.status] || c.status}
                    </span>

                    {/* Plain Icon-Only Action Buttons: Copy (Left) + Download (Right) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyLink(c.id);
                        }}
                        className="p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-all cursor-pointer"
                        title="Copy Share Link"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(c.id);
                        }}
                        className="p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-all cursor-pointer"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP TABLE VIEW ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Contract
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Booking Ref
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Client
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Status
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Date Signed
              </th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)]">
            {data.map((c) => {
              const style = statusStyles[c.status] || statusStyles.draft;

              return (
                <tr
                  key={c.id}
                  onClick={() => {
                    if (c.booking_ref) {
                      router.push(`/dashboard/bookings/${c.booking_ref}`);
                    }
                  }}
                  className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                          {c.contract_number || `C20260${c.id}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--color-ink)] font-mono">
                      {c.booking_ref ? `#${c.booking_ref}` : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                        {c.client_name || "Unassigned Client"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}
                    >
                      {statusLabels[c.status] || c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[var(--color-ink-muted)] truncate whitespace-nowrap">
                      {formatDateShort(c.signed_at || c.created_at)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="flex items-center justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative" data-dropdown-id={c.id}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleDropdown(e, c.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer"
                          title="More Actions"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── SHARED DROPDOWN OVERLAY ── */}
      {openDropdownId !== null && dropdownPos && activeContract && (
        <div
          data-dropdown-id={openDropdownId}
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-[100] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onDownload(activeContract.id);
              setOpenDropdownId(null);
              setDropdownPos(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <Download size={14} /> Download PDF
          </button>

          <button
            type="button"
            onClick={() => {
              onCopyLink(activeContract.id);
              setOpenDropdownId(null);
              setDropdownPos(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)] cursor-pointer"
          >
            <Copy size={14} /> Copy Sign Link
          </button>

          {activeContract.status !== "signed" && activeContract.status !== "void" && (
            <button
              type="button"
              onClick={() => {
                onSend(activeContract.id);
                setOpenDropdownId(null);
                setDropdownPos(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)] cursor-pointer"
            >
              <Send size={14} /> Send Contract
            </button>
          )}

          {activeContract.status !== "void" && (
            <button
              type="button"
              onClick={() => {
                onVoid(activeContract.id);
                setOpenDropdownId(null);
                setDropdownPos(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)] cursor-pointer"
            >
              <Ban size={14} /> Void Contract
            </button>
          )}
        </div>
      )}
    </div>
  );
}
