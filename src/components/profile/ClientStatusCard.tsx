// src/components/profile/ClientStatusCard.tsx
"use client";

import { useState } from "react";
import { 
  Shield, CreditCard, CheckCircle2, AlertCircle, 
  Clock, Loader2, Ban, UserCheck 
} from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

interface ClientStatusCardProps {
  client: Client;
  onStatusAction: (action: "suspend" | "reactivate") => void;
}

export default function ClientStatusCard({ 
  client, 
  onStatusAction 
}: ClientStatusCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  // ✅ DL Health Logic with Semantic States
  const getDlHealth = () => {
    if (!client.dl_expiry) return { label: "Not Set", color: "neutral", icon: Clock };
    
    const daysLeft = Math.ceil(
      (new Date(client.dl_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysLeft < 0) return { label: "Expired", color: "danger", icon: AlertCircle };
    if (daysLeft < 30) return { label: `${daysLeft}d Left`, color: "warning", icon: AlertCircle };
    return { label: "Active", color: "success", icon: CheckCircle2 };
  };

  const dlHealth = getDlHealth();

  // ✅ Action Config with Semantic Styling
  const getActionConfig = () => {
    switch (client.status) {
      case "pending":
        return { 
          label: "Verify Client", 
          variant: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20",
          action: "reactivate" as const,
          icon: UserCheck
        };
      case "active":
        return { 
          label: "Suspend", 
          variant: "text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20",
          action: "suspend" as const,
          icon: Ban
        };
      case "suspended":
        return { 
          label: "Reactivate", 
          variant: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20",
          action: "reactivate" as const,
          icon: UserCheck
        };
      default:
        return { label: "Manage", variant: "", action: null, icon: null };
    }
  };

  const actionConfig = getActionConfig();

  const handleButtonClick = async () => {
    if (!actionConfig.action) return;
    setIsActionLoading(true);
    try {
      await onStatusAction(actionConfig.action);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ✅ BRAND TOKENS: Consistent with all profile components
  const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1 block";
  const valueClass = "text-sm font-semibold text-[var(--color-ink)]";
  const rowClass = "flex items-center justify-between py-4 border-b border-[var(--color-surface-border)] last:border-b-0";

  return (
    <SectionCard className="!p-0 overflow-hidden">
      
      {/* Unified Header */}
      <div className="flex items-center gap-3 p-6 pb-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
          <Shield size={18} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Status & Verification</h3>
          <p className="text-[11px] text-[var(--color-ink-muted)]">Account health and compliance status</p>
        </div>
      </div>

      {/* Dense Data Rows */}
      <div className="px-6 divide-y divide-[var(--color-surface-border)]">
        
        {/* Account Status Row */}
        <div className={rowClass}>
          <div>
            <p className={labelClass}>Account Status</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${
                client.status === 'active' ? 'bg-emerald-500' : 
                client.status === 'suspended' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <p className={`text-sm font-semibold ${
                client.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 
                client.status === 'suspended' ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--color-ink)]'
              }`}>
                {client.status === 'active' ? 'Verified & Active' : client.status}
              </p>
            </div>
          </div>
          
          {actionConfig.action && (
            <button
              onClick={handleButtonClick}
              disabled={isActionLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${actionConfig.variant}`}
            >
              {isActionLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : actionConfig.icon ? (
                <actionConfig.icon size={12} />
              ) : null}
              {isActionLoading ? "Processing..." : actionConfig.label}
            </button>
          )}
        </div>

        {/* DL Health Status Row */}
        <div className={`${rowClass} border-b-0`}>
          <div>
            <p className={labelClass}>Driver's License</p>
            <div className="flex items-center gap-2 mt-0.5">
              <CreditCard size={14} className="text-[var(--color-ink-subtle)]" />
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                {client.dl_expiry 
                  ? new Date(client.dl_expiry).toLocaleDateString("en-GB") 
                  : "Not Provided"}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
            dlHealth.color === "success" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10" :
            dlHealth.color === "warning" ? "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/10" :
            dlHealth.color === "danger" ? "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/10" :
            "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]"
          }`}>
            <dlHealth.icon size={12} /> 
            {dlHealth.label}
          </div>
        </div>

      </div>
    </SectionCard>
  );
}
