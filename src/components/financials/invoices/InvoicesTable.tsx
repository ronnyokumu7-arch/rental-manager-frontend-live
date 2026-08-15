// src/components/financials/invoices/InvoicesTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { FileText, Download, Copy, DollarSign, XCircle, ExternalLink, } from "lucide-react";
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

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
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

  // ✅ Reusable row actions for both table and cards
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
      {/* ✅ MOBILE: Reusable CardGrid (simplified, non-collapsible) */}
      <div className="block md:hidden">
        <CardGrid
          data={data}
          getCardId={(invoice) => invoice.id}
          
          // Header: Icon + Invoice Number + Client Name
          renderCardHeader={({ item }) => {
            const clientName = (item as any).client?.full_name || (item as any).client_name || "Unknown Client";
            return (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[var(--color-ink)] truncate leading-tight">
                    {item.invoice_number}
                  </h4>
                  <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5 font-medium">
                    {clientName}
                  </p>
                </div>
              </div>
            );
          }}
          
          // Body: All content in one clean section
          renderCardBody={({ item }) => {
            const bookingRef = (item as any).booking?.booking_number || (item as any).booking_number || (item as any).booking_ref || `#${(item as any).booking_id || "N/A"}`;
            const style = statusStyles[item.status] || statusStyles.draft;
            
            return (
              <div className="space-y-3">
                {/* Booking Ref + Amount */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">Booking Ref</p>
                    <p className="text-xs font-bold text-[var(--color-ink)] mt-0.5 font-mono truncate">
                      {bookingRef}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">Amount Due</p>
                    <p className="text-sm font-bold text-[var(--color-ink)] mt-0.5 tabular-nums">
                      {item.currency_code} {Number(item.amount_due).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">Due:</span>
                  <span className={`text-xs font-medium ${item.status === 'overdue' ? 'text-[var(--color-danger-text)] font-semibold' : 'text-[var(--color-ink-muted)]'}`}>
                    {formatDate(item.due_date)}
                  </span>
                </div>

                {/* Status Dot + Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-surface-border)]/40">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.bg.replace('/10', '')}`} title={statusLabels[item.status]} />
                    <span className="text-[10px] font-bold uppercase text-[var(--color-ink-muted)]">
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onCopyLink(item.id); }}
                      className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDownload(item.id); }}
                      className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <Download size={12} /> PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
          
          // ✅ Row actions (3-dots menu) - correctly targeted via portal
          rowActions={getInvoiceActions}
          
          // Pagination - using same pageSize as desktop for consistency
          currentPage={1}
          totalPages={1}
          totalItems={data.length}
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
              cell: ({ row }) => (
                <p className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                  {row.original.currency_code} {Number(row.original.amount_due).toLocaleString()}
                </p>
              ),
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
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    {statusLabels[invoice.status] || invoice.status.replace("_", " ")}
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
                    {clientName}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <span className="text-sm text-[var(--color-ink-muted)] italic">Unknown</span>
                );
              },
            },
          ]}
          // ✅ Row actions (3-dots menu) - correctly targeted via portal
          rowActions={getInvoiceActions}
          getRowId={(invoice) => invoice.id}
          loading={false}
          emptyMessage="No invoices found"
          // Pagination props - handled by parent InvoicesTab
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
