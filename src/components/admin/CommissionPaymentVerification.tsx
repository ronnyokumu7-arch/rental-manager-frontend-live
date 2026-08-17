// src/components/admin/CommissionPaymentVerification.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Smartphone,
  Wallet,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { commissionAdminApi, CommissionPayment } from "@/lib/api/commission";
import { tenantsApi } from "@/lib/api/tenants";

type QueueStatus = "pending" | "verified" | "rejected";

const STATUS_STYLES: Record<QueueStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function CommissionPaymentVerification() {
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const [tenantNames, setTenantNames] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<QueueStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // ✅ Tenant id → name map (queue shows names, not raw ids)
  useEffect(() => {
    tenantsApi
      .list(0, 500)
      .then((tenants) => {
        const map: Record<number, string> = {};
        tenants.forEach((t) => (map[t.id] = t.name));
        setTenantNames(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await commissionAdminApi.listPayments(statusFilter);
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load commission payments.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (p: CommissionPayment) => {
    setProcessingId(p.id);
    try {
      const res = await commissionAdminApi.verify(p.id);
      toast.success(
        `Payment verified — ${res.data.events_marked_paid} trip(s) marked paid. Tenant unlocked.`
      );
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Verification failed.");
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
      await commissionAdminApi.reject(id, rejectionReason.trim());
      toast.success("Payment rejected.");
      setRejectingId(null);
      setRejectionReason("");
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Rejection failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Commission Approvals</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Verify tenant M-Pesa payments against your Paybill statement.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QueueStatus)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl overflow-hidden shadow-sm">
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">All Caught Up!</h3>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-[240px]">
              No {statusFilter} commission payments in the queue right now.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-hover)]/50 text-[var(--color-ink-muted)] border-b border-[var(--color-surface-border)]">
                <tr>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Tenant</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">M-Pesa Code</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Submitted</th>
                  <th className="p-4 text-right font-bold uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-border)]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-[var(--color-ink)]">
                        {tenantNames[p.tenant_id] || `Tenant #${p.tenant_id}`}
                      </div>
                      <div className="text-[10px] text-[var(--color-ink-subtle)] font-mono">
                        ID: {p.tenant_id}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[var(--color-ink)] tabular-nums">
                        KES {parseFloat(p.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                          <Smartphone size={14} />
                        </div>
                        <span className="font-mono font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] px-2 py-1 rounded border border-[var(--color-surface-border)]">
                          {p.reference}
                        </span>
                      </div>
                      {p.notes && (
                        <div
                          className="mt-1 text-[10px] text-[var(--color-ink-subtle)] italic truncate max-w-[200px]"
                          title={p.notes}
                        >
                          &quot;{p.notes}&quot;
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-[var(--color-ink-muted)]">{formatDate(p.created_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {statusFilter !== "pending" ? (
                          // History view: show status chip instead of actions
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_STYLES[p.status]}`}
                          >
                            {p.status}
                          </span>
                        ) : rejectingId === p.id ? (
                          // Inline rejection input
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
                              onClick={() => handleReject(p.id)}
                              disabled={processingId === p.id}
                              className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-all"
                              title="Confirm Reject"
                            >
                              {processingId === p.id ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <CheckCircle size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectionReason("");
                              }}
                              className="p-2 rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all"
                              title="Cancel"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          // Standard actions
                          <>
                            <button
                              onClick={() => handleVerify(p)}
                              disabled={processingId === p.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 transition-all font-bold text-[11px]"
                            >
                              {processingId === p.id ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              Verify
                            </button>
                            <button
                              onClick={() => setRejectingId(p.id)}
                              disabled={processingId === p.id}
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
