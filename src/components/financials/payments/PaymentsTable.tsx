// src/components/financials/payments/PaymentsTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { Receipt, CreditCard, Banknote, Upload, FileText, RotateCcw, ExternalLink, Download, CalendarDays, User, ChevronRight } from "lucide-react";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import type { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";

interface PaymentsTableProps {
  data: Payment[];
  onExportCsv?: (id: number) => void;
  onDownloadPdf?: (id: number) => void;
  onIssueRefund?: (id: number) => void;
}

const getMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case "mpesa": return CreditCard;
    case "manual": return Banknote;
    default: return Receipt;
  }
};

const getMethodStyle = (method: PaymentMethod) => {
  if (method === "mpesa") return { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" };
  return { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" };
};

const getStatusStyle = (status: PaymentStatus) => {
  switch (status) {
    case "completed": return { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" };
    case "failed": return { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" };
    case "pending": return { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" };
    case "void": return { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" };
    default: return { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" };
  }
};

// ✅ Solid, saturated dot colors so the status pops on dark mode
const getStatusDotColor = (status: PaymentStatus) => {
  switch (status) {
    case "completed": return "bg-emerald-500";
    case "failed": return "bg-rose-500";
    case "pending": return "bg-amber-500";
    case "void": return "bg-gray-400";
    default: return "bg-gray-400";
  }
};

const statusLabels: Record<PaymentStatus, string> = {
  completed: "Completed",
  failed: "Failed",
  pending: "Pending",
  void: "Void",
};

const formatDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
};

export default function PaymentsTable({ 
  data, 
  onExportCsv, 
  onDownloadPdf, 
  onIssueRefund 
}: PaymentsTableProps) {
  const router = useRouter();

  // ✅ Reusable row actions for both table and cards
  const getPaymentActions = (payment: Payment): RowAction<Payment>[] => {
    const actions: RowAction<Payment>[] = [];

    if (onExportCsv) {
      actions.push({
        label: "Export CSV",
        icon: Upload,
        variant: "default",
        onClick: () => onExportCsv(payment.id),
      });
    }

    if (onDownloadPdf) {
      actions.push({
        label: "Download PDF",
        icon: Download,
        variant: "default",
        onClick: () => onDownloadPdf(payment.id),
      });
    }

    if (onIssueRefund) {
      actions.push({
        label: "Issue Refund",
        icon: RotateCcw,
        variant: "danger",
        separator: true,
        onClick: () => onIssueRefund(payment.id),
      });
    }

    return actions;
  };

  return (
    <div className="w-full">
      {/* ✅ MOBILE: Premium Payment CardGrid */}
      <div className="block md:hidden">
        <CardGrid<Payment>
          data={data}
          getCardId={(payment) => payment.id}
          compact={true}
          cardClassName="!p-2.5 hover:!border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200"
          containerClassName="px-2 pb-2"
          maxHeight="calc(100vh - 160px)"
          
          renderCardHeader={({ item }) => {
            const invoiceRef = (item as any).invoice?.invoice_number || (item as any).invoice_number || `Invoice #${item.invoice_id || "N/A"}`;
            const clientName = (item as any).client?.full_name || (item as any).client_name || "Unknown Client";
            const dotColor = getStatusDotColor(item.status);
            
            return (
              <div 
                className="flex items-center justify-between w-full cursor-pointer"
                onClick={() => {
                  const bookingId = (item as any).booking_id || (item as any).invoice?.booking_id;
                  if (bookingId) {
                    router.push(`/dashboard/bookings/${bookingId}`);
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                      <Receipt size={14} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5">
                      <div className={`w-2 h-2 rounded-full ${dotColor} ring-1 ring-[var(--color-surface)]`} />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--color-ink)] truncate">
                        {invoiceRef}
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
            const date = item.paid_at ? new Date(item.paid_at) : new Date(item.created_at);
            const methodStyle = getMethodStyle(item.method);
            const MethodIcon = getMethodIcon(item.method);
            
            return (
              <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50">
                <div className="flex items-center gap-2">
                  {/* Amount */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Banknote size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight tabular-nums">
                        {item.currency_code || "KES"} {Number(item.amount).toLocaleString()}
                      </p>
                      <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                        Amount
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <CalendarDays size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                        {formatDate(date)}
                      </p>
                      <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                        Received
                      </span>
                    </div>
                  </div>
                </div>

                {/* Method + Actions */}
                <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${methodStyle.bg} ${methodStyle.text}`}>
                    <MethodIcon size={8} className="flex-shrink-0" />
                    {item.method}
                  </span>
                  
                  {onDownloadPdf && (
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onDownloadPdf(item.id); 
                      }}
                      className="text-[10px] font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <Download size={11} />
                      PDF
                    </button>
                  )}
                </div>
              </div>
            );
          }}
          
          rowActions={getPaymentActions}
        />
      </div>

      {/* ✅ DESKTOP: Reusable DataTable */}
      <div className="hidden md:block">
        <DataTable
          data={data}
          columns={[
            {
              header: "Invoice Ref",
              accessorKey: "invoice_number",
              cell: ({ row }) => {
                const payment = row.original;
                const invoiceRef = (payment as any).invoice?.invoice_number || (payment as any).invoice_number || `Invoice #${payment.invoice_id || "N/A"}`;
                const bookingId = payment.booking_id || (payment as any).invoice?.booking_id;
                
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-[var(--color-ink-subtle)]" />
                    </div>
                    <div className="min-w-0">
                      {bookingId ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/bookings/${bookingId}`);
                          }}
                          className="group flex items-center gap-1.5 text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-ink)] hover:underline transition-all text-left"
                          title="View Booking Profile"
                        >
                          {invoiceRef}
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <span className="text-sm font-bold text-[var(--color-ink)]">{invoiceRef}</span>
                      )}
                      
                      {payment.reference && (
                        <p className="text-[11px] text-[var(--color-ink-muted)] truncate font-mono mt-0.5">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Payment Method",
              accessorKey: "method",
              cell: ({ row }) => {
                const payment = row.original;
                const methodStyle = getMethodStyle(payment.method);
                const MethodIcon = getMethodIcon(payment.method);
                
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${methodStyle.bg} ${methodStyle.text}`}>
                    <MethodIcon size={14} />
                    {payment.method}
                  </span>
                );
              },
            },
            {
              header: "Amount",
              accessorKey: "amount",
              cell: ({ row }) => (
                <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                  {row.original.currency_code || "KES"} {Number(row.original.amount).toLocaleString()}
                </span>
              ),
            },
            {
              header: "Client",
              accessorKey: "client_name",
              cell: ({ row }) => {
                const payment = row.original;
                const clientName = (payment as any).client?.full_name || (payment as any).client_name || "Unknown Client";
                const clientId = (payment as any).client?.id || (payment as any).client_id;

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
                  <span className="text-sm text-[var(--color-ink-muted)] italic">{clientName}</span>
                );
              },
            },
            {
              header: "Payment Status",
              accessorKey: "status",
              cell: ({ row }) => {
                const payment = row.original;
                const statusStyle = getStatusStyle(payment.status);
                
                return (
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusLabels[payment.status] || payment.status}
                  </span>
                );
              },
            },
            {
              header: "Date Received",
              accessorKey: "paid_at",
              cell: ({ row }) => {
                const payment = row.original;
                const date = payment.paid_at ? new Date(payment.paid_at) : new Date(payment.created_at);
                return (
                  <span className="text-sm text-[var(--color-ink-muted)]">
                    {formatDate(date)}
                  </span>
                );
              },
            },
          ]}
          rowActions={getPaymentActions}
          getRowId={(payment) => payment.id}
          loading={false}
          emptyMessage="No payments found"
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
