import { useRouter } from "next/navigation";
import { Building2, Mail, User, Phone, Loader2, Search, Filter, Archive, Plus, CreditCard } from "lucide-react";
import { TenantActionsMenu } from "./TenantActionsMenu";
import type { Tenant } from "@/lib/types";

export function TenantsTable({ 
  filteredTenants, loading, actionLoadingId, 
  handleToggleSubscription, handleArchive,
  searchQuery, setSearchQuery, statusFilter, setStatusFilter, 
  subFilter, setSubFilter, showArchived, setShowArchived 
}: any) {
  const router = useRouter();

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-sm overflow-hidden">
      
      {/* Integrated Hero Action Row */}
      <div className="p-4 border-b border-[var(--color-surface-border)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" size={16} />
            <input
              placeholder="Search by name, email or KRA PIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
            />
          </div>
          <button
             onClick={() => setShowArchived(!showArchived)}
             className={`p-2.5 rounded-xl border transition-all ${showArchived ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"}`}
          >
            <Archive size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Restored Filter Icons */}
          <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs focus:outline-none">
              <option value="ALL">All Accounts</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
          
          <button onClick={() => router.push("/super-admin/agencies/new")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <Plus size={14} /> Onboard New
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[var(--color-ink-muted)] text-xs uppercase font-bold bg-[var(--color-surface-hover)]/30">
            <tr>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Admin Contact</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)]">
            {filteredTenants.map((tenant: Tenant) => (
              <tr key={tenant.id} className="hover:bg-[var(--color-primary)]/[0.02] transition-colors group">
                
                {/* Organization Column (Premium Icons Restored) */}
                <td className="py-4 px-4 align-top">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0 mt-0.5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)] transition-colors">{tenant.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] mt-0.5">
                        <Mail size={12} /> {tenant.email}
                      </div>
                      {tenant.profile?.tax_number && (
                        <div className="text-[10px] text-[var(--color-ink-subtle)] font-mono mt-0.5">PIN: {tenant.profile.tax_number}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Admin Contact (Avatar + Phone Icons Restored) */}
                <td className="py-4 px-4 align-top text-xs text-[var(--color-ink-muted)]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-[var(--color-ink-subtle)]" />
                      <span>{tenant.admin_name || "Not Set"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[var(--color-ink-subtle)]" />
                      <span>{tenant.admin_phone || "—"}</span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 align-top">
                   <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                    <CreditCard size={12} />
                    {tenant.plan || "Starter"}
                  </span>
                </td>

                <td className="py-4 px-4 align-top">
                  {tenant.is_trial ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> TRIAL
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                    </span>
                  )}
                </td>

                <td className="py-4 px-4 align-top text-right">
                  <TenantActionsMenu 
                    tenant={tenant}
                    onToggleSubscription={() => handleToggleSubscription(tenant)}
                    onArchive={() => handleArchive(tenant.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
