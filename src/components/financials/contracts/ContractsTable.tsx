// src/components/financials/contracts/ContractsTable.tsx
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Download, Link2, Send, XCircle } from "lucide-react";
import type { Contract, ContractStatus } from "@/lib/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";

interface ContractsTableProps {
  data: Contract[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onSend: (id: number) => void;
  onVoid: (id: number) => void;
}

export default function ContractsTable({ data, onDownload, onCopyLink, onSend, onVoid }: ContractsTableProps) {
  const columns: ColumnDef<Contract>[] = [
    {
      accessorKey: "contract_number",
      header: "Contract",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.contract_number}</p>
              <p className="text-xs text-slate-500">Booking #{c.booking_id || "N/A"}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status as ContractStatus;
        const variant = 
          status === "signed" ? "success" : 
          status === "void" ? "danger" : 
          status === "sent" ? "accent" : "neutral";
        return <Badge variant={variant} dot>{status}</Badge>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created Date",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Manage",
      cell: ({ row }) => {
        const c = row.original;
        const isVoidOrSigned = c.status === "void" || c.status === "signed";
        return (
          <div className="flex items-center gap-1">
            <button onClick={() => onDownload(c.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 transition-colors" title="Download PDF">
              <Download size={14} />
            </button>
            <button onClick={() => onCopyLink(c.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 transition-colors" title="Copy Share Link">
              <Link2 size={14} />
            </button>
            {!isVoidOrSigned && (
              <button onClick={() => onSend(c.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors" title="Email to Client">
                <Send size={14} />
              </button>
            )}
            {!isVoidOrSigned && (
              <button onClick={() => onVoid(c.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors" title="Void Contract">
                <XCircle size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return <DataTable data={data} columns={columns} />;
}
