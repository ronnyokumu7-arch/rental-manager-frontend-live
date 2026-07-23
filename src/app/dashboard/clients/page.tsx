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
  ChevronDown,
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
  
  // ✅ State to hold the fixed position of the active dropdown
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

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
    totalClients,
    activeClients,
    suspendedClients,
    openDropdownId,
    setOpenDropdownId,
    handleVerify,
    handleSuspend,
    handleReactivate,
    handleArchive,
  } = useClientsList();

  // ✅ Click outside to close dropdown (uses data attribute for robust targeting)
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
      // Calculate position relative to viewport to break free from overflow-hidden parents
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8, // 8px gap below the button
        right: window.innerWidth - rect.right, // Align right edge with button's right edge
      });
    }
  };

  // Dynamic header info matching the fleet page layout paradigm
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
      {/* Premium Header with Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              {currentTabInfo.icon}
            </div>
            {currentTabInfo.title}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* Corrected Tab Switcher Location */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ClientSegment)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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

      {/* Conditional Segment View Engine */}
      {activeTab === "individual" ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
          {/* Toolbar */}
          <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              {/* Metrics Breakdown Panels */}
              <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm backdrop-blur-sm w-full lg:w-auto overflow-x-auto">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">Registered</span>
                  <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalClients}</span>
                </div>
                <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active Now</span>
                  <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeClients}</span>
                </div>
                <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">Suspended</span>
                  <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{suspendedClients}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto ml-auto lg:ml-0">
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

              {/* ✅ UPGRADED: Premium Primary Button */}
              <button
                onClick={() => router.push("/dashboard/clients/new")}
                className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
              >
                <Plus size={14} strokeWidth={2.5} />
                New Client
              </button>
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
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No clients found</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                Try adjusting your search query or filters.
              </p>
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
                      const statusLabel = client.status === 'pending' ? 'Pending' : client.status;
                      const statusColors: Record<string, string> = {
                        active: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
                        pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        suspended: "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]",
                        inactive: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]",
                      };

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
                          
                          {/* ✅ CLEANED UP: Manage Column with Bulletproof Dropdown */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                              {/* ✅ Wrapper with data attribute for click-outside detection */}
                              <div className="relative" data-dropdown-id={client.id}>
                                <button
                                  onClick={(e) => handleToggleDropdown(e, client.id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                                  title="More Actions"
                                >
                                  <MoreVertical size={14} />
                                </button>

                                {/* ✅ Fixed positioning breaks free from overflow-hidden table containers */}
                                {openDropdownId === client.id && dropdownPos && (
                                  <div 
                                    className="fixed z-[100] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                                    style={{ top: dropdownPos.top, right: dropdownPos.right }}
                                  >
                                    <button
                                      onClick={() => { router.push(`/dashboard/clients/${client.id}`); setOpenDropdownId(null); setDropdownPos(null); }}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                                    >
                                      <UserIcon size={14} /> View Full Profile
                                    </button>
                                    
                                    {/* Dynamic Status Actions */}
                                    {client.status === 'pending' && (
                                      <button
                                        onClick={() => { handleVerify(client.id); setOpenDropdownId(null); setDropdownPos(null); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                      >
                                        <Shield size={14} /> Verify Client
                                      </button>
                                    )}
                                    
                                    {client.status === 'active' && (
                                      <button
                                        onClick={() => { handleSuspend(client.id); setOpenDropdownId(null); setDropdownPos(null); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                      >
                                        <ShieldAlert size={14} /> Suspend Client
                                      </button>
                                    )}
                                    
                                    {client.status === 'suspended' && (
                                      <button
                                        onClick={() => { handleReactivate(client.id); setOpenDropdownId(null); setDropdownPos(null); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                      >
                                        <Shield size={14} /> Reactivate Client
                                      </button>
                                    )}

                                    <button
                                      onClick={() => { handleArchive(client.id); setOpenDropdownId(null); setDropdownPos(null); }}
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

              {/* Pagination Controls */}
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
      ) : (
        /* ✅ Premium Corporate Segment Coming Soon View */
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
