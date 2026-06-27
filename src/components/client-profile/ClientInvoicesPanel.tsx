// src/components/client-profile/ClientInvoicesPanel.tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Receipt, DollarSign, AlertCircle } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";

// ✅ Local interface to prevent TypeScript errors if global Invoice type is missing fields
interface InvoiceData {
  id: number | string;
  invoice_number?: string | number;
  status?: string;
  total_amount?: number | string;
  vehicle_plate?: string;
  start_date?: string;
  end_date?: string;
  booking_id?: number | string;
  booking_status?: string;
}

interface ClientInvoicesPanelProps {
  invoices: InvoiceData[];
}

export default function ClientInvoicesPanel({ invoices = [] }: ClientInvoicesPanelProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = useMemo(() => {
    // ✅ Defensive: ensure invoices is an array and use 'any' for the filter callback
    return (invoices || []).filter((inv: any) => {
      const matchesSearch =
        inv.invoice_number?.toString().includes(searchQuery) ||
        inv.id.toString().includes(searchQuery) ||
        inv.vehicle_plate?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Stats Calculations
  const totalInvoices = invoices.length;
  const totalRevenue = invoices
    .filter((i: any) => i.status === "paid")
    .reduce((sum: number, i: any) => sum + Number(i.total_amount || 0), 0);
  const unpaidAmount = invoices
    .filter((i: any) => i.status === "unpaid")
    .reduce((sum: number, i: any) => sum + Number(i.total_amount || 0), 0);

  // Date Formatter (DD/MM/YY)
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice # or vehicle plate..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-card border border-surface-border text-sm text-ink placeholder:text-ink-subtle focus:border-accent/50 focus:ring-2 focus:ring-accent-bg/20 transition-all shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-sm text-ink focus:border-accent/50 focus:ring-2 focus:ring-accent-bg/20 transition-all shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="voided">Voided</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-surface-card border border-surface-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={14} className="text-accent-dark" />
            <span className="text-xs text-ink-subtle uppercase font-semibold">Total</span>
          </div>
          <p className="text-lg font-bold text-ink">{totalInvoices}</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-card border border-surface-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-success" />
            <span className="text-xs text-ink-subtle uppercase font-semibold">Revenue</span>
          </div>
          <p className="text-lg font-bold text-ink">KES {(totalRevenue / 1000).toFixed(1)}K</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-card border border-surface-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-warning" />
            <span className="text-xs text-ink-subtle uppercase font-semibold">Unpaid</span>
          </div>
          <p className="text-lg font-bold text-ink">KES {(unpaidAmount / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Invoices Table */}
      <SectionCard padding={false} className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-surface border-b border-surface-border">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Invoice History</h4>
        </div>

        <div className="overflow-y-auto flex-1 max-h-[500px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-surface-card z-10">
              <tr className="border-b border-surface-border">
                <th className="px-4 py-2 w-12"></th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide">Invoice</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide">Date</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide">Vehicle</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-ink-subtle uppercase tracking-wide">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide">Status</th>
                <th className="px-4 py-2 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredInvoices.map((inv: any) => {
                let dotColor = "bg-ink-subtle";
                if (inv.booking_status === "active") dotColor = "bg-accent-dark";
                else if (inv.booking_status === "completed") dotColor = "bg-success";
                else if (inv.booking_status === "pending") dotColor = "bg-warning";

                const badgeVariant =
                  inv.status === "paid" ? "success" : inv.status === "unpaid" ? "warning" : "neutral";

                return (
                  <tr key={inv.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-4 py-3">
                      <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-surface-hover border border-surface-border flex-shrink-0">
                        <Receipt size={16} className="text-ink-muted" />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-card ${dotColor}`} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-ink">
                        #{inv.invoice_number || inv.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-ink-muted whitespace-nowrap">
                        {formatDate(inv.start_date)} - {formatDate(inv.end_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-ink">
                        {inv.vehicle_plate || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-ink">
                        KES {Number(inv.total_amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeVariant} size="xs">
                        {(inv.status || "unknown").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/dashboard/bookings/${inv.booking_id}`)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-hover text-ink-muted hover:bg-accent-bg hover:text-accent-dark transition-colors opacity-0 group-hover:opacity-100"
                        title="View Booking"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Receipt size={32} className="mx-auto text-ink-subtle mb-2" />
                    <p className="text-sm text-ink-muted">No invoices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
