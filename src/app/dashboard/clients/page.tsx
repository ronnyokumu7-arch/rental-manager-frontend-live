// src/app/dashboard/clients/page.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Mail,
  Phone,
  User as UserIcon,
  ChevronRight,
  Archive,
  Shield,
  ShieldAlert,
  MoreVertical,
  Loader2,
  Link,
  Search,
  Filter,
  ChevronDown, // ✅ ADDED
} from "lucide-react";
import { useClientsList } from "@/hooks/clients/useClientsList";

export default function ClientsPage() {
  const router = useRouter();
  const {
    loading,
    view,
    setView,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    filteredClients,
    paginatedClients,
    totalPages,
    totalClients,
    activeClients,
    suspendedClients,
    actionLoadingId,
    openDropdownId,
    setOpenDropdownId,
    handleVerify,
    handleSuspend,
    handleReactivate,
    handleArchive,
  } = useClientsList();

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Users size={20} />
            </div>
            Manage Clients
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {view === "active" ? "Manage your client database and relationships" : "Archived client records"}
          </p>
        </div>
        
        {view === "active" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {/* TODO: Wire intake form link logic */}}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] shadow-sm transition-all active:scale-95"
            >
              <Link size={16} /> Share Intake Form
            </button>
            <button
              onClick={() => router.push("/dashboard/clients/new")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all active:scale-95"
            >
              <Plus size={16} /> New Client
            </button>
          </div>
        )}
      </div>

      {/* Premium Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] flex-shrink-0">
              <button
                onClick={() => setView("active")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === "active" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setView("vault")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  view === "vault" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Archive size={12} /> Archived
              </button>
            </div>

            {view === "active" && (
              <div className="hidden md:flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">Registered</span>
                  <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalClients}</span>
                </div>
                <div className="w-px h-3 bg-[var(--color-surface-border)]" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active Now</span>
                  <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeClients}</span>
                </div>
                <div className="w-px h-3 bg-[var(--color-surface-border)]" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">Suspended</span>
                  <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{suspendedClients}</span>
                </div>
              </div>
            )}
          </div>

          {/* ✅ UPDATED: Standardized Filter Padding (pl-9 pr-9) with custom ChevronDown for perfect symmetry */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>
            <div className="relative w-full lg:w-48">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading clients...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              {view === "active" ? "No clients found" : "No archived clients"}
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || statusFilter ? "Try adjusting your search or filters." : view === "active" ? "Get started by adding your first client." : "Archived clients will appear here."}
            </p>
            {view === "active" && !search && !statusFilter && (
              <button onClick={() => router.push("/dashboard/clients/new")} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95">
                <Plus size={16} /> Add Client
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Client</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Contact</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">National ID</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Driver's License</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-border)]">
                  {paginatedClients.map((client) => {
                    // Status Logic
                    const statusLabel = client.status === 'pending' ? 'Pending' : client.status;
                    const statusColors: Record<string, string> = {
                      active: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
                      pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      suspended: "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]",
                      inactive: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]",
                    };

                    // ✅ UPDATED: Background removed, only semantic text color + hover background
                    let ActionIcon = ShieldAlert;
                    let actionColor = "text-amber-600 hover:bg-amber-500/10";
                    let actionTitle = "Suspend Client";
                    let actionHandler = () => handleSuspend(client.id);

                    if (client.status === 'pending') {
                      ActionIcon = Shield;
                      actionColor = "text-blue-600 hover:bg-blue-500/10";
                      actionTitle = "Verify Client";
                      actionHandler = () => handleVerify(client.id);
                    } else if (client.status === 'suspended') {
                      ActionIcon = Shield;
                      actionColor = "text-emerald-600 hover:bg-emerald-500/10";
                      actionTitle = "Reactivate Client";
                      actionHandler = () => handleReactivate(client.id);
                    }

                    return (
                      <tr
                        key={client.id}
                        onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                        className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                              <UserIcon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{client.full_name}</p>
                              {client.email ? (
                                <a href={`mailto:${client.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate">
                                  <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                                  <span className="truncate">{client.email}</span>
                                </a>
                              ) : (
                                <p className="text-xs text-[var(--color-ink-muted)] truncate">No email</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                            <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                            <span className="font-medium">{client.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {client.id_number ? (
                            <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">{client.id_number}</span>
                          ) : (
                            <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {client.dl_number ? (
                            <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">{client.dl_number}</span>
                          ) : (
                            <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[client.status] || statusColors.inactive}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* ✅ UPDATED: Background removed, only hover effect */}
                            <button
                              onClick={(e) => { e.stopPropagation(); actionHandler(); }}
                              disabled={actionLoadingId === client.id}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-50 ${actionColor}`}
                              title={actionTitle}
                            >
                              {actionLoadingId === client.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <ActionIcon size={14} />
                              )}
                            </button>

                            {/* ✅ UPDATED: Background removed, only hover effect */}
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === client.id ? null : client.id); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                                title="More Actions"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {openDropdownId === client.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    onClick={() => { router.push(`/dashboard/clients/${client.id}`); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                                  >
                                    <UserIcon size={14} /> View Full Profile
                                  </button>
                                  <button
                                    onClick={() => { handleArchive(client.id); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                  >
                                    <Archive size={14} /> Archive Client
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[var(--color-surface-border)] flex items-center justify-between">
              <p className="text-xs text-[var(--color-ink-muted)]">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredClients.length)} of {filteredClients.length} clients
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
