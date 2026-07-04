// src/components/client-profile/ClientInvoicesPanel.tsx
"use client";
import { useState, useMemo } from "react";
import { Search, FileText, Eye, Download, Send, CreditCard } from "lucide-react";
import type { Invoice } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";

interface ClientInvoicesPanelProps {
  client: any;
  invoices: Invoice[];
  onView: (id: number) => void;
  onShare: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onMarkPaid: (invoice: Invoice) => void;
}

export default function ClientInvoicesPanel({ 
  invoices, 
  onView, 
  onShare, 
  onDownload, 
  onMarkPaid 
}: ClientInvoicesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoice_number?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toString().includes(searchQuery);
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Stats Calculations
  const totalInvoices = invoices.length;
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount_due || 0), 0);
  const unpaidAmount = invoices
    .filter((i) => i.status === "draft" || i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.amount_due || 0), 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border bg-surface-card text-sm text-ink placeholder:text-ink-subtle focus:border-accent-dark focus:ring-2 focus:ring-accent-dark/20 transition-all outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-surface-border bg-surface-card text-sm text-ink focus:border-accent-dark focus:ring-2 focus:ring-accent-dark/20 transition-all outline-none"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="void">Voided</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-accent-dark" />
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl font-bold text-ink">{totalInvoices}</p>
        </div>
        <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-success-text">KES {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl border border-surface-border bg-surface-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Unpaid</span>
          </div>
          <p className="text-2xl font-bold text-warning-text">KES {unpaidAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <SectionCard padding={false} className="flex-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border bg-surface-hover">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Invoice History</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-hover border-b border-surface-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredInvoices.map((inv) => {
                const badgeVariant =
                  inv.status === "paid" ? "success" :
                  inv.status === "overdue" ? "danger" :
                  inv.status === "void" ? "neutral" : "warning";

                return (
                  <tr key={inv.id} className="hover:bg-surface-hover/50 transition-colors group">
                    {/* Icon Column */}
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-accent-bg border border-accent-border flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-accent-dark" />
                      </div>
                    </td>

                    {/* Invoice Number */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-ink">
                        #{inv.invoice_number || `INV-${inv.id}`}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-ink-muted">
                        {formatDate(inv.due_date)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-ink">
                        {inv.currency_code} {Number(inv.amount_due).toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant={badgeVariant} dot>
                        {inv.status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onView(inv.id)}
                          className="p-2 rounded-lg text-ink-muted hover:text-accent-dark hover:bg-accent-bg transition-colors"
                          title="View Invoice"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onShare(inv)}
                          className="p-2 rounded-lg text-ink-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Send Invoice"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={() => onDownload(inv)}
                          className="p-2 rounded-lg text-ink-muted hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        {inv.status !== "paid" && inv.status !== "void" && (
                          <button
                            onClick={() => onMarkPaid(inv)}
                            className="p-2 rounded-lg text-ink-muted hover:text-success hover:bg-success-bg transition-colors"
                            title="Mark as Paid"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                      <FileText size={28} className="text-ink-subtle" />
                    </div>
                    <p className="text-sm font-medium text-ink mb-1">No invoices found</p>
                    <p className="text-xs text-ink-muted">Invoices for this client will appear here</p>
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
