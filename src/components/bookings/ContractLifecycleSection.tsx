// src/components/bookings/ContractLifecycleSection.tsx
"use client";

import { FileText, Mail, CheckCircle2, Copy, Share2, Plus } from "lucide-react";
import type { Contract } from "@/lib/types";
import Badge from "@/components/ui/Badge";

interface ContractLifecycleSectionProps {
  contract: Contract | null;
  onGenerate?: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}

export default function ContractLifecycleSection({ 
  contract, 
  onGenerate, 
  onCopyLink, 
  onShare 
}: ContractLifecycleSectionProps) {
  
  // ── EMPTY STATE: Manual Override ─────────────────────────────────────────
  if (!contract) {
    return (
      <div className="bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-surface-border)] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center mb-4">
          <FileText size={24} className="text-[var(--color-primary)]" />
        </div>
        <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">No Contract Generated</h3>
        <p className="text-xs text-[var(--color-ink-muted)] mb-6 max-w-[280px] leading-relaxed">
          A contract will auto-generate when the client accepts the quotation, or you can generate it manually now.
        </p>
        {onGenerate && (
          <button
            onClick={onGenerate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary)]/90 transition-all shadow-sm shadow-[var(--color-primary)]/20 active:scale-95"
          >
            <Plus size={14} /> Generate Contract
          </button>
        )}
      </div>
    );
  }

  // ── ACTIVE STATE: Lifecycle Timeline ─────────────────────────────────────
  const isDraft = contract.status === "draft";
  const isSent = contract.status === "sent";
  const isSigned = contract.status === "signed";

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
            <FileText size={18} className="text-[var(--color-primary)]" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Contract Lifecycle</h3>
        </div>
        <Badge variant={isSigned ? "success" : isSent ? "accent" : "neutral"} dot>
          {contract.status.toUpperCase()}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative pl-2 space-y-6 mb-8">
        {/* Vertical Track Line */}
        <div className="absolute left-[27px] top-3 bottom-3 w-px bg-[var(--color-surface-border)]" />
        
        {/* Active Progress Line (stops at the current step) */}
        <div 
          className="absolute left-[27px] top-3 w-px bg-emerald-500 transition-all duration-700 ease-out"
          style={{ 
            height: isSigned ? '100%' : isSent ? '50%' : '0%' 
          }} 
        />

        {/* Node 1: Generated */}
        <div className="relative flex items-start gap-4">
          <div className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${
            !isDraft 
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
              : 'bg-[var(--color-surface-hover)] border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]'
          }`}>
            <FileText size={18} />
          </div>
          <div className="pt-2">
            <p className={`text-xs font-bold ${!isDraft ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'}`}>
              Generated
            </p>
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">
              Created on {new Date(contract.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Node 2: Sent */}
        <div className="relative flex items-start gap-4">
          <div className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${
            isSigned 
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
              : isSent 
                ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10' 
                : 'bg-[var(--color-surface-hover)] border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]'
          }`}>
            <Mail size={18} />
          </div>
          <div className="pt-2">
            <p className={`text-xs font-bold ${isSigned || isSent ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'}`}>
              Sent to Client
            </p>
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">
              {!isDraft ? `Delivered on ${new Date(contract.updated_at).toLocaleDateString()}` : 'Awaiting delivery...'}
            </p>
          </div>
        </div>

        {/* Node 3: Signed */}
        <div className="relative flex items-start gap-4">
          <div className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${
            isSigned 
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
              : 'bg-[var(--color-surface-hover)] border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]'
          }`}>
            <CheckCircle2 size={18} />
          </div>
          <div className="pt-2">
            <p className={`text-xs font-bold ${isSigned ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'}`}>
              Signed & Executed
            </p>
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">
              {isSigned ? `Signed on ${new Date(contract.signed_at || contract.updated_at).toLocaleDateString()}` : 'Pending client signature'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="pt-5 border-t border-[var(--color-surface-border)]">
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Contract ID</p>
            <p className="text-sm font-mono font-semibold text-[var(--color-ink)] mt-0.5">{contract.contract_number}</p>
          </div>
        </div>
      
        <div className="flex gap-3">
          <button 
            onClick={onCopyLink} 
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)]/80 hover:border-[var(--color-surface-border)]/80 transition-all active:scale-95"
          >
            <Copy size={14} /> Copy Link
          </button>
          <button 
            onClick={onShare} 
            disabled={isSigned} 
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm shadow-[var(--color-primary)]/20"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
