"use client";
import { useState } from "react";
import { FileText, FileSignature, Copy, Download } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";
import type { Invoice, Contract } from "@/lib/types";

interface FinancialOverviewCardProps {
  invoices: Invoice[];
  contracts: Contract[];
  onAction: (type: "invoice" | "contract", action: "copy" | "download", id: number) => void;
}

export default function FinancialOverviewCard({ invoices, contracts, onAction }: FinancialOverviewCardProps) {
  const [activeTab, setActiveTab] = useState<"invoices" | "contracts">("invoices");

  // Limit to the most recent 3 items (Assuming parent hook sorts them by date desc)
  const recentInvoices = invoices.slice(0, 3);
  const recentContracts = contracts.slice(0, 3);

  return (
    <SectionCard title="Financials & Documents" icon={FileText} className="!p-5">
      {/* Toggle Switch */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
            activeTab === "invoices" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <FileText size={14} /> Invoices
        </button>
        <button
          onClick={() => setActiveTab("contracts")}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
            activeTab === "contracts" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <FileSignature size={14} /> Contracts
        </button>
      </div>

      {/* INVOICES LIST */}
      {activeTab === "invoices" && (
        recentInvoices.length > 0 ? (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
              <div className="col-span-4">Invoice</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Manage</div>
            </div>
            
            {/* Rows */}
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-sm transition-all group">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                    <FileText size={16} />
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{inv.invoice_number}</span>
                </div>
                <div className="col-span-2 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(inv.due_date).toLocaleDateString()}
                </div>
                <div className="col-span-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {inv.currency_code} {Number(inv.amount_due).toLocaleString()}
                </div>
                <div className="col-span-2">
                  <Badge variant={inv.status === "paid" ? "success" : inv.status === "void" ? "danger" : "warning"} dot>
                    {inv.status}
                  </Badge>
                </div>
                <div className="col-span-2 flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onAction("invoice", "copy", inv.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Copy Share Link"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => onAction("invoice", "download", inv.id)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No invoices generated yet.</div>
        )
      )}

      {/* CONTRACTS LIST */}
      {activeTab === "contracts" && (
        recentContracts.length > 0 ? (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
              <div className="col-span-4">Booking Ref</div>
              <div className="col-span-3">Start Date</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Manage</div>
            </div>
            
            {/* Rows */}
            {recentContracts.map((contract) => (
              <div key={contract.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-sm transition-all group">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                    <FileSignature size={16} />
                  </div>
                  {/* Fallback to BK-{id} if booking_number isn't populated yet */}
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono">
                    {contract.booking_number || `BK-${contract.booking_id}`}
                  </span>
                </div>
                <div className="col-span-3 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(contract.start_date || contract.created_at).toLocaleDateString()}
                </div>
                <div className="col-span-3">
                  <Badge variant={contract.status === "signed" ? "success" : contract.status === "sent" ? "accent" : "neutral"} dot>
                    {contract.status}
                  </Badge>
                </div>
                <div className="col-span-2 flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onAction("contract", "copy", contract.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Copy Share Link"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => onAction("contract", "download", contract.id)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No contracts generated yet.</div>
        )
      )}
    </SectionCard>
  );
}
