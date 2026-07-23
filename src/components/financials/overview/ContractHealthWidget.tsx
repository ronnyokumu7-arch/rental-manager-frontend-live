// src/components/financials/overview/ContractHealthWidget.tsx
import { FileText, FileEdit, Send } from "lucide-react";
import type { ContractHealth } from "@/hooks/financials/useFinancialOverview";

interface Props {
  data: ContractHealth;
}

export default function ContractHealthWidget({ data }: Props) {
  // SVG Gauge Math
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dasharray for each segment
  const signedOffset = circumference - ((data.signed_percentage / 100) * circumference);
  const draftOffset = circumference - ((data.draft_percentage / 100) * circumference);
  const sentOffset = circumference - ((data.sent_percentage / 100) * circumference);

  // Calculate rotation offsets to stack segments
  const signedRotation = 0;
  const draftRotation = (data.signed_percentage / 100) * 360;
  const sentRotation = ((data.signed_percentage + data.draft_percentage) / 100) * 360;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-6 flex flex-col h-full">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-4">Contract Health</h3>
      
      <div className="flex items-center gap-6 flex-1">
        {/* List Metrics */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success-text)]" />
              <span className="text-xs font-medium text-[var(--color-ink)]">Signed</span>
            </div>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{data.signed_count} <span className="text-[var(--color-ink-muted)] font-normal">({data.signed_percentage}%)</span></span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-warning-text)]" />
              <span className="text-xs font-medium text-[var(--color-ink)]">Draft</span>
            </div>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{data.draft_count} <span className="text-[var(--color-ink-muted)] font-normal">({data.draft_percentage}%)</span></span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span className="text-xs font-medium text-[var(--color-ink)]">Sent</span>
            </div>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{data.sent_count} <span className="text-[var(--color-ink-muted)] font-normal">({data.sent_percentage}%)</span></span>
          </div>
        </div>

        {/* Multi-Segment Circular Gauge */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40" cy="40" r={radius}
              stroke="var(--color-surface-hover)"
              strokeWidth="6"
              fill="transparent"
            />
            
            {/* Signed segment (Green) */}
            {data.signed_percentage > 0 && (
              <circle
                cx="40" cy="40" r={radius}
                stroke="var(--color-success-text)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={signedOffset}
                strokeLinecap="round"
                style={{ transform: `rotate(${signedRotation}deg)`, transformOrigin: 'center' }}
                className="transition-all duration-1000 ease-out"
              />
            )}
            
            {/* Draft segment (Yellow/Warning) */}
            {data.draft_percentage > 0 && (
              <circle
                cx="40" cy="40" r={radius}
                stroke="var(--color-warning-text)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={draftOffset}
                strokeLinecap="round"
                style={{ transform: `rotate(${draftRotation}deg)`, transformOrigin: 'center' }}
                className="transition-all duration-1000 ease-out"
              />
            )}
            
            {/* Sent segment (Primary/Blue) */}
            {data.sent_percentage > 0 && (
              <circle
                cx="40" cy="40" r={radius}
                stroke="var(--color-primary)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={sentOffset}
                strokeLinecap="round"
                style={{ transform: `rotate(${sentRotation}deg)`, transformOrigin: 'center' }}
                className="transition-all duration-1000 ease-out"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-[var(--color-ink)] tabular-nums">{data.total_active}</span>
            <span className="text-[8px] font-bold text-[var(--color-ink-muted)] uppercase">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
