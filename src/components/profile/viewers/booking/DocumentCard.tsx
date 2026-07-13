// src/components/profile/viewers/booking/DocumentCard.tsx
"use client";

import { FileText, CheckCircle2, AlertCircle, Eye, Link, Download, Clock } from "lucide-react";

interface DocumentCardProps {
  title: string;
  status: string;
  onView: () => void;
  onCopyLink: () => void;
  onDownload: () => void;
}

// ✅ BRAND TOKENS: Semantic status styling with opacity-based backgrounds
const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'generated':
    case 'signed':
      return { 
        label: 'Ready',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/5 border-emerald-500/10',
        icon: CheckCircle2 
      };
    case 'pending':
    case 'draft':
      return { 
        label: 'Pending',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/5 border-amber-500/10',
        icon: Clock 
      };
    default:
      return { 
        label: 'Not Available',
        color: 'text-[var(--color-ink-muted)]',
        bg: 'bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]',
        icon: AlertCircle 
      };
  }
};

export default function DocumentCard({ 
  title, 
  status, 
  onView, 
  onCopyLink, 
  onDownload 
}: DocumentCardProps) {

  const config = getStatusConfig(status);
  const isAvailable = status?.toLowerCase() === 'generated' || status?.toLowerCase() === 'signed';

  return (
    <div 
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
        isAvailable 
          ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 hover:border-[var(--color-surface-border)]/80 hover:shadow-sm cursor-pointer' 
          : 'border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/10'
      }`}
      onClick={isAvailable ? onView : undefined}
    >
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        
        {/* Icon Container */}
        <div className={`p-3 rounded-xl mb-3 border transition-colors ${config.bg}`}>
          <FileText size={24} className={config.color} />
        </div>
        
        {/* Title */}
        <h5 className="text-sm font-bold text-[var(--color-ink)] mb-1">{title}</h5>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${config.bg} ${config.color}`}>
          <config.icon size={10} />
          {config.label}
        </div>
      </div>

      {/* Action Overlay - Only visible when available */}
      {isAvailable && (
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <button 
            onClick={(e) => { e.stopPropagation(); onView(); }} 
            className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors" 
            title="View Document"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onCopyLink(); }} 
            className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors" 
            title="Copy Link"
          >
            <Link size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDownload(); }} 
            className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors" 
            title="Download PDF"
          >
            <Download size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
