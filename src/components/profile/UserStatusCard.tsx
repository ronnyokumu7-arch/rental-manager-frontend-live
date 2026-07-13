// src/components/profile/UserStatusCard.tsx
"use client";

import { useState } from "react";
import { 
  Shield, Smartphone, Clock, Loader2, AlertTriangle, X, CheckCircle2, Ban 
} from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import Modal from "@/components/ui/Modal";
import type { User } from "@/lib/types";
import toast from "react-hot-toast";

interface UserStatusCardProps {
  user: User;
  onStatusAction: (action: "suspend" | "reactivate", reason?: string) => void;
  isSelfView?: boolean;
}

export default function UserStatusCard({ 
  user, 
  onStatusAction, 
  isSelfView = false 
}: UserStatusCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");
  
  // ✅ 2FA Modal State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

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

  const handle2FAToggle = async () => {
    setIs2FALoading(true);
    // TODO: Wire to backend endpoint later
    setTimeout(() => {
      toast.success(user.two_factor_enabled ? "2FA Disabled" : "2FA Enabled (Mock)");
      setIs2FALoading(false);
      setShow2FAModal(false);
    }, 1000);
  };

  const handleSuspendConfirm = () => {
    setIsActionLoading(true);
    onStatusAction("suspend", reason || undefined);
    // Note: Parent should handle loading state reset via refetch/callback
    setShowReasonInput(false);
    setReason("");
  };

  // ✅ BRAND TOKENS: Consistent with Personal Info Card & Health Dashboard
  const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1 block";
  const valueClass = "text-sm font-medium text-[var(--color-ink)]";
  const rowClass = "flex items-center justify-between py-3 border-b border-[var(--color-surface-border)] last:border-b-0";

  return (
    <>
      {/* ✅ PREMIUM STATUS CARD: No Header Container, Flush Alignment */}
      <SectionCard className="!p-0 overflow-hidden">
        
        {/* Unified Header with Icon */}
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-[var(--color-surface-border)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
            <Shield size={18} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Status & Security</h3>
            <p className="text-[11px] text-[var(--color-ink-muted)]">Account health & protection</p>
          </div>
        </div>

        {/* Dense Data Rows */}
        <div className="px-6 divide-y divide-[var(--color-surface-border)]">
          
          {/* 1. Account Status */}
          <div className={rowClass}>
            <div>
              <p className={labelClass}>Account Status</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${
                  !user.is_suspended ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <p className={`text-sm font-semibold ${
                  !user.is_suspended ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {user.is_suspended ? "Suspended" : "Active"}
                </p>
              </div>
            </div>
            
            {!isSelfView && !showReasonInput && (
              <button 
                onClick={() => user.is_suspended ? onStatusAction("reactivate") : setShowReasonInput(true)} 
                disabled={isActionLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 active:scale-95 ${
                  user.is_suspended 
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20" 
                    : "text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20"
                }`}
              >
                {isActionLoading ? (
                  <Loader2 size={12} className="animate-spin" /> 
                ) : user.is_suspended ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <Ban size={12} />
                )}
                {user.is_suspended ? "Reactivate" : "Suspend"}
              </button>
            )}
          </div>

          {/* Inline Suspend Reason (Premium Warning Style) */}
          {showReasonInput && !user.is_suspended && (
            <div className="py-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                    Provide a reason for audit trail. This action will be logged immediately.
                  </p>
                </div>
                <input 
                  type="text" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="e.g., Policy violation, inactive account..." 
                  className="w-full px-3 py-2 rounded-lg border border-amber-500/20 bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" 
                />
                <div className="flex items-center gap-2 pt-1">
                  <button 
                    onClick={handleSuspendConfirm} 
                    disabled={isActionLoading || !reason.trim()} 
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : "Confirm Suspend"}
                  </button>
                  <button 
                    onClick={() => { setShowReasonInput(false); setReason(""); }} 
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Two-Factor Auth */}
          <div className={rowClass}>
            <div>
              <p className={labelClass}>Two-Factor Auth</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Smartphone size={14} className={user.two_factor_enabled ? "text-emerald-500" : "text-[var(--color-ink-subtle)]"} />
                <p className={`text-sm font-semibold ${
                  user.two_factor_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--color-ink-muted)]"
                }`}>
                  {user.two_factor_enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShow2FAModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                user.two_factor_enabled 
                  ? "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 border border-[var(--color-surface-border)]" 
                  : "text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
              }`}
            >
              {user.two_factor_enabled ? "Disable" : "Enable"}
            </button>
          </div>

          {/* 3. Last Login */}
          <div className={`${rowClass} border-b-0`}>
            <div>
              <p className={labelClass}>Last Login</p>
              <p className="text-sm font-semibold text-[var(--color-ink)] mt-0.5">{formatLastLogin(user.last_login_at)}</p>
            </div>
            <Clock size={16} className="text-[var(--color-ink-subtle)]" />
          </div>

        </div>
      </SectionCard>

      {/* ✅ PREMIUM 2FA MODAL */}
      <Modal 
        open={show2FAModal} 
        onClose={() => setShow2FAModal(false)} 
        title={user.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"} 
        subtitle={user.two_factor_enabled ? "Remove the extra layer of security." : "Secure your account with an authenticator app."}
        size="md"
      >
        <div className="space-y-5">
          {/* Visual Placeholder for QR Code / Setup */}
          <div className="p-8 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
              <Smartphone size={28} className="text-[var(--color-primary)]" />
            </div>
            <p className="text-sm font-bold text-[var(--color-ink)]">
              {user.two_factor_enabled ? "Turn off authentication?" : "Scan QR Code with your app"}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-2 max-w-[240px] leading-relaxed">
              {user.two_factor_enabled 
                ? "You will no longer need a verification code to log in. This reduces account security." 
                : "Use Google Authenticator or Authy to scan the code below and secure your workspace."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setShow2FAModal(false)} 
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handle2FAToggle} 
              disabled={is2FALoading} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 active:scale-95 ${
                user.two_factor_enabled 
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20" 
                  : "bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 shadow-[var(--color-primary)]/20"
              }`}
            >
              {is2FALoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              {is2FALoading ? "Processing..." : user.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
