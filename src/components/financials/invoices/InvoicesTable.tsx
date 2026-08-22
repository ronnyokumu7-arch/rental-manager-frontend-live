// src/components/financials/invoices/InvoicesTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { FileText, Download, Copy, DollarSign, XCircle, ExternalLink, Banknote, CalendarDays, User, PenLine, Send, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import type { Invoice } from "@/lib/types";

interface InvoicesTableProps {
  data: Invoice[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onVoid: (id: number) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onCreate?: () => void;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
  sent: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  partially_paid: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  paid: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  overdue: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
  void: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
};

// ✅ Premium per-status icons for the pill
const statusIcons: Record<string, LucideIcon> = {
  draft: PenLine,
  sent: Send,
  partially_paid: Banknote,
  paid: CheckCircle2,
  overdue: AlertCircle,
  void: XCircle,
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

// ✅ Solid, saturated dot colors so the status pops on dark mode
const getStatusDotColor = (status: string) => {
  switch (status) {
    case "paid": return "bg-emerald-500";
    case "sent": return "bg-blue-500";
    case "partially_paid": return "bg-amber-500";
    case "overdue": return "bg-rose-500";
    case "draft": return "bg-gray-400";
    case "void": return "bg-gray-400";
    default: return "bg-gray-400";
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
};

// ✅ Helper: safely extract Decimal-string money fields as numbers
const safeMoney = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function InvoicesTable({ 
  data, 
  onDownload, 
  onCopyLink, 
  onVoid, 
  onRecordPayment, 
  onCreate: _onCreate 
}: InvoicesTableProps) {
  const router = useRouter();

  const getInvoiceActions = (invoice: Invoice): RowAction<Invoice>[] => {
    const actions: RowAction<Invoice>[] = [
      {
        label: "Download PDF",
        icon: Download,
        variant: "default",
        onClick: () => onDownload(invoice.id),
      },
      {
        label: "Copy Share Link",
        icon: Copy,
        variant: "default",
        onClick: () => onCopyLink(invoice.id),
      },
    ];

    if (invoice.status !== "paid" && invoice.status !== "void") {
      actions.push(
        {
          label: "Record Offline Payment",
          icon: DollarSign,
          variant: "primary",
          separator: true,
          onClick: () => onRecordPayment(invoice),
        },
        {
          label: "Void Invoice",
          icon: XCircle,
          variant: "danger",
          onClick: () => onVoid(invoice.id),
        }
      );
    }

    return actions;
  };

  return (
    <div className="w-full">
      {/* ✅ MOBILE: Premium Invoice CardGrid */}
      <div className="block md:hidden">
        <CardGrid
          data={data}
          getCardId={(invoice) => invoice.id}
          compact={true}
          cardClassName="!p-2.5 hover:!border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200"
          containerClassName="px-2 pb-2"
          maxHeight="calc(100vh - 160px)"
          
          renderCardHeader={({ item }) => {
            const clientName = (item as any).client?.full_name || (item as any).client_name || "Unknown Client";
            const dotColor = getStatusDotColor(item.status);
            
            return (
              <div 
                className="flex items-center justify-between w-full cursor-pointer"
                onClick={() => {
                  const bookingId = (item as any).booking?.id || (item as any).booking_id;
                  if (bookingId) {
                    router.push(`/dashboard/bookings/${bookingId}`);
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                      <FileText size={14} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5">
                      <div className={`w-2 h-2 rounded-full ${dotColor} ring-1 ring-[var(--color-surface)]`} />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--color-ink)] truncate">
                        {item.invoice_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <User size={9} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="text-[9px] text-[var(--color-ink-muted)] truncate">
                        {clientName}
                      </span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
              </div>
            );
          }}
          
          renderCardBody={({ item }) => {
            const bookingRef = (item as any).booking?.booking_number || (item as any).booking_number || (item as any).booking_ref || `#${(item as any).booking_id || "N/A"}`;
            const style = statusStyles[item.status] || statusStyles.draft;
            const StatusIcon = statusIcons[item.status] || FileText;
            const currency = item.currency_code || "KES";
            
            const amountDue = safeMoney(item.amount_due);
            const amountPaid = safeMoney(item.amount_paid);
            const remaining = safeMoney(item.remaining_balance);
            const isPartiallyPaid = amountPaid > 0 && remaining > 0;
            
            const statusLabel = isPartiallyPaid
              ? `Paid: ${currency} ${amountPaid.toLocaleString()}`
              : statusLabels[item.status];

            return (
              <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50">
                <div className="flex items-center gap-2">
                  {/* Booking Reference */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[var(--color-ink-muted)] flex-shrink-0">BK</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight font-mono">
                        {bookingRef}
                      </p>
                      <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                        Booking Ref
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <DollarSign size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight tabular-nums">
                        {currency} {amountDue.toLocaleString()}
                      </p>
                      <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                        {isPartiallyPaid ? `Bal: ${remaining.toLocaleString()}` : 'Amount Due'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                <div className="mt-1 flex items-center gap-1.5">
                  <CalendarDays size={9} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className={`text-[9px] font-medium ${item.status === 'overdue' ? 'text-[var(--color-danger-text)] font-semibold' : 'text-[var(--color-ink-muted)]'}`}>
                    {formatDate(item.due_date)}
                  </span>
                </div>

                {/* Status + Actions */}
                <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${style.bg} ${style.text}`}>
                    <StatusIcon size={8} className="flex-shrink-0 opacity-80" />
                    {statusLabel}
                  </span>
                  
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDownload(item.id); 
                    }}
                    className="text-[10px] font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    <Download size={11} />
                    PDF
                  </button>
                </div>
              </div>
            );
          }}
          
          rowActions={getInvoiceActions}
        />
      </div>

      {/* ✅ DESKTOP: Reusable DataTable */}
      <div className="hidden md:block">
        <DataTable
          data={data}
          columns={[
            {
              header: "Invoice #",
              accessorKey: "invoice_number",
              cell: ({ row }) => {
                const invoice = row.original;
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{invoice.invoice_number}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Booking Ref",
              accessorKey: "booking_ref",
              cell: ({ row }) => {
                const invoice = row.original;
                const bookingRef = (invoice as any).booking?.booking_number || (invoice as any).booking_number || (invoice as any).booking_ref || `#${(invoice as any).booking_id || "N/A"}`;
                const bookingId = (invoice as any).booking?.id || (invoice as any).booking_id;

                return bookingId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/bookings/${bookingId}`);
                    }}
                    className="group flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-ink)] hover:underline transition-all text-left font-mono"
                    title="View Booking Details"
                  >
                    {bookingRef}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <span className="text-sm text-[var(--color-ink-muted)] italic">Orphaned</span>
                );
              },
            },
            {
              header: "Amount",
              accessorKey: "amount_due",
              cell: ({ row }) => {
                const invoice = row.original;
                const currency = invoice.currency_code || "KES";
                const amountDue = safeMoney(invoice.amount_due);
                const amountPaid = safeMoney(invoice.amount_paid);
                const remaining = safeMoney(invoice.remaining_balance);
                const isPartiallyPaid = amountPaid > 0 && remaining > 0;

                return (
                  <div>
                    <p className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                      {currency} {amountDue.toLocaleString()}
                    </p>
                    {isPartiallyPaid && (
                      <p className="text-[10px] font-bold text-[var(--color-warning-text)] mt-0.5 tabular-nums">
                        Balance due: {remaining.toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              },
            },
            {
              header: "Due Date",
              accessorKey: "due_date",
              cell: ({ row }) => {
                const invoice = row.original;
                return (
                  <p className={`text-sm tabular-nums ${invoice.status === 'overdue' ? 'font-semibold text-[var(--color-danger-text)]' : 'text-[var(--color-ink-muted)]'}`}>
                    {formatDate(invoice.due_date)}
                  </p>
                );
              },
            },
            {
              header: "Payment Status",
              accessorKey: "status",
              cell: ({ row }) => {
                const invoice = row.original;
                const style = statusStyles[invoice.status] || statusStyles.draft;
                const StatusIcon = statusIcons[invoice.status] || FileText;
                const amountPaid = safeMoney(invoice.amount_paid);
                const remaining = safeMoney(invoice.remaining_balance);
                const isPartiallyPaid = amountPaid > 0 && remaining > 0;
                
                const label = isPartiallyPaid
                  ? `Paid: ${invoice.currency_code || "KES"} ${amountPaid.toLocaleString()}`
                  : statusLabels[invoice.status] || invoice.status.replace("_", " ");

                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    <StatusIcon size={10} className="flex-shrink-0 opacity-80" />
                    {label}
                  </span>
                );
              },
            },
            {
              header: "Client",
              accessorKey: "client_name",
              cell: ({ row }) => {
                const invoice = row.original;
                const clientName = (invoice as any).client?.full_name || (invoice as any).client_name || "Unknown Client";
                const clientId = (invoice as any).client?.id || (invoice as any).client_id;

                return clientId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/clients/${clientId}`);
                    }}
                    className="group flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-ink)] hover:underline transition-all text-left"
                    title="View Client Profile"
                  >
                    <User size={12} className="text-[var(--color-ink-subtle)]" />
                    {clientName}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <span className="text-sm text-[var(--color-ink-muted)] italic">Unknown</span>
                );
              },
            },
          ]}
          rowActions={getInvoiceActions}
          getRowId={(invoice) => invoice.id}
          loading={false}
          emptyMessage="No invoices found"
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
