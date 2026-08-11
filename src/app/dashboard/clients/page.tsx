// src/app/dashboard/clients/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Building2,
  Plus,
  Mail,
  Phone,
  User as UserIcon,
  Archive,
  Shield,
  ShieldAlert,
  MoreVertical,
  Loader2,
  Search,
  Filter,
  BadgeCheck,
} from "lucide-react";
import { useClientsList } from "@/hooks/clients/useClientsList";

type ClientSegment = "individual" | "corporate";

const TABS = [
  { id: "individual", label: "Individual", icon: UserIcon },
  { id: "corporate", label: "Corporate", icon: Building2 },
];

export default function ClientsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ClientSegment>("individual");
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const {
    loading,
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
    openDropdownId,
    setOpenDropdownId,
    handleVerify,
    handleSuspend,
    handleReactivate,
    handleArchive,
  } = useClientsList();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdownId !== null && !target.closest(`[data-dropdown-id="${openDropdownId}"]`)) {
        setOpenDropdownId(null);
        setDropdownPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId, setOpenDropdownId]);

  const handleToggleDropdown = (e: React.MouseEvent, clientId: number) => {
    e.stopPropagation();
    if (openDropdownId === clientId) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    } else {
      setOpenDropdownId(clientId);
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const clientMetrics = useMemo(() => {
    const total = filteredClients.length;
    const active = filteredClients.filter((client) => 
      client.status !== 'suspended' && (client as any).bookingsCount > 0
    ).length;
    const inactive = filteredClients.filter((client) => 
      client.status === 'suspended' || (client as any).bookingsCount === 0
    ).length;
    return { total, active, inactive };
  }, [filteredClients]);

  const currentTabInfo = useMemo(() => {
    if (activeTab === "individual") {
      return {
        title: "Individual Clients",
        description: "Manage individual customer accounts, personal verification steps, and driver records.",
        icon: <UserIcon size={20} />,
      };
    }
    return {
      title: "Corporate Clients",
      description: "Oversee commercial agency relationships, corporate profiles, and company contracts.",
      icon: <Building2 size={20} />,
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
              {currentTabInfo.icon}
            </div>
            <span>{currentTabInfo.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm self-start sm:self-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ClientSegment)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "individual" ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Clients</span>
                <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{clientMetrics.total}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
                <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{clientMetrics.active}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Inactive</span>
                <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{clientMetrics.inactive}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1 sm:w-80">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                  />
                </div>
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                      statusFilter 
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" 
                        : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                    }`}
                    title="Filter by status"
                  >
                    <Filter size={15} />
                  </button>
                  {showFilterDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)} />
                      <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="py-1">
                          <button onClick={() => { setStatusFilter(null); setShowFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${statusFilter === null ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>All Statuses</button>
                          <div className="h-px bg-[var(--color-surface-border)]" />
                          <button onClick={() => { setStatusFilter("active"); setShowFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${statusFilter === "active" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>Active</button>
                          <button onClick={() => { setStatusFilter("pending"); setShowFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${statusFilter === "pending" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>Pending</button>
                          <button onClick={() => { setStatusFilter("suspended"); setShowFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${statusFilter === "suspended" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>Suspended</button>
                          <button onClick={() => { setStatusFilter("inactive"); setShowFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${statusFilter === "inactive" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>Inactive</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button onClick={() => router.push("/dashboard/clients/new")} className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0">
                <Plus size={14} strokeWidth={2.5} />
                New Client
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading clients...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-[var(--color-ink-subtle)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No clients found</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <>
              <div className="block md:hidden p-4 space-y-3">
                {filteredClients.map((client) => {
                  const statusLabel = client.status === "pending" ? "Pending" : client.status;
                  const statusColors: Record<string, string> = {
                    active: "bg-[var(--color-success-bg)]",
                    pending: "bg-amber-500",
                    suspended: "bg-[var(--color-danger)]",
                    inactive: "bg-gray-400 dark:bg-gray-600",
                  };
                  return (
                    <div key={client.id} onClick={() => router.push(`/dashboard/clients/${client.id}`)} className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                            <UserIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[var(--color-ink)] truncate">{client.full_name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Phone size={11} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                              <span className="text-xs font-medium text-[var(--color-ink)] truncate">{client.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* ✅ FIXED: Wrapped BadgeCheck in span to support title prop */}
                          {client.status === "active" ? (
                            <span title="Verified" className="inline-flex">
                              <BadgeCheck size={18} className="text-[var(--color-success)]" />
                            </span>
                          ) : (
                            <div className={`w-2.5 h-2.5 rounded-full ${statusColors[client.status] || statusColors.inactive}`} title={statusLabel} />
                          )}
                          <div className="relative" data-dropdown-id={client.id} onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => handleToggleDropdown(e, client.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-all" title="Actions">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-[var(--color-surface-border)]/60 pt-3 mt-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {client.email ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
                              <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                              <span className="text-xs text-[var(--color-ink)] truncate max-w-[180px]">{client.email}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] border-dashed">
                              <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                              <span className="text-xs text-[var(--color-ink-subtle)] italic">No email</span>
                            </div>
                          )}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
                            <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">ID</span>
                            <span className="text-xs font-mono text-[var(--color-ink)]">{client.id_number || "N/A"}</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
                            <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">DL</span>
                            <span className="text-xs font-mono text-[var(--color-ink)]">{client.dl_number ? client.dl_number.replace(/^DL[-\s]?/i, '') : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
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
                      const statusLabel = client.status === "pending" ? "Pending" : client.status;
                      const statusColors: Record<string, string> = {
                        active: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
                        pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        suspended: "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]",
                        inactive: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]",
                      };
                      return (
                        <tr key={client.id} onClick={() => router.push(`/dashboard/clients/${client.id}`)} className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                                <UserIcon size={16} />
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <div className="flex items-center gap-1 min-w-0">
                                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{client.full_name}</p>
                                  {/* ✅ FIXED: Wrapped BadgeCheck in span to support title prop */}
                                  {client.status === "active" && (
                                    <span title="Verified Account" className="inline-flex flex-shrink-0">
                                      <BadgeCheck size={14} className="text-[var(--color-success)]" />
                                    </span>
                                  )}
                                </div>
                                {client.email ? (
                                  <a href={`mailto:${client.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate mt-0.5">
                                    <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                                    <span className="truncate">{client.email}</span>
                                  </a>
                                ) : (
                                  <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">No email</p>
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
                            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                              <div className="relative" data-dropdown-id={client.id}>
                                <button onClick={(e) => handleToggleDropdown(e, client.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all" title="More Actions">
                                  <MoreVertical size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {openDropdownId !== null && dropdownPos && (
                <div data-dropdown-id={openDropdownId} onMouseDown={(e) => e.stopPropagation()} className="fixed z-[100] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in zoom-in-95 duration-100" style={{ top: dropdownPos.top, right: dropdownPos.right }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { router.push(`/dashboard/clients/${openDropdownId}`); setOpenDropdownId(null); setDropdownPos(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors">
                    <UserIcon size={14} /> View Full Profile
                  </button>
                  {filteredClients.find((c) => c.id === openDropdownId)?.status === "pending" && (
                    <button onClick={() => { handleVerify(openDropdownId); setOpenDropdownId(null); setDropdownPos(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                      <Shield size={14} /> Verify Client
                    </button>
                  )}
                  {filteredClients.find((c) => c.id === openDropdownId)?.status === "active" && (
                    <button onClick={() => { handleSuspend(openDropdownId); setOpenDropdownId(null); setDropdownPos(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                      <ShieldAlert size={14} /> Suspend Client
                    </button>
                  )}
                  {filteredClients.find((c) => c.id === openDropdownId)?.status === "suspended" && (
                    <button onClick={() => { handleReactivate(openDropdownId); setOpenDropdownId(null); setDropdownPos(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                      <Shield size={14} /> Reactivate Client
                    </button>
                  )}
                  <button onClick={() => { handleArchive(openDropdownId); setOpenDropdownId(null); setDropdownPos(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                    <Archive size={14} /> Archive Client
                  </button>
                </div>
              )}

              <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredClients.length)} of {filteredClients.length} clients
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95">
                    Previous
                  </button>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] animate-in fade-in duration-300">
          <Building2 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Corporate Client Hub</h3>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
            Commercial profiles, group company multi-driver billing, agency agreements, and decentralized corporate contract tracking systems coming soon.
          </p>
        </div>
      )}
    </div>
  );
}