// src/components/profile/UserStatusCard.tsx
"use client";

import { useState } from "react";
import { 
  Shield, Key, Clock, Loader2, AlertTriangle, CheckCircle2, Ban 
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
  
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

  const formatLastLogin = (dateStr: string | null | undefined) => {
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
    setTimeout(() => {
      toast.success(user.two_factor_enabled ? "2FA Disabled" : "2FA Enabled (Mock)");
      setIs2FALoading(false);
      setShow2FAModal(false);
    }, 1000);
  };

  const handleSuspendConfirm = () => {
    setIsActionLoading(true);
    onStatusAction("suspend", reason.trim() || undefined);
    setShowReasonInput(false);
    setReason("");
  };

  const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-0.5 block";

  const isSuspended = user.is_suspended;
  const isActive = user.is_active && !isSuspended;

  return (
    <>
      {/* ✅ FIX: Removed 'h-full' and internal 'overflow-y-auto'. 
          The parent wrapper in page.tsx already handles the height and scrolling. */}
      <SectionCard className="!p-0 overflow-hidden shadow-2xs border-[var(--color-surface-border)] rounded-xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/10 shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={13} className="text-[var(--color-primary)]" />
            <h3 className="text-[10px] font-bold text-[var(--color-ink)] uppercase tracking-wider">
              Status & Security
            </h3>
          </div>
          <span className="text-[9px] font-semibold text-[var(--color-ink-subtle)] uppercase tracking-wider">
            Account Protection
          </span>
        </div>

        {/* Content: Tight spacing, no internal scroll */}
        <div className="p-3 space-y-2.5 divide-y divide-[var(--color-surface-border)]/50">
          
          {/* 1. Account Status */}
          <div className="flex flex-col gap-2 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className={labelClass}>Account Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    isSuspended ? 'bg-rose-500' : isActive ? 'bg-emerald-500' : 'bg-gray-400'
                  }`} />
                  <span className={`text-xs font-semibold truncate ${
                    isSuspended ? 'text-rose-600 dark:text-rose-400' : isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'
                  }`}>
                    {isSuspended ? "Suspended" : isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              
              {!isSelfView && !showReasonInput && (
                <button 
                  onClick={() => isSuspended ? onStatusAction("reactivate") : setShowReasonInput(true)} 
                  disabled={isActionLoading}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border disabled:opacity-50 active:scale-95 shrink-0 ${
                    isSuspended 
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20" 
                      : "text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20"
                  }`}
                >
                  {isActionLoading ? (
                    <Loader2 size={11} className="animate-spin" /> 
                  ) : isSuspended ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <Ban size={11} />
                  )}
                  <span>{isSuspended ? "Reactivate" : "Suspend"}</span>
                </button>
              )}
            </div>

            {isSuspended && user.suspension_reason && (
              <div className="px-2.5 py-2 rounded-lg bg-rose-500/5 border border-rose-500/20">
                <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 leading-tight">
                  <span className="font-bold">Reason:</span> {user.suspension_reason}
                </p>
              </div>
            )}

            {showReasonInput && !isSuspended && (
              <div className="pt-1 animate-in fade-in duration-150">
                <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle size={12} className="text-rose-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 leading-tight">
                      Specify audit reason for account suspension:
                    </p>
                  </div>
                  <input 
                    type="text" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    placeholder="Policy violation, inactive, etc..." 
                    className="w-full px-2.5 py-1 rounded border border-rose-500/20 bg-[var(--color-surface)] text-xs text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:outline-none focus:border-rose-500" 
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button 
                      onClick={() => { setShowReasonInput(false); setReason(""); }} 
                      className="px-2 py-0.5 rounded text-[11px] font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSuspendConfirm} 
                      disabled={isActionLoading || !reason.trim()} 
                      className="px-2.5 py-0.5 rounded text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-all"
                    >
                      {isActionLoading ? <Loader2 size={10} className="animate-spin" /> : "Confirm Suspend"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Two-Factor Auth */}
          <div className="flex items-center justify-between gap-2 pt-2.5">
            <div className="min-w-0">
              <span className={labelClass}>Two-Factor Security</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Key size={12} className={user.two_factor_enabled ? "text-emerald-500 shrink-0" : "text-[var(--color-ink-subtle)] shrink-0"} />
                <span className={`text-xs font-semibold truncate ${
                  user.two_factor_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--color-ink-muted)]"
                }`}>
                  {user.two_factor_enabled ? "2FA Protection On" : "Not Configured"}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setShow2FAModal(true)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border active:scale-95 shrink-0 ${
                user.two_factor_enabled 
                  ? "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]" 
                  : "text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20"
              }`}
            >
              {user.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"}
            </button>
          </div>

          {/* 3. Last Login Activity */}
          <div className="flex items-center justify-between gap-2 pt-2.5">
            <div className="min-w-0">
              <span className={labelClass}>Last Active Session</span>
              <span className="text-xs font-semibold text-[var(--color-ink)] block mt-0.5">
                {formatLastLogin(user.last_login_at)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[var(--color-ink-subtle)] shrink-0">
              <Clock size={12} />
            </div>
          </div>

        </div>
      </SectionCard>

      {/* 2FA Modal (Mock) */}
      <Modal 
        open={show2FAModal} 
        onClose={() => setShow2FAModal(false)} 
        title={user.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"} 
        subtitle={user.two_factor_enabled ? "Remove secondary verification layer." : "Secure workspace access with an authenticator key."}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center mb-3">
              <Key size={22} className="text-[var(--color-primary)]" />
            </div>
            <p className="text-xs font-bold text-[var(--color-ink)]">
              {user.two_factor_enabled ? "Turn off authentication?" : "Scan Key / QR Code"}
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-1 max-w-[260px] leading-relaxed">
              {user.two_factor_enabled 
                ? "Disabling two-factor authentication makes your account more vulnerable." 
                : "Use Google Authenticator, Authy, or your security key to scan and complete setup."}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setShow2FAModal(false)} 
              className="px-3 py-1.5 rounded-md text-xs font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handle2FAToggle} 
              disabled={is2FALoading} 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold text-white transition-all disabled:opacity-50 active:scale-95 ${
                user.two_factor_enabled 
                  ? "bg-rose-600 hover:bg-rose-700" 
                  : "bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
              }`}
            >
              {is2FALoading ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
              <span>{is2FALoading ? "Processing..." : user.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
