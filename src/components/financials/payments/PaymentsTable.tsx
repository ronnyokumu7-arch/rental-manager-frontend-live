// src/components/financials/payments/PaymentsTable.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Receipt, CreditCard, Banknote, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";

interface PaymentsTableProps {
  data: Payment[];
}

export default function PaymentsTable({ data }: PaymentsTableProps) {
  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "mpesa":
        return <CreditCard size={14} />;
      case "manual":
        return <Banknote size={14} />;
      default:
        return <Receipt size={14} />;
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={14} />;
      case "failed":
        return <XCircle size={14} />;
      case "pending":
        return <Clock size={14} />;
    }
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              {getMethodIcon(p.method)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {p.reference || `Payment #${p.id}`}
              </p>
              <p className="text-xs text-slate-500">Invoice #{p.invoice_id}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {row.original.currency_code} {Number(row.original.amount).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => {
        const method = row.original.method;
        return (
          <div className="flex items-center gap-2">
            {getMethodIcon(method)}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
              {method}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status as PaymentStatus;
        const variant = 
          status === "completed" ? "success" : 
          status === "failed" ? "danger" : "warning";
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge variant={variant} size="sm">{status}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "paid_at",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.paid_at ? new Date(row.original.paid_at) : new Date(row.original.created_at);
        return (
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        );
      },
    },
  ];

  return <DataTable data={data} columns={columns} />;
}
