// src/components/client-profile/ClientInvoicesPanel.tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Eye, Download, Send, MoreVertical } from "lucide-react";
import type { Invoice } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";

interface ClientInvoicesPanelProps {
  client: any;
  invoices: Invoice[];
}

export default function ClientInvoicesPanel({ invoices }: ClientInvoicesPanelProps) {
  const router = useRouter();
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

  // Format date as MM/DD/YY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white"
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
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">$ Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {(totalRevenue / 1000).toFixed(1)}K</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unpaid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {(unpaidAmount / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Invoices Table */}
      <SectionCard padding={false} className="flex-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Invoice History</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => {
                const badgeVariant =
                  inv.status === "paid" ? "success" : 
                  inv.status === "overdue" ? "danger" : 
                  inv.status === "void" ? "neutral" : "warning";

                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* Icon Column */}
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                    </td>

                    {/* Invoice Number */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        #{inv.invoice_number || `INV-${inv.id}`}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600">
                        {formatDate(inv.due_date)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">
                        KES {Number(inv.amount_due).toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant={badgeVariant} size="xs" className="uppercase">
                        {inv.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Invoice"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Send Invoice"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <FileText size={28} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No invoices found</p>
                    <p className="text-xs text-gray-500">Invoices for this client will appear here</p>
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
