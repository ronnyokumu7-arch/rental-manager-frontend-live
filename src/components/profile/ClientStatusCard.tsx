"use client";
import { useState } from "react";
import { Shield, CreditCard, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

interface ClientStatusCardProps {
  client: Client;
  onStatusAction: (action: "suspend" | "reactivate") => void;
}

export default function ClientStatusCard({ client, onStatusAction }: ClientStatusCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  let dlHealth = { label: "Not Set", color: "neutral", icon: Clock };
  if (client.dl_expiry) {
    const daysLeft = Math.ceil((new Date(client.dl_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) dlHealth = { label: "Expired", color: "danger", icon: AlertCircle };
    else if (daysLeft < 30) dlHealth = { label: `${daysLeft}d Left`, color: "warning", icon: AlertCircle };
    else dlHealth = { label: "Active", color: "success", icon: CheckCircle2 };
  }

  const getActionConfig = () => {
    switch (client.status) {
      case "pending":
        return { label: "Verify", variant: "bg-blue-600 hover:bg-blue-700 text-white", action: "reactivate" as const };
      case "active":
        return { label: "Suspend", variant: "bg-amber-500 hover:bg-amber-600 text-white", action: "suspend" as const };
      case "suspended":
        return { label: "Reactivate", variant: "bg-emerald-600 hover:bg-emerald-700 text-white", action: "reactivate" as const };
      default:
        return { label: "Manage", variant: "bg-slate-600 text-white", action: null };
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

  return (
    <SectionCard className="!p-0 overflow-hidden">
      {/* ✅ Standardized Header: Matches PersonalInfoCard exactly */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Status & Verification
          </h3>
        </div>
      </div>

      {/* ✅ Standardized Body Padding & Tightened Spacing */}
      <div className="px-5 py-4 space-y-3">
        {/* Account Status Row */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
              <Shield size={16} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Account Status</p>
              <p className={`text-sm font-bold ${client.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"}`}>
                {client.status === "active" ? "Verified" : client.status}
              </p>
            </div>
          </div>
          
          {actionConfig.action && (
            <button
              onClick={handleButtonClick}
              disabled={isActionLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${actionConfig.variant}`}
            >
              {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : null}
              {isActionLoading ? "Processing..." : actionConfig.label}
            </button>
          )}
        </div>

        {/* DL Health Status Row */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
              <CreditCard size={16} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">DL Health Status</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                EXP: {client.dl_expiry ? new Date(client.dl_expiry).toLocaleDateString("en-GB") : "N/A"}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            dlHealth.color === "success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
            dlHealth.color === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
            dlHealth.color === "danger" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
          }`}>
            <dlHealth.icon size={12} /> {dlHealth.label}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
