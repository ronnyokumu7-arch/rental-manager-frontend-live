// src/components/profile/viewers/booking/BookingDocuments.tsx
"use client";

import { FileText, FileSignature, CheckCircle, Clock, AlertCircle, Eye, Link, Download } from "lucide-react";

interface BookingDocumentsProps {
  contractStatus: string;
  invoiceStatus: string;
  onViewContract: () => void;
  onCopyContractLink: () => void;
  onDownloadContract: () => void;
  onViewInvoice: () => void;
  onCopyInvoiceLink: () => void;
  onDownloadInvoice: () => void;
}

// ✅ Simple, safe status config matching your existing patterns
const getStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "signed" || s === "generated") {
    return { label: "Ready", color: "text-emerald-500", bg: "bg-emerald-500/5 border-emerald-500/20", icon: CheckCircle };
  }
  if (s === "sent" || s === "pending") {
    return { label: "Pending", color: "text-amber-500", bg: "bg-amber-500/5 border-amber-500/20", icon: Clock };
  }
  return { label: "Not Available", color: "text-[var(--color-ink-subtle)]", bg: "bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]", icon: AlertCircle };
};

function DocumentTile({ title, status, onView, onCopy, onDownload, Icon }: any) {
  const config = getStatusConfig(status);
  const isReady = status?.toLowerCase() === "signed" || status?.toLowerCase() === "generated";

  return (
    <div className={`relative group rounded-2xl border p-5 transition-all ${isReady ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 hover:border-[var(--color-primary)]/30' : 'border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/10'}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl border ${config.bg}`}>
          <Icon size={20} className={config.color} />
        </div>
        <div>
          <h5 className="text-sm font-bold text-[var(--color-ink)]">{title}</h5>
          <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${config.bg} ${config.color}`}>
            <config.icon size={10} />
            {config.label}
          </div>
        </div>
      </div>

      {isReady && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--color-surface-border)]/50">
          <button onClick={onView} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/10 transition-all">
            <Eye size={14} /> View
          </button>
          <button onClick={onCopy} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-surface-border)] transition-all">
            <Link size={14} /> Copy
          </button>
          <button onClick={onDownload} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-surface-border)] transition-all">
            <Download size={14} /> Download
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookingDocuments({ 
  contractStatus, invoiceStatus,
  onViewContract, onCopyContractLink, onDownloadContract,
  onViewInvoice, onCopyInvoiceLink, onDownloadInvoice
}: BookingDocumentsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Trip Documents</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DocumentTile 
          title="Rental Contract" 
          status={contractStatus} 
          Icon={FileSignature}
          onView={onViewContract} 
          onCopy={onCopyContractLink} 
          onDownload={onDownloadContract} 
        />
        <DocumentTile 
          title="Invoice" 
          status={invoiceStatus} 
          Icon={FileText}
          onView={onViewInvoice} 
          onCopy={onCopyInvoiceLink} 
          onDownload={onDownloadInvoice} 
        />
      </div>
    </div>
  );
}
