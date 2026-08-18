// src/app/dashboard/clients/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  Users,
  Building2,
  Mail,
  Phone,
  User as UserIcon,
  Archive,
  Filter,
  Shield,
  ShieldAlert,
  Loader2,
  Search,
  ArrowRight,
  Link2, // ✅ NEW: Icon for Invites tab
} from "lucide-react";
import { useClientsList } from "@/hooks/clients/useClientsList";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import AddClientButton from "@/components/client/AddClientButton";
import ClientInvitesPanel from "@/components/client/ClientInvitesPanel"; // ✅ NEW: Invites management panel
import CardGrid from "@/components/ui/CardGrid";
import type { Client } from "@/lib/types";

type ClientSegment = "individual" | "corporate" | "invites"; // ✅ UPDATED: Added "invites"

const TABS = [
  { id: "individual", label: "Individual", icon: UserIcon },
  { id: "corporate", label: "Corporate", icon: Building2 },
  { id: "invites", label: "Invites", icon: Link2 }, // ✅ NEW: Invites tab
];

export default function ClientsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ClientSegment>("individual");

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
    pendingClients,
    handleVerify,
    handleSuspend,
    handleReactivate,
    handleArchive,
  } = useClientsList();

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
    if (activeTab === "corporate") {
      return {
        title: "Corporate Clients",
        description: "Oversee commercial agency relationships, corporate profiles, and company contracts.",
        icon: <Building2 size={20} />,
      };
    }
    // ✅ NEW: Invites tab info
    return {
      title: "Client Invites",
      description: "Generate single-use onboarding links and manage pending invitations.",
      icon: <Link2 size={20} />,
    };
  }, [activeTab]);

  // ✅ Reusable row actions for both table and cards
  const getClientActions = (client: Client): RowAction<Client>[] => [
    {
      label: "View Full Profile",
      icon: UserIcon,
      onClick: () => router.push(`/dashboard/clients/${client.id}`),
    },
    {
      label: client.status === "pending" ? "Verify Client" : "Suspend Client",
      icon: client.status === "pending" ? Shield : ShieldAlert,
      variant: client.status === "pending" ? "primary" : "default",
      onClick: () => client.status === "pending" ? handleVerify(client.id) : handleSuspend(client.id),
      disabled: client.status !== "pending" && client.status !== "active",
    },
    {
      label: client.status === "suspended" ? "Reactivate Client" : undefined,
      icon: Shield,
      variant: "primary",
      onClick: () => handleReactivate(client.id),
      disabled: client.status !== "suspended",
    },
    {
      label: "Archive Client",
      icon: Archive,
      variant: "danger",
      separator: true,
      onClick: () => handleArchive(client.id),
    },
    ].filter((action) => !!action.label) as RowAction<Client>[];

  // ✅ NEW: Invites tab render
  if (activeTab === "invites") {
    return (
      <div className="space-y-6">
        {/* Header & Tabs */}
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

        {/* ✅ Invites Panel */}
        <ClientInvitesPanel />
      </div>
    );
  }

  if (activeTab === "individual") {
    return (
      <div className="space-y-6">
        {/* Header & Tabs */}
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

        {/* Main Card Container */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
          
          {/* Toolbar: Metrics + Search + Filter + CTA */}
          <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
            
            {/* Metrics Counter (matches Clients page pattern) */}
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

            {/* Controls: Search + Filter + CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:w-80">
                {/* Search Input */}
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

                {/* ✅ Reusable FilterDropdown */}
                <FilterDropdown
                  filterId="client-status"
                  label="Status"
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Pending", value: "pending" },
                    { label: "Suspended", value: "suspended" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  icon={Filter}
                />
              </div>

              {/* Add Client Dropdown */}
              <AddClientButton />
            </div>
          </div>

          {/* ✅ PENDING REVIEW BANNERS */}
          {!loading && pendingClients > 0 && statusFilter !== "pending" && (
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 transition-colors text-sm font-semibold"
            >
              <ShieldAlert size={16} />
              {pendingClients} {pendingClients === 1 ? "client" : "clients"} awaiting your review
              <ArrowRight size={14} className="opacity-70" />
            </button>
          )}

          {!loading && statusFilter === "pending" && (
            <div className="w-full flex items-center justify-between px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Filter size={14} />
                Viewing {filteredClients.length} pending {filteredClients.length === 1 ? "client" : "clients"}
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter(null)}
                className="text-xs font-bold px-2 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* ✅ Loading State */}
          {loading ? (
            <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading clients...
            </div>
          ) : filteredClients.length === 0 ? (
            /* ✅ Empty State */
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-[var(--color-ink-subtle)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No clients found</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <>
{/* ✅ MOBILE: Reusable CardGrid (simplified, non-collapsible) */}
<div className="block md:hidden">
  <CardGrid
    data={paginatedClients}
    getCardId={(client) => client.id}
    
// Header: Avatar + Name (ALL CAPS) + Email + Verified Badge/Status Dot
renderCardHeader={({ item }) => {
  const statusStyles: Record<string, { bg: string }> = {
    pending: { bg: "bg-amber-500" },
    suspended: { bg: "bg-red-500" },
    inactive: { bg: "bg-gray-500" },
  };
  const statusStyle = statusStyles[item.status] || { bg: "bg-gray-400" };
  
  return (
    <div className="flex items-center justify-between gap-3 min-w-0 w-full">
      {/* Left: Avatar + Name + Email */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
          <UserIcon size={18} />
        </div>
        
        {/* Name + Email */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/clients/${item.id}`);
              }}
              className="text-sm font-bold text-[var(--color-ink)] truncate cursor-pointer hover:text-[var(--color-primary)] transition-colors uppercase"
            >
              {item.full_name}
            </h4>
            
{/* ✅ Premium Verified Badge (for active clients) */}
{item.status === "active" && (
  <div className="flex-shrink-0" title="Verified Client">
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      {/* Shield shape */}
      <path 
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" 
        fill="currentColor" 
        opacity="0.15"
        className="text-[var(--color-primary)]"
      />
      <path 
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--color-primary)]"
      />
      {/* Checkmark */}
      <path 
        d="M9 12L11 14L15 10" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--color-primary)]"
      />
    </svg>
  </div>
)}
          </div>
          
          {item.email ? (
            <div className="flex items-center gap-1 mt-0.5">
              <Mail size={11} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
              <span className="text-xs text-[var(--color-ink)] truncate">{item.email}</span>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-ink-subtle)] italic mt-0.5">No email</p>
          )}
        </div>
      </div>
      
      {/* Right: Status Dot (for non-active clients) */}
      {item.status !== "active" && (
        <div className="flex-shrink-0 flex items-center gap-2">
          <span 
            className={`w-2.5 h-2.5 rounded-full ${statusStyle.bg} ring-2 ring-[var(--color-surface)]`}
            title={item.status}
          />
        </div>
      )}
    </div>
  );
}}
    
    // Body: Divider + Phone, ID, DL pills
    renderCardBody={({ item }) => {
      // Check DL expiry - adjust this logic based on your actual data structure
      const dlExpiryDate = (item as any).dl_expiry_date;
      const isDLValid = dlExpiryDate ? new Date(dlExpiryDate) > new Date() : false;
      const dlStatusColor = isDLValid ? "text-emerald-500" : "text-rose-500";
      const dlStatusText = dlExpiryDate ? (isDLValid ? "VALID" : "EXPIRED") : "N/A";
      
      return (
        <>
          {/* Divider */}
          <div className="border-t border-[var(--color-surface-border)]/60 pt-3 mt-3" />
          
          {/* Pills Container */}
          <div className="flex flex-wrap gap-2">
            {/* Phone Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
              <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
              <span className="text-xs text-[var(--color-ink)] truncate max-w-[120px]">
                {item.phone || "No phone"}
              </span>
            </div>
            
            {/* ID Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">ID</span>
              <span className="text-xs font-mono text-[var(--color-ink)]">
                {item.id_number || "N/A"}
              </span>
            </div>
            
            {/* DL Pill with Status */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">DL</span>
              <span className="text-xs font-mono text-[var(--color-ink)]">
                {item.dl_number?.replace(/^DL[-\s]?/i, '') || "N/A"}
              </span>
              {dlExpiryDate && (
                <span className={`text-[10px] font-bold ${dlStatusColor}`}>
                  {dlStatusText}
                </span>
              )}
            </div>
          </div>
        </>
      );
    }}
    
    // ✅ Row actions (3-dots menu) - correctly targeted
    rowActions={getClientActions}
    
    // Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    totalItems={filteredClients.length}
    pageSize={3} // Mobile: 2.5-3 cards visible
    onPageChange={setCurrentPage}
  />
</div>

              {/* ✅ DESKTOP: Reusable DataTable */}
              <div className="hidden md:block">
                <DataTable
                  data={paginatedClients}
                  columns={[
                    {
                      header: "Client",
                      accessorKey: "full_name",
                      cell: ({ row }) => {
                        const client = row.original;
                        return (
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                              <UserIcon size={16} />
                            </div>
                            <div className="min-w-0 flex flex-col">
                              <div className="flex items-center gap-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/clients/${client.id}`);
                                  }}
                                  className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                                >
                                  {client.full_name}
                                </button>
                                {client.status === "active" && (
                                  <span title="Verified Account" className="inline-flex flex-shrink-0">
                                    <Shield size={14} className="text-[var(--color-success)]" />
                                  </span>
                                )}
                              </div>
                              {client.email ? (
                                <a
                                  href={`mailto:${client.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate mt-0.5"
                                >
                                  <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                                  <span className="truncate">{client.email}</span>
                                </a>
                              ) : (
                                <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">No email</p>
                              )}
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      header: "Contact",
                      accessorKey: "phone",
                      cell: ({ row }) => (
                        <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                          <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                          <span className="font-medium">{row.original.phone}</span>
                        </div>
                      ),
                    },
                    {
                      header: "National ID",
                      accessorKey: "id_number",
                      cell: ({ row }) =>
                        row.original.id_number ? (
                          <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">
                            {row.original.id_number}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                        ),
                    },
                    {
                      header: "Driver's License",
                      accessorKey: "dl_number",
                      cell: ({ row }) =>
                        row.original.dl_number ? (
                          <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">
                            {row.original.dl_number}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                        ),
                    },
                    {
                      header: "Status",
                      accessorKey: "status",
                      cell: ({ row }) => {
                        const client = row.original;
                        const statusLabel = client.status === "pending" ? "Pending" : client.status;
                        const statusStyles: Record<string, { bg: string; text: string }> = {
                          active: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
                          pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
                          suspended: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
                          inactive: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
                        };
                        const style = statusStyles[client.status] || statusStyles.inactive;
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                            {statusLabel}
                          </span>
                        );
                      },
                    },
                  ]}
                  rowActions={getClientActions}
                  getRowId={(client) => client.id}
                  onRowClick={(client) => router.push(`/dashboard/clients/${client.id}`)}
                  loading={loading}
                  emptyMessage="No clients found"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredClients.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  viewMode="desktop"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Corporate tab placeholder
  return (
    <div className="space-y-6">
      {/* Header & Tabs (same as above) */}
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

      <div className="p-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] animate-in fade-in duration-300">
        <Building2 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Corporate Client Hub</h3>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
          Commercial profiles, group company multi-driver billing, agency agreements, and decentralized corporate contract tracking systems coming soon.
        </p>
      </div>
    </div>
  );
}
