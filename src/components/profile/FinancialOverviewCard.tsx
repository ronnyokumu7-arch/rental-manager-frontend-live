// src/components/profile/FinancialOverviewCard.tsx
"use client";

import { useState } from "react";
import { FileText, FileSignature, Copy, Download, ArrowRight } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";
import type { Invoice, Contract } from "@/lib/types";

interface FinancialOverviewCardProps {
  invoices: Invoice[];
  contracts: Contract[];
  onAction: (type: "invoice" | "contract", action: "copy" | "download", id: number) => void;
}

export default function FinancialOverviewCard({ 
  invoices, 
  contracts, 
  onAction 
}: FinancialOverviewCardProps) {
  const [activeTab, setActiveTab] = useState<"invoices" | "contracts">("invoices");

  // Limit to the most recent 3 items (Assuming parent hook sorts them by date desc)
  const recentInvoices = invoices.slice(0, 3);
  const recentContracts = contracts.slice(0, 3);

  return (
    <SectionCard className="!p-0 overflow-hidden">
      
      {/* ✅ UNIFIED HEADER WITH INTEGRATED TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
            <FileText size={18} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Financials & Documents</h3>
            <p className="text-[11px] text-[var(--color-ink-muted)]">Recent invoices and active contracts</p>
          </div>
        </div>

        {/* Premium Toggle Switch */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "invoices" 
                ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-surface-border)]" 
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/50"
            }`}
          >
            <FileText size={14} /> Invoices
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "contracts" 
                ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-surface-border)]" 
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/50"
            }`}
          >
            <FileSignature size={14} /> Contracts
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-6">
        
        {/* INVOICES LIST */}
        {activeTab === "invoices" && (
          recentInvoices.length > 0 ? (
            <div className="space-y-1">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase font-bold text-[var(--color-ink-muted)] tracking-wider">
                <div className="col-span-4">Invoice</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              {/* Rows - Flush Alignment, No Nested Backgrounds */}
              {recentInvoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors group cursor-default"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-500">
                      <FileText size={16} />
                    </div>
                    <span className="font-bold text-sm text-[var(--color-ink)]">{inv.invoice_number}</span>
                  </div>
                  <div className="col-span-2 text-sm text-[var(--color-ink-muted)]">
                    {new Date(inv.due_date).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 text-sm font-semibold text-[var(--color-ink)]">
                    {inv.currency_code} {Number(inv.amount_due).toLocaleString()}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={inv.status === "paid" ? "success" : inv.status === "void" ? "danger" : "warning"} dot>
                      {inv.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onAction("invoice", "copy", inv.id)}
                      className="p-2 rounded-lg text-[var(--color-ink-subtle)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
                      title="Copy Share Link"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => onAction("invoice", "download", inv.id)}
                      className="p-2 rounded-lg text-[var(--color-ink-subtle)] hover:text-emerald-500 hover:bg-emerald-500/5 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-[var(--color-ink-subtle)]" />
              </div>
              <p className="text-sm font-bold text-[var(--color-ink)] mb-1">No Invoices Yet</p>
              <p className="text-xs text-[var(--color-ink-muted)] max-w-[240px] mx-auto leading-relaxed">
                Generate your first invoice to track payments and revenue here.
              </p>
            </div>
          )
        )}

        {/* CONTRACTS LIST */}
        {activeTab === "contracts" && (
          recentContracts.length > 0 ? (
            <div className="space-y-1">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase font-bold text-[var(--color-ink-muted)] tracking-wider">
                <div className="col-span-4">Booking Ref</div>
                <div className="col-span-3">Start Date</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              {/* Rows - Flush Alignment, No Nested Backgrounds */}
              {recentContracts.map((contract) => (
                <div 
                  key={contract.id} 
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors group cursor-default"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/5 border border-violet-500/10 text-violet-500">
                      <FileSignature size={16} />
                    </div>
                    <span className="font-bold text-sm text-[var(--color-ink)] font-mono">
                      {contract.booking_number || `BK-${contract.booking_id}`}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm text-[var(--color-ink-muted)]">
                    {new Date(contract.start_date || contract.created_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-3">
                    <Badge variant={contract.status === "signed" ? "success" : contract.status === "sent" ? "accent" : "neutral"} dot>
                      {contract.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onAction("contract", "copy", contract.id)}
                      className="p-2 rounded-lg text-[var(--color-ink-subtle)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
                      title="Copy Share Link"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => onAction("contract", "download", contract.id)}
                      className="p-2 rounded-lg text-[var(--color-ink-subtle)] hover:text-emerald-500 hover:bg-emerald-500/5 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
                <FileSignature size={28} className="text-[var(--color-ink-subtle)]" />
              </div>
              <p className="text-sm font-bold text-[var(--color-ink)] mb-1">No Contracts Yet</p>
              <p className="text-xs text-[var(--color-ink-muted)] max-w-[240px] mx-auto leading-relaxed">
                Create a booking to generate contracts and manage agreements here.
              </p>
            </div>
          )
        )}

      </div>
    </SectionCard>
  );
}
