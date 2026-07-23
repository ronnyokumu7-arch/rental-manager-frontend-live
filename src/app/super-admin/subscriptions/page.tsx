// src/components/admin/TenantSubscriptionVerification.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Smartphone, 
  Building2, 
  Loader2, 
  RefreshCw, 
  ShieldCheck 
} from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionsApi } from "@/lib/api/subscriptions";

// ✅ Interface matching the backend PaymentVerificationOut schema
interface SubscriptionRequest {
  id: number;
  tenant_id: number;
  tenant_name: string | null;
  target_plan: string;
  target_billing_cycle: string;
  payment_method: "mpesa" | "bank";
  reference_code: string;
  notes?: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export default function TenantSubscriptionVerification() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch pending requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await subscriptionsApi.getPendingRequests();
      setRequests(data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load subscription requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req: SubscriptionRequest) => {
    setProcessingId(req.id);
    try {
      // ✅ Backend automatically activates tenant & subscription
      await subscriptionsApi.approveRequest(req.id);
      
      toast.success(`Payment verified. ${req.tenant_name || 'Tenant'} workspace activated successfully.`);
      fetchRequests(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Approval failed. Check server logs.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    
    setProcessingId(id);
    try {
      await subscriptionsApi.rejectRequest(id, rejectionReason.trim());
      toast.success("Payment request rejected.");
      setRejectingId(null);
      setRejectionReason("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Rejection failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Subscription Approvals</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Live verification queue for incoming tenant payments.</p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl overflow-hidden shadow-sm">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">All Caught Up!</h3>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-[240px]">
              No pending payment verifications in the queue right now.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-hover)]/50 text-[var(--color-ink-muted)] border-b border-[var(--color-surface-border)]">
                <tr>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Tenant</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Plan & Cycle</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Payment Reference</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Submitted</th>
                  <th className="p-4 text-right font-bold uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-border)]">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-[var(--color-ink)]">{req.tenant_name || `Tenant #${req.tenant_id}`}</div>
                      <div className="text-[10px] text-[var(--color-ink-subtle)] font-mono">ID: {req.tenant_id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[var(--color-ink)] capitalize">
                          {req.target_plan === 'pro' ? 'Pro Fleet' : req.target_plan}
                        </span>
                        <span className="text-[10px] text-[var(--color-ink-muted)] capitalize bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded w-fit">
                          {req.target_billing_cycle}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          req.payment_method === "mpesa" 
                            ? "bg-emerald-500/10 text-emerald-600" 
                            : "bg-blue-500/10 text-blue-600"
                        }`}>
                          {req.payment_method === "mpesa" ? <Smartphone size={14} /> : <Building2 size={14} />}
                        </div>
                        <span className="font-mono font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] px-2 py-1 rounded border border-[var(--color-surface-border)]">
                          {req.reference_code}
                        </span>
                      </div>
                      {req.notes && (
                        <div className="mt-1 text-[10px] text-[var(--color-ink-subtle)] italic truncate max-w-[200px]" title={req.notes}>
                          "{req.notes}"
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-[var(--color-ink-muted)]">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {rejectingId === req.id ? (
                          // Inline Rejection Input
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                            <input
                              type="text"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Reason for rejection..."
                              className="px-2 py-1.5 rounded-lg border border-rose-500/30 bg-[var(--color-surface)] text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-rose-500 w-40"
                              autoFocus
                            />
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={processingId === req.id}
                              className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-all"
                              title="Confirm Reject"
                            >
                              {processingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                              className="p-2 rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all"
                              title="Cancel"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          // Standard Action Buttons
                          <>
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={processingId === req.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 transition-all font-bold text-[11px]"
                            >
                              {processingId === req.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(req.id)}
                              disabled={processingId === req.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 disabled:opacity-50 transition-all font-bold text-[11px]"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
