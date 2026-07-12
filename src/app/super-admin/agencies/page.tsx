// src/app/super-admin/agencies/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Plus, Search, Filter, CheckCircle2, XCircle,
  ShieldAlert, Loader2, RefreshCw, Archive,
  User, Phone, Mail, CreditCard, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import { tenantsApi } from "@/lib/api/tenants";
import type { Tenant } from "@/lib/types";

export default function SuperAdminTenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showArchived, setShowArchived] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await tenantsApi.list(0, 100);
      setTenants(data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load tenant directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Navigate to agency profile
  const handleRowClick = (tenantId: number | string) => {
    router.push(`/super-admin/agencies/${tenantId}`);
  };

  const handleSuspend = async (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation(); // Prevent row click
    try {
      await tenantsApi.suspend(id, "Administrative Action");
      toast.success("Tenant suspended");
      fetchTenants();
    } catch (error: any) {
      toast.error(error?.message || "Action failed");
    }
  };

  const handleActivate = async (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation(); // Prevent row click
    try {
      await tenantsApi.activate(id);
      toast.success("Tenant activated");
      fetchTenants();
    } catch (error: any) {
      toast.error(error?.message || "Action failed");
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation(); // Prevent row click
    if (!confirm("Are you sure you want to move this tenant to the Vault?")) return;
    try {
      await tenantsApi.archive(id);
      toast.success("Tenant moved to Vault");
      fetchTenants();
    } catch (error: any) {
      toast.error(error?.message || "Action failed");
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const kraPin = tenant.profile?.tax_number || "";
    const matchesSearch =
      tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.admin_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kraPin.toLowerCase().includes(searchQuery.toLowerCase());

    if (!showArchived && tenant.is_archived) return false;

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "ACTIVE") return matchesSearch && tenant.is_active;
    if (statusFilter === "SUSPENDED") return matchesSearch && !tenant.is_active;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <Building2 className="text-[var(--color-primary)]" size={28} />
            Tenant Management
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Overview and controls for all provisioned rental platform workspaces.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`p-2.5 rounded-xl border transition-all ${
              showArchived
                ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
            }`}
            title="Toggle Vault View"
          >
            <Archive size={18} />
          </button>
          <button
            onClick={fetchTenants}
            className="p-2.5 rounded-xl border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-all"
            title="Refresh List"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          </button>
          <button
            onClick={() => router.push("/super-admin/agencies/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary)]/90 transition-all shadow-sm"
          >
            <Plus size={18} /> Onboard New Tenant
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or KRA PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-[var(--color-ink-subtle)]" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--color-ink-muted)] gap-3">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={20} />
            <span className="text-sm">Fetching tenant records...</span>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-ink-muted)]">
            <ShieldAlert className="mx-auto mb-2 opacity-50" size={32} />
            <p className="font-semibold text-sm">No tenants found</p>
            <p className="text-xs text-[var(--color-ink-subtle)] mt-1">Try adjusting your filters or onboard a new workspace.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 text-[var(--color-ink-muted)] font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-1/3">Organization</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-border)]">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    onClick={() => handleRowClick(tenant.id)}
                    className="group cursor-pointer hover:bg-[var(--color-primary)]/[0.03] transition-colors"
                  >
                    {/* Column 1: Icon + Org + Email */}
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                          <Building2 size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--color-ink)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                            {tenant.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] mt-0.5">
                            <Mail size={12} className="flex-shrink-0" />
                            <span className="truncate">{tenant.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Denormalized Admin Details */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink)]">
                          <User size={12} className="text-[var(--color-ink-subtle)]" />
                          <span>{tenant.admin_name || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
                          <Phone size={12} className="flex-shrink-0" />
                          <span>{tenant.admin_phone || tenant.phone_number || "—"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Subscription */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                          <CreditCard size={12} />
                          {tenant.plan}
                        </span>
                        <p className="text-[10px] text-[var(--color-ink-subtle)]">
                          {tenant.subscription_status}
                        </p>
                      </div>
                    </td>

                    {/* Column 4: Status */}
                    <td className="py-4 px-4">
                      {tenant.is_archived ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-600">
                          <Archive size={12} /> Vaulted
                        </span>
                      ) : tenant.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600">
                          <XCircle size={12} /> Suspended
                        </span>
                      )}
                    </td>

                    {/* Column 5: Manage */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!tenant.is_archived && (
                          <>
                            {tenant.is_active ? (
                              <button
                                onClick={(e) => handleSuspend(e, tenant.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleActivate(e, tenant.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={(e) => handleArchive(e, tenant.id)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                              title="Move to Vault"
                            >
                              <Archive size={14} />
                            </button>
                          </>
                        )}
                        {/* Visual hint that row is clickable */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-ink-subtle)]">
                          <ExternalLink size={14} />
                        </div>
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
