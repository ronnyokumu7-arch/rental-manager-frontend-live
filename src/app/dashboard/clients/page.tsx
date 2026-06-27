"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Users, Plus, Mail, Phone, User, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import TableToolbar from "@/components/ui/TableToolbar";
import ActionButtons from "@/components/ui/ActionButtons";

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
      const data = view === "active" 
        ? await clientsApi.list() 
        : await clientsApi.listArchived();
      setClients(data);
    } catch {
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

  // ✅ UPDATED COLUMNS EXACTLY AS REQUESTED
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            {c.avatar_image ? (
              <img src={c.avatar_image} alt={c.full_name} className="w-9 h-9 rounded-full object-cover border border-surface-border shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center text-ink-subtle">
                <User size={16} />
              </div>
            )}
            <p className="text-sm font-semibold text-ink truncate">{c.full_name}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.email;
        return email ? (
          <a href={`mailto:${email}`} className="text-sm text-ink-muted hover:text-accent-dark transition-colors truncate block">
            {email}
          </a>
        ) : (
          <span className="text-sm text-ink-subtle italic">—</span>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-ink">
          <Phone size={12} className="text-ink-subtle" />
          <span className="font-medium">{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "id_number",
      header: "ID Number",
      cell: ({ row }) => {
        const id = row.original.id_number;
        return id ? (
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-ink-subtle" />
            <span className="text-sm font-semibold text-ink tracking-wide">{id}</span>
          </div>
        ) : (
          <span className="text-sm text-ink-subtle italic">—</span>
        );
      },
    },
    {
      accessorKey: "dl_number",
      header: "DL Number",
      cell: ({ row }) => {
        const dl = row.original.dl_number;
        return dl ? (
          <span className="text-sm font-semibold text-ink tracking-wide">{dl}</span>
        ) : (
          <span className="text-sm text-ink-subtle italic">—</span>
        );
      },
    },
    {
      id: "dl_status",
      header: "DL Status",
      cell: ({ row }) => {
        const expiry = row.original.dl_expiry;
        if (!expiry) return <span className="text-sm text-ink-subtle italic">Not set</span>;

        const expiryDate = new Date(expiry);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-danger-bg text-danger-text">
              <span className="w-1.5 h-1.5 rounded-full bg-danger" /> Expired
            </span>
          );
        } else if (daysUntilExpiry < 30) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-warning-bg text-warning-text">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" /> {daysUntilExpiry}d left
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-success-bg text-success-text">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Active
            </span>
          );
        }
      },
    },
    {
      accessorKey: "actions",
      header: "", // ✅ No heading for actions
      cell: ({ row }) => (
        <ActionButtons viewUrl={`/dashboard/clients/${row.original.id}`} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Manage your client database and relationships"
        icon={Users}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clients" }]}
        actions={
          view === "active"
            ? [{ label: "New Client", icon: Plus, variant: "primary", onClick: () => router.push("/dashboard/clients/new") }]
            : []
        }
      />

      <SectionCard padding={false}>
        <TableToolbar
          viewMode={view}
          onViewModeChange={setView}
          activeCount={clients.filter((c) => !c.is_archived).length}
          vaultCount={clients.filter((c) => c.is_archived).length}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, email, phone, ID..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={CLIENT_FILTER_OPTIONS}
          filterPlaceholder="All Statuses"
        />

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={view === "active" ? "No clients found" : "No archived clients"}
            description={
              search || statusFilter
                ? "Try adjusting your search or filters."
                : view === "active"
                ? "Get started by adding your first client."
                : "Archived clients will appear here."
            }
            action={
              view === "active" && !search && !statusFilter ? (
                <button className="btn btn-primary" onClick={() => router.push("/dashboard/clients/new")}>
                  <Plus size={16} /> Add Client
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <DataTable
              data={paginatedClients}
              columns={columns}
              onRowClick={(client) => router.push(`/dashboard/clients/${client.id}`)}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </SectionCard>
    </div>
  );
}
