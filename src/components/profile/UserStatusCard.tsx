// src/components/profile/UserStatusCard.tsx
"use client";
import { useState } from "react";
import { Shield, Smartphone, Clock, Loader2, AlertCircle, X } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import Modal from "@/components/ui/Modal";
import type { User } from "@/lib/types";
import toast from "react-hot-toast";

interface UserStatusCardProps {
  user: User;
  onStatusAction: (action: "suspend" | "reactivate", reason?: string) => void;
  isSelfView?: boolean;
}

export default function UserStatusCard({ user, onStatusAction, isSelfView = false }: UserStatusCardProps) {
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

  return (
    <>
      {/* ✅ MAIN CARD: Plain background, no nested boxes */}
      <SectionCard className="!p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Status & Security</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Account health & settings</p>
          </div>
        </div>

        {/* 1. Account Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">Account Status</p>
            <p className={`text-sm font-bold mt-1 ${!user.is_suspended ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {user.is_suspended ? "Suspended" : "Active"}
            </p>
          </div>
          {/* ✅ Only show suspend button for Admins */}
          {!isSelfView && !showReasonInput && (
            <button 
              onClick={() => user.is_suspended ? onStatusAction("reactivate") : setShowReasonInput(true)} 
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

        {/* Suspend Reason Input (Inline) */}
        {showReasonInput && !user.is_suspended && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">Reason for suspension (optional).</p>
            </div>
            <input 
              type="text" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="e.g., Policy violation..." 
              className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none" 
            />
            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={() => { setIsActionLoading(true); onStatusAction("suspend", reason || undefined); setIsActionLoading(false); setShowReasonInput(false); setReason(""); }} 
                disabled={isActionLoading} 
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : "Confirm"}
              </button>
              <button onClick={() => { setShowReasonInput(false); setReason(""); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* 2. Two-Factor Auth */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">Two-Factor Auth</p>
            <p className={`text-sm font-bold mt-1 ${user.two_factor_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
              {user.two_factor_enabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          {/* ✅ New Button: Enable/Disable */}
          <button 
            onClick={() => setShow2FAModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              user.two_factor_enabled 
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" 
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400"
            }`}
          >
            {user.two_factor_enabled ? "Disable" : "Enable"}
          </button>
        </div>

        {/* 3. Last Login */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">Last Login</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{formatLastLogin(user.last_login_at)}</p>
          </div>
          <Clock size={16} className="text-slate-400" />
        </div>
      </SectionCard>

      {/* ✅ 2FA MODAL (Mimics Financials Modals) */}
      <Modal 
        open={show2FAModal} 
        onClose={() => setShow2FAModal(false)} 
        title={user.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"} 
        subtitle={user.two_factor_enabled ? "Remove the extra layer of security." : "Secure your account with an authenticator app."}
        size="md"
      >
        <div className="space-y-4">
          {/* Visual Placeholder for QR Code / Setup */}
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
              <Smartphone size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {user.two_factor_enabled ? "Turn off authentication?" : "Scan QR Code with your app"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
              {user.two_factor_enabled 
                ? "You will no longer need a code to log in." 
                : "Use Google Authenticator or Authy to scan the code below."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setShow2FAModal(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handle2FAToggle} 
              disabled={is2FALoading} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50 ${
                user.two_factor_enabled 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-indigo-600 hover:bg-indigo-700"
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
