// src/components/financials/contracts/ContractsTable.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Copy,
  Send,
  Ban,
  RotateCcw,
  CalendarDays,
  User,
  PenLine,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";

export type ContractStatus = "draft" | "sent" | "signed" | "void";

export interface ContractItem {
  id: number;
  contract_number: string;
  booking_id?: number;
  booking_number?: string;
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

// ✅ Premium per-status icons for the pill
const statusIcons: Record<ContractStatus, LucideIcon> = {
  draft: PenLine,
  sent: Send,
  signed: CheckCircle2,
  void: Ban,
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
  onGenerate,
}: ContractsTableProps) {
  const router = useRouter();

  const mobileItems = allData || data;

  const getContractActions = (contract: ContractItem): RowAction<ContractItem>[] => {
    const actions: RowAction<ContractItem>[] = [];
    const isVoid = contract.status === "void";

    // ✅ Void contracts: only show "Regenerate Contract"
    if (isVoid) {
      if (onGenerate && contract.booking_id) {
        actions.push({
          label: "Regenerate Contract",
          icon: RotateCcw,
          variant: "primary",
          onClick: () => onGenerate(contract.booking_id!),
        });
      }
      return actions;
    }

    // ✅ Non-void contracts: show normal actions
    actions.push(
      {
        label: "Download PDF",
        icon: Download,
        variant: "default",
        onClick: () => onDownload(contract.id),
      },
      {
        label: "Copy Sign Link",
        icon: Copy,
        variant: "default",
        onClick: () => onCopyLink(contract.id),
      }
    );

    if (contract.status !== "signed") {
      actions.push({
        label: "Send Contract",
        icon: Send,
        variant: "primary",
        separator: true,
        onClick: () => onSend(contract.id),
      });
    }

    actions.push({
      label: "Void Contract",
      icon: Ban,
      variant: "danger",
      separator: true,
      onClick: () => onVoid(contract.id),
    });

    return actions;
  };

  return (
    <div className="w-full">
      {/* ✅ MOBILE: Reusable CardGrid */}
      <div className="block md:hidden">
        <CardGrid
          data={mobileItems}
          getCardId={(c) => c.id}
          
          // Header: Icon + Contract Number + User icon + Client Name
          renderCardHeader={({ item }) => (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <h4 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.booking_id) {
                      router.push(`/dashboard/bookings/${item.booking_id}`);
                    }
                  }}
                  className="text-sm font-bold text-[var(--color-ink)] truncate cursor-pointer hover:text-[var(--color-primary)] transition-colors leading-tight"
                >
                  {item.contract_number || `C20260${item.id}`}
                </h4>
                {/* ✅ User icon beside client name */}
                <p className="flex items-center gap-1 text-xs text-[var(--color-ink-muted)] mt-0.5 font-medium min-w-0">
                  <User size={10} className="flex-shrink-0 text-[var(--color-ink-subtle)]" />
                  <span className="truncate">{item.client_name || "Unassigned Client"}</span>
                </p>
              </div>
            </div>
          )}
          
          // Body: captions + inline icons, status pill, PDF-only action
          renderCardBody={({ item }) => {
            const style = statusStyles[item.status] || statusStyles.draft;
            const StatusIcon = statusIcons[item.status] || FileText;
            const isVoid = item.status === "void";
            
            return (
              <div className="space-y-3">
                {/* Booking Ref + Date (Calendar icon inline) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">Booking Ref</p>
                    <p className="text-xs font-bold text-[var(--color-ink)] mt-0.5 font-mono truncate">
                      {item.booking_number ? `#${item.booking_number}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">Date Signed</p>
                    <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                      <CalendarDays size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="text-xs text-[var(--color-ink-muted)] truncate">
                        {item.signed_at ? formatDateShort(item.signed_at) : formatDateShort(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ✅ Status pill with matching icon (dot eliminated) + PDF-only */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-surface-border)]/40">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    <StatusIcon size={10} className="flex-shrink-0" />
                    {statusLabels[item.status]}
                  </span>
                  
                  {!isVoid && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDownload(item.id); }}
                      className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <Download size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          }}
          
          // ✅ Row actions (3-dots menu) - correctly targeted via portal
          rowActions={getContractActions}
          
          // Pagination - using same pageSize as desktop for consistency
          currentPage={1}
          totalPages={1}
          totalItems={mobileItems.length}
          pageSize={3}
          onPageChange={() => {}} // No pagination on mobile for now
        />
      </div>

      {/* ✅ DESKTOP: Reusable DataTable */}
      <div className="hidden md:block">
        <DataTable
          data={data}
          columns={[
            {
              header: "Contract",
              accessorKey: "contract_number",
              cell: ({ row }) => {
                const c = row.original;
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (c.booking_id) {
                            router.push(`/dashboard/bookings/${c.booking_id}`);
                          }
                        }}
                        className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                      >
                        {c.contract_number || `C20260${c.id}`}
                      </button>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Booking Ref",
              accessorKey: "booking_number",
              cell: ({ row }) => (
                <span className="text-sm font-medium text-[var(--color-ink)] font-mono">
                  {row.original.booking_number ? `#${row.original.booking_number}` : "—"}
                </span>
              ),
            },
            {
              header: "Client",
              accessorKey: "client_name",
              cell: ({ row }) => (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                    {row.original.client_name || "Unassigned Client"}
                  </p>
                </div>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              cell: ({ row }) => {
                const c = row.original;
                const style = statusStyles[c.status] || statusStyles.draft;
                const StatusIcon = statusIcons[c.status] || FileText;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    <StatusIcon size={10} className="flex-shrink-0" />
                    {statusLabels[c.status] || c.status}
                  </span>
                );
              },
            },
            {
              header: "Date Signed",
              accessorKey: "signed_at",
              cell: ({ row }) => {
                const c = row.original;
                return (
                  <p className="text-sm font-medium text-[var(--color-ink-muted)] truncate whitespace-nowrap">
                    {formatDateShort(c.signed_at || c.created_at)}
                  </p>
                );
              },
            },
          ]}
          // ✅ Row actions (3-dots menu) - correctly targeted via portal
          rowActions={getContractActions}
          getRowId={(c) => c.id}
          onRowClick={(c) => {
            if (c.booking_id) {
              router.push(`/dashboard/bookings/${c.booking_id}`);
            }
          }}
          loading={false}
          emptyMessage="No contracts found"
          // Pagination props - handled by parent ContractsTab
          currentPage={1}
          totalPages={1}
          totalItems={data.length}
          pageSize={7}
          onPageChange={() => {}}
          viewMode="desktop"
        />
      </div>
    </div>
  );
}
