// src/app/dashboard/clients/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Plus,
  Mail,
  Phone,
  User,
  CreditCard,
  ChevronRight,
  Archive,
} from "lucide-react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/lib/types";

type ViewMode = "active" | "vault";

const CLIENT_FILTER_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = view === "active" ? await clientsApi.list() : await clientsApi.listArchived();
      setClients(data);
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [view]);

  const filteredClients = useMemo(() => {
    let result = clients;
    if (view === "active" && statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.id_number?.toLowerCase().includes(q) ||
          c.dl_number?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [clients, view, statusFilter, search]);

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "full_name",
      header: "Client",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            {c.avatar_image ? (
              <img src={c.avatar_image} alt={c.full_name} className="w-9 h-9 rounded-full object-cover border border-[var(--color-surface-border)] shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)]">
                <User size={16} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{c.full_name}</p>
              {c.email ? (
                <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate">
                  <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className="truncate">{c.email}</span>
                </a>
              ) : (
                <p className="text-xs text-[var(--color-ink-muted)] truncate">No email</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
            <Phone size={12} className="text-[var(--color-ink-subtle)]" />
            <span className="font-medium">{c.phone}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "id_number",
      header: "National ID",
      cell: ({ row }) => {
        const c = row.original;
        if (!c.id_number) return <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] flex-shrink-0">
              <CreditCard size={14} />
            </div>
            <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide">{c.id_number}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "dl_number",
      header: "Driver's License",
      cell: ({ row }) => {
        const c = row.original;
        if (!c.dl_number) return <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>;
        
        let color = "bg-[var(--color-ink-subtle)]";
        let labelBg = "bg-[var(--color-surface-hover)]";
        let labelText = "text-[var(--color-ink-muted)]";
        let healthLabel = "No expiry set";

        if (c.dl_expiry) {
          const expiryDate = new Date(c.dl_expiry);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry < 0) {
            color = "bg-[var(--color-danger)]"; labelBg = "bg-[var(--color-danger-bg)]"; labelText = "text-[var(--color-danger-text)]"; healthLabel = "Expired";
          } else if (daysUntilExpiry < 30) {
            color = "bg-[var(--color-danger)]"; labelBg = "bg-[var(--color-danger-bg)]"; labelText = "text-[var(--color-danger-text)]"; healthLabel = `${daysUntilExpiry}d left`;
          } else if (daysUntilExpiry < 60) {
            color = "bg-[var(--color-warning)]"; labelBg = "bg-[var(--color-warning-bg)]"; labelText = "text-[var(--color-warning-text)]"; healthLabel = `${daysUntilExpiry}d left`;
          } else {
            color = "bg-[var(--color-success)]"; labelBg = "bg-[var(--color-success-bg)]"; labelText = "text-[var(--color-success-text)]"; healthLabel = `${daysUntilExpiry}d left`;
          }
        }

        return (
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{c.dl_number}</p>
              <p className="text-xs text-[var(--color-ink-muted)]">
                {c.dl_expiry ? new Date(c.dl_expiry).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "No expiry"}
              </p>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${labelBg} ${labelText} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
              {healthLabel}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const c = row.original;
        if (c.is_archived) return <span className="text-xs text-[var(--color-ink-subtle)] italic">Archived</span>;
        const statusColors: Record<string, string> = {
          active: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
          pending: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
          suspended: "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]",
          inactive: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[c.status] || statusColors.inactive}`}>
            {c.status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Manage",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/clients/${c.id}`);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
            title="View Client"
          >
            <ChevronRight size={14} />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Users size={20} />
            </div>
            Clients
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {view === "active" ? "Manage your client database and relationships" : "Archived client records"}
          </p>
        </div>
        {view === "active" && (
          <button
            onClick={() => router.push("/dashboard/clients/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
          >
            <Plus size={16} /> New Client
          </button>
        )}
      </div>

      {/* Premium Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)]">
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
              <Archive size={12} /> Vault
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none"
            >
              <option value="">All Statuses</option>
              {CLIENT_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)]">Loading clients...</div>
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
              <button
                onClick={() => router.push("/dashboard/clients/new")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
              >
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
                    {columns.map((col) => (
                      <th key={String(col.accessorKey || col.id)} className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                        {typeof col.header === 'string' ? col.header : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-border)]">
                  {paginatedClients.map((client) => (
                    <tr key={client.id} onClick={() => router.push(`/dashboard/clients/${client.id}`)} className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors">
                      {columns.map((col) => (
                        <td key={String(col.accessorKey || col.id)} className="px-6 py-4">
                          {col.cell && typeof col.cell === 'function' 
                            ? col.cell({ row: { original: client }, getValue: () => null, renderValue: () => null, column: col, table: {} } as any) 
                            : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[var(--color-surface-border)] flex items-center justify-between">
              <p className="text-xs text-[var(--color-ink-muted)]">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredClients.length)} of {filteredClients.length} clients
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all">
                  Previous
                </button>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                  {currentPage} / {totalPages || 1}
                </span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all">
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
