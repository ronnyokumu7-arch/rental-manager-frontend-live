"use client";
import { useState } from "react";
import { Shield, Smartphone, Loader2, Clock, AlertCircle } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { User } from "@/lib/types";

interface UserStatusCardProps {
  user: User;
  onStatusAction: (action: "suspend" | "reactivate", reason?: string) => void;
  isSelfView?: boolean;
}

export default function UserStatusCard({ user, onStatusAction, isSelfView = false }: UserStatusCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");

  const formatLastLogin = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleSuspendClick = () => {
    if (user.is_suspended) {
      onStatusAction("reactivate");
    } else {
      setShowReasonInput(true);
    }
  };

  const handleConfirmSuspend = () => {
    setIsActionLoading(true);
    onStatusAction("suspend", reason || undefined);
    setShowReasonInput(false);
    setReason("");
    setIsActionLoading(false);
  };

  return (
    <SectionCard className="!p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Status & Security</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Account status and security settings</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Account Status Row */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
              <Shield size={16} className={user.is_suspended ? "text-amber-500" : "text-emerald-500"} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Account Status</p>
              <p className={`text-sm font-bold ${!user.is_suspended ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {user.is_suspended ? "Suspended" : "Active"}
              </p>
            </div>
          </div>
          {!isSelfView && !showReasonInput && (
            <button
              onClick={handleSuspendClick}
              disabled={isActionLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                user.is_suspended 
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" 
                  : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
              }`}
            >
              {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : user.is_suspended ? "Reactivate" : "Suspend"}
            </button>
          )}
        </div>

        {/* Suspend Reason Input (shows when suspending) */}
        {showReasonInput && !user.is_suspended && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">Please provide a reason for suspension (optional but recommended).</p>
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Policy violation, Inactive for 30 days..."
              className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleConfirmSuspend} disabled={isActionLoading} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50">
                {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : "Confirm Suspend"}
              </button>
              <button onClick={() => { setShowReasonInput(false); setReason(""); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 2FA Status Row */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
              <Smartphone size={16} className={user.two_factor_enabled ? "text-emerald-500" : "text-slate-400"} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Two-Factor Auth</p>
              <p className={`text-sm font-bold ${user.two_factor_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                {user.two_factor_enabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
          {user.two_factor_enabled ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Protected</span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Not set up</span>
          )}
        </div>

        {/* Last Login Row */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
              <Clock size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Last Login</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatLastLogin(user.last_login_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
