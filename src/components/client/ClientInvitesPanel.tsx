// src/components/client/ClientInvitesPanel.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserPlus, Link2, Copy, Check, Mail, X, Loader2, Clock, Ban, MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { clientInvitesApi, ClientInvite } from "@/lib/api/clientInvites";

const sectionClass = "bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4";

export default function ClientInvitesPanel() {
  const [invites, setInvites] = useState<ClientInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [ttl, setTtl] = useState(7);
  const [shareInvite, setShareInvite] = useState<ClientInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await clientInvitesApi.list();
      setInvites(res.data);
    } catch (err) {
      console.error("[ClientInvites] load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const linkFor = (inv: ClientInvite) =>
    `${window.location.origin}/invite/${inv.token}`;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await clientInvitesApi.create(ttl);
      setShareInvite(res.data);
      await load();
    } catch {
      toast.error("Failed to generate invite link");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (inv: ClientInvite) => {
    await navigator.clipboard.writeText(linkFor(inv));
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = (inv: ClientInvite) => {
    const text = encodeURIComponent(
      `Hi! Complete your rental onboarding here:\n${linkFor(inv)}\n(The link is single-use and expires ${new Date(inv.expires_at).toLocaleDateString()}.)`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = (inv: ClientInvite) => {
    const subject = encodeURIComponent("Your rental onboarding invitation");
    const body = encodeURIComponent(
      `Hi,\n\nComplete your onboarding here: ${linkFor(inv)}\n\nThis link is single-use and expires on ${new Date(inv.expires_at).toLocaleDateString()}.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleRevoke = async (id: number) => {
    setRevokingId(id);
    try {
      await clientInvitesApi.revoke(id);
      toast.success("Invite revoked");
      await load();
    } catch {
      toast.error("Failed to revoke invite");
    } finally {
      setRevokingId(null);
      setConfirmRevokeId(null);
    }
  };

  const statusChip = (inv: ClientInvite) => {
    if (inv.status === "accepted")
      return { label: "Used", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    if (inv.status === "revoked")
      return { label: "Revoked", cls: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
    if (inv.is_expired)
      return { label: "Expired", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    return { label: "Live", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  };

  return (
    <section className={sectionClass}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
            <UserPlus size={15} className="text-[var(--color-primary)]" />
            Client Invites
          </h3>
          <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">
            Generate single-use onboarding links. Clients submit their own details for review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            className="px-2 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-xs focus:outline-none"
          >
            <option value={1}>1 day</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Invite Client
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={18} className="animate-spin text-[var(--color-ink-muted)]" />
        </div>
      ) : invites.length === 0 ? (
        <p className="text-xs text-[var(--color-ink-subtle)] text-center py-6">
          No invites yet. Generate your first link above.
        </p>
      ) : (
        <div className="space-y-2">
          {invites.map((inv) => {
            const chip = statusChip(inv);
            return (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link2 size={12} className="text-[var(--color-ink-subtle)] shrink-0" />
                    <span className="text-[11px] font-mono text-[var(--color-ink)] truncate">
                      ...{inv.token.slice(-8)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-bold ${chip.cls}`}>
                      {chip.label}
                    </span>
                  </div>
                  <p className="text-[9px] text-[var(--color-ink-subtle)] mt-1 flex items-center gap-1">
                    <Clock size={9} />
                    Expires {new Date(inv.expires_at).toLocaleDateString()} ·
                    Created {new Date(inv.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions (live invites only) */}
                {inv.is_live && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={() => setShareInvite(inv)} title="Share"
                      className="p-1.5 rounded-md text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                      <MessageCircle size={13} />
                    </button>
                    <button type="button" onClick={() => handleCopy(inv)} title="Copy link"
                      className="p-1.5 rounded-md text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors">
                      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                    {confirmRevokeId === inv.id ? (
                      <button type="button" onClick={() => handleRevoke(inv.id)}
                        disabled={revokingId === inv.id}
                        className="px-2 py-1 rounded-md text-[9px] font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-50">
                        {revokingId === inv.id ? "..." : "Confirm?"}
                      </button>
                    ) : (
                      <button type="button" onClick={() => setConfirmRevokeId(inv.id)} title="Revoke"
                        className="p-1.5 rounded-md text-[var(--color-ink-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                        <Ban size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {shareInvite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md border border-[var(--color-surface-border)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[var(--color-ink)]">Share Onboarding Link</h4>
              <button type="button" onClick={() => setShareInvite(null)}
                className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] mb-4">
              <p className="text-[10px] font-mono text-[var(--color-ink-muted)] break-all">
                {linkFor(shareInvite)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <button type="button" onClick={() => handleCopy(shareInvite)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all">
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-[var(--color-ink-muted)]" />}
                <span className="text-[10px] font-bold text-[var(--color-ink)]">Copy</span>
              </button>
              <button type="button" onClick={() => shareWhatsApp(shareInvite)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--color-surface-border)] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                <MessageCircle size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-[var(--color-ink)]">WhatsApp</span>
              </button>
              <button type="button" onClick={() => shareEmail(shareInvite)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--color-surface-border)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <Mail size={16} className="text-blue-500" />
                <span className="text-[10px] font-bold text-[var(--color-ink)]">Email</span>
              </button>
            </div>

            <p className="text-[9px] text-[var(--color-ink-subtle)] text-center">
              Single-use link · expires {new Date(shareInvite.expires_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
