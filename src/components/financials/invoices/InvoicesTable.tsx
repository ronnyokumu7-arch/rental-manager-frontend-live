// src/components/financials/invoices/InvoicesTable.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Receipt, Download, Link2, Banknote, XCircle } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";

interface InvoicesTableProps {
  data: Invoice[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onVoid: (id: number) => void;
  onRecordPayment: (invoice: Invoice) => void;
}

export default function InvoicesTable({ data, onDownload, onCopyLink, onVoid, onRecordPayment }: InvoicesTableProps) {
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoice_number",
      header: "Invoice",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <Receipt size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{inv.invoice_number}</p>
              <p className="text-xs text-slate-500">Booking #{inv.booking_id || "N/A"}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount_due",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {row.original.currency_code} {Number(row.original.amount_due).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status as InvoiceStatus;
        const variant = 
          status === "paid" ? "success" : 
          status === "overdue" ? "danger" : 
          status === "void" ? "neutral" : 
          status === "sent" ? "accent" : "warning";
        return <Badge variant={variant} dot>{status}</Badge>;
      },
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => {
        const date = new Date(row.original.due_date);
        const isOverdue = date < new Date() && row.original.status !== "paid" && row.original.status !== "void";
        return (
          <div className={`text-sm font-medium ${isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}>
            {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            {isOverdue && <span className="block text-[10px] font-bold uppercase text-red-500">Overdue</span>}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Manage",
      cell: ({ row }) => {
        const inv = row.original;
        const isPaidOrVoid = inv.status === "paid" || inv.status === "void";
        return (
          <div className="flex items-center gap-1">
            <button onClick={() => onDownload(inv.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors" title="Download PDF">
              <Download size={14} />
            </button>
            <button onClick={() => onCopyLink(inv.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors" title="Copy Share Link">
              <Link2 size={14} />
            </button>
            {!isPaidOrVoid && (
              <>
                <button onClick={() => onRecordPayment(inv)} className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors" title="Record Payment">
                  <Banknote size={14} />
                </button>
                <button onClick={() => onVoid(inv.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors" title="Void Invoice">
                  <XCircle size={14} />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return <DataTable data={data} columns={columns} />;
}
