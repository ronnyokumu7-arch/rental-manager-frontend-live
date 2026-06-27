"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, BookingStatus, Client, Vehicle } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import TableToolbar from "@/components/ui/TableToolbar";
import ActionButtons from "@/components/ui/ActionButtons";

type ViewMode = "active" | "vault";

const BOOKING_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [bookingsData, clientsData, vehiclesData] = await Promise.all([
        bookingsApi.list(),
        clientsApi.list(),
        vehiclesApi.list(),
      ]);
      
      setBookings(bookingsData);
      setClients(clientsData);
      setVehicles(vehiclesData);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  // ✅ Create lookup maps to resolve IDs to Names/Plates
  const clientMap = useMemo(() => {
    const map = new Map<number, string>();
    clients.forEach((c) => map.set(c.id, c.full_name));
    return map;
  }, [clients]);

  const vehicleMap = useMemo(() => {
    const map = new Map<number, string>();
    vehicles.forEach((v) => map.set(v.id, v.plate_number));
    return map;
  }, [vehicles]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    
    if (view === "vault") {
      result = result.filter((b) => b.is_archived === true);
    } else {
      result = result.filter((b) => b.is_archived !== true);
    }

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => {
        const clientName = clientMap.get(b.client_id)?.toLowerCase() || "";
        const vehiclePlate = vehicleMap.get(b.vehicle_id)?.toLowerCase() || "";
        return (
          b.id.toString().includes(q) ||
          clientName.includes(q) ||
          vehiclePlate.includes(q) ||
          b.destination?.toLowerCase().includes(q) ||
          b.pickup_location?.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [bookings, view, statusFilter, search, clientMap, vehicleMap]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: "Booking",
      cell: ({ row }) => {
        const b = row.original;
        let dotColor = "bg-ink-subtle";
        if (b.status === "active") dotColor = "bg-success";
        else if (b.status === "pending" || b.status === "confirmed") dotColor = "bg-warning";
        else if (b.status === "cancelled" || b.status === "no_show") dotColor = "bg-danger";

        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-surface-hover border border-surface-border flex-shrink-0">
              <Calendar size={16} className="text-ink-muted" />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-card ${dotColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">#{b.id}</p>
              <p className="text-xs text-ink-muted capitalize">{b.status}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-ink-muted">
          {new Date(row.original.created_at).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
          })}
        </span>
      ),
    },
    {
      accessorKey: "client_id",
      header: "Client",
      cell: ({ row }) => (
        // ✅ Resolves ID to actual Name
        <span className="text-sm font-medium text-ink truncate block">
          {clientMap.get(row.original.client_id) || `Client #${row.original.client_id}`}
        </span>
      ),
    },
    {
      accessorKey: "vehicle_id",
      header: "Vehicle",
      cell: ({ row }) => (
        // ✅ Resolves ID to actual Plate Number
        <span className="text-sm font-semibold text-ink tracking-wide truncate block">
          {vehicleMap.get(row.original.vehicle_id) || `#${row.original.vehicle_id}`}
        </span>
      ),
    },
    {
      accessorKey: "start_date",
      header: "Start",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-ink">
            {new Date(row.original.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="text-xs text-ink-muted">
            {new Date(row.original.start_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "end_date",
      header: "End",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-ink">
            {new Date(row.original.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="text-xs text-ink-muted">
            {new Date(row.original.end_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-ink">
          {new Intl.NumberFormat("en-US", { 
            style: "currency", 
            currency: row.original.currency_code || "KES", 
            maximumFractionDigits: 0 
          }).format(row.original.total_amount)}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => (
        <ActionButtons viewUrl={`/dashboard/bookings/${row.original.id}`} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Manage your rental bookings and trips"
        icon={Calendar}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bookings" }]}
        actions={
          view === "active"
            ? [{ label: "New Booking", icon: Plus, variant: "primary", onClick: () => router.push("/dashboard/bookings/new") }]
            : []
        }
      />

      <SectionCard padding={false}>
        <TableToolbar
          viewMode={view}
          onViewModeChange={setView}
          activeCount={bookings.filter((b) => b.is_archived !== true).length}
          vaultCount={bookings.filter((b) => b.is_archived === true).length}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search booking ID, client, plate..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={BOOKING_FILTER_OPTIONS}
          filterPlaceholder="All Statuses"
        />

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={view === "active" ? "No bookings found" : "No archived bookings"}
            description={
              search || statusFilter
                ? "Try adjusting your search or filters."
                : view === "active"
                ? "Get started by creating your first booking."
                : "Archived bookings will appear here."
            }
            action={
              view === "active" && !search && !statusFilter ? (
                <button className="btn btn-primary" onClick={() => router.push("/dashboard/bookings/new")}>
                  <Plus size={16} /> New Booking
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <DataTable
              data={paginatedBookings}
              columns={columns}
              onRowClick={(booking) => router.push(`/dashboard/bookings/${booking.id}`)}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBookings.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </SectionCard>
    </div>
  );
}
