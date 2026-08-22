// src/app/dashboard/drivers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Phone,
  Pencil,
  Archive,
  RotateCcw,
  UserCircle,
  Filter,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import { useDrivers } from "@/hooks/drivers/useDrivers";
import type { DriverListItem, DriverStatus, DriverPayMode } from "@/lib/types";

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";

const STATUS_STYLES: Record<DriverStatus, { bg: string; text: string }> = {
  available: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  on_trip: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  on_leave: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  suspended: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

const STATUS_LABELS: Record<DriverStatus, string> = {
  available: "Available",
  on_trip: "On Trip",
  on_leave: "On Leave",
  suspended: "Suspended",
};

const PAY_LABELS: Record<DriverPayMode, string> = {
  commission: "Commission",
  fixed_per_job: "Fixed / Job",
  payroll: "Payroll",
};

// ✅ Licence health: expired (red) / expiring ≤30d (amber) / valid (muted)
const dlState = (expiry?: string | null) => {
  if (!expiry) return { label: "N/A", cls: "text-[var(--color-ink-muted)]" };
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "EXPIRED", cls: "text-[var(--color-danger)] font-bold" };
  if (days <= 30) return { label: `${days}d LEFT`, cls: "text-[var(--color-warning-text)] font-bold" };
  return { label: "VALID", cls: "text-[var(--color-success-text)] font-bold" };
};

const emptyForm = {
  full_name: "", phone: "", email: "", id_number: "", dl_number: "", dl_expiry: "",
  status: "available" as DriverStatus,
  pay_mode: "commission" as DriverPayMode,
  daily_fee: "", overtime_hourly_fee: "", night_accommodation_fee: "", delivery_commission: "",
};

export default function DriversPage() {
  const {
    loading,
    drivers,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    includeArchived,
    setIncludeArchived,
    selectedDriver,
    detailLoading,
    loadDriverDetail,
    clearSelection,
    createDriver,
    updateDriver,
    archiveDriver,
    restoreDriver,
  } = useDrivers();

  // ✅ Local pagination (matches useClientsList contract)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(drivers.length / pageSize));
  const paginatedDrivers = useMemo(
    () => drivers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [drivers, currentPage],
  );

  useEffect(() => setCurrentPage(1), [search, statusFilter, includeArchived]);

  const driverMetrics = useMemo(() => {
    const total = drivers.length;
    const available = drivers.filter((d) => d.status === "available").length;
    const onTrip = drivers.filter((d) => d.status === "on_trip").length;
    return { total, available, onTrip };
  }, [drivers]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Pre-fill when editing (after detail loads)
  useEffect(() => {
    if (editingId && selectedDriver) {
      setForm({
        full_name: selectedDriver.full_name,
        phone: selectedDriver.phone,
        email: selectedDriver.email || "",
        id_number: selectedDriver.id_number,
        dl_number: selectedDriver.dl_number,
        dl_expiry: selectedDriver.dl_expiry ? selectedDriver.dl_expiry.split("T")[0] : "",
        status: selectedDriver.status,
        pay_mode: selectedDriver.pay_mode,
        daily_fee: selectedDriver.daily_fee != null ? String(selectedDriver.daily_fee) : "",
        overtime_hourly_fee: selectedDriver.overtime_hourly_fee != null ? String(selectedDriver.overtime_hourly_fee) : "",
        night_accommodation_fee: selectedDriver.night_accommodation_fee != null ? String(selectedDriver.night_accommodation_fee) : "",
        delivery_commission: selectedDriver.delivery_commission != null ? String(selectedDriver.delivery_commission) : "",
      });
    }
  }, [editingId, selectedDriver]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (id: number) => {
    setEditingId(id);
    setForm({ ...emptyForm });
    setModalOpen(true);
    loadDriverDetail(id);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    clearSelection();
  };

  const num = (v: string) => (v.trim() === "" ? undefined : parseFloat(v));

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || undefined,
      id_number: form.id_number,
      dl_number: form.dl_number,
      dl_expiry: form.dl_expiry || undefined,
      status: form.status,
      pay_mode: form.pay_mode,
      daily_fee: num(form.daily_fee),
      overtime_hourly_fee: num(form.overtime_hourly_fee),
      night_accommodation_fee: num(form.night_accommodation_fee),
      delivery_commission: num(form.delivery_commission),
    };
    const ok = editingId ? await updateDriver(editingId, payload) : await createDriver(payload);
    setSaving(false);
    if (ok) closeModal();
  };

  // ✅ Reusable row actions for both table and cards
  const getDriverActions = (driver: DriverListItem): RowAction<DriverListItem>[] => [
    {
      label: "Edit Driver",
      icon: Pencil,
      onClick: () => openEdit(driver.id),
    },
    driver.is_archived
      ? {
          label: "Restore Driver",
          icon: RotateCcw,
          variant: "primary",
          onClick: () => restoreDriver(driver.id),
        }
      : {
          label: "Archive Driver",
          icon: Archive,
          variant: "danger",
          separator: true,
          onClick: () => archiveDriver(driver.id),
        },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
              <Users size={20} />
            </div>
            <span>Drivers</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            In-house driver pool — delivery tasks & chauffeur assignments.
          </p>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
        {/* Toolbar: Metrics + Search + Filter + CTA */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          {/* Metrics Counter */}
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Drivers</span>
              <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{driverMetrics.total}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Available</span>
              <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{driverMetrics.available}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">On Trip</span>
              <span className="text-xs font-bold text-[var(--color-primary-text)] tabular-nums">{driverMetrics.onTrip}</span>
            </div>
          </div>

          {/* Controls: Search + Filter + Archived + CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
            <div className="flex items-center gap-2 flex-1 sm:w-80">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search drivers..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                />
              </div>

              <FilterDropdown
                filterId="driver-status"
                label="Status"
                options={[
                  { label: "Available", value: "available" },
                  { label: "On Trip", value: "on_trip" },
                  { label: "On Leave", value: "on_leave" },
                  { label: "Suspended", value: "suspended" },
                ]}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as DriverStatus | "")}
                icon={Filter}
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-muted)] whitespace-nowrap cursor-pointer px-2">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
                className="accent-[var(--color-primary)]"
              />
              Show archived
            </label>

            <button
              onClick={openCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98]"
            >
              <Plus size={16} /> Add Driver
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading drivers...
          </div>
        ) : drivers.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <UserCircle size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No drivers yet</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              Add your first in-house driver to start assigning deliveries.
            </p>
          </div>
        ) : (
          <>
            {/* ✅ MOBILE: Reusable CardGrid */}
            <div className="block md:hidden">
              <CardGrid
                data={paginatedDrivers}
                getCardId={(d) => d.id}
                renderCardHeader={({ item }) => {
                  const statusDot: Record<DriverStatus, string> = {
                    available: "bg-emerald-500",
                    on_trip: "bg-[var(--color-primary)]",
                    on_leave: "bg-amber-500",
                    suspended: "bg-red-500",
                  };
                  return (
                    <div className="flex items-center justify-between gap-3 min-w-0 w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                          <UserCircle size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[var(--color-ink)] truncate uppercase">
                            {item.full_name}
                          </h4>
                          <p className="text-xs text-[var(--color-ink-subtle)] mt-0.5">
                            {PAY_LABELS[item.pay_mode]}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${statusDot[item.status]} ring-2 ring-[var(--color-surface)] flex-shrink-0`}
                        title={STATUS_LABELS[item.status]}
                      />
                    </div>
                  );
                }}
                renderCardBody={({ item }) => {
                  const dl = dlState(item.dl_expiry);
                  return (
                    <>
                      <div className="border-t border-[var(--color-surface-border)]/60 pt-3 mt-3" />
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
                          <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                          <span className="text-xs text-[var(--color-ink)] truncate max-w-[120px]">{item.phone}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
                          <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">ID</span>
                          <span className="text-xs font-mono text-[var(--color-ink)]">{item.id_number_masked || "N/A"}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
                          <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">DL</span>
                          <span className="text-xs font-mono text-[var(--color-ink)]">{item.dl_number_masked || "N/A"}</span>
                          <span className={`text-[10px] ${dl.cls}`}>{dl.label}</span>
                        </div>
                      </div>
                    </>
                  );
                }}
                rowActions={getDriverActions}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={drivers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* ✅ DESKTOP: Reusable DataTable */}
            <div className="hidden md:block">
              <DataTable
                data={paginatedDrivers}
                columns={[
                  {
                    header: "Driver",
                    accessorKey: "full_name",
                    cell: ({ row }) => (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                          <UserCircle size={16} />
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <span className="text-sm font-semibold text-[var(--color-ink)] truncate">
                            {row.original.full_name}
                          </span>
                          <span className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">
                            {PAY_LABELS[row.original.pay_mode]}
                          </span>
                        </div>
                      </div>
                    ),
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
                    accessorKey: "id_number_masked",
                    cell: ({ row }) => (
                      <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">
                        {row.original.id_number_masked || "N/A"}
                      </span>
                    ),
                  },
                  {
                    header: "Driver's License",
                    accessorKey: "dl_number_masked",
                    cell: ({ row }) => {
                      const dl = dlState(row.original.dl_expiry);
                      return (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">
                            {row.original.dl_number_masked || "N/A"}
                          </span>
                          <span className={`text-[10px] ${dl.cls}`}>{dl.label}</span>
                        </div>
                      );
                    },
                  },
                  {
                    header: "Status",
                    accessorKey: "status",
                    cell: ({ row }) => {
                      const style = STATUS_STYLES[row.original.status];
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                          {STATUS_LABELS[row.original.status]}
                        </span>
                      );
                    },
                  },
                ]}
                rowActions={getDriverActions}
                getRowId={(d) => d.id}
                onRowClick={(d) => openEdit(d.id)}
                loading={loading}
                emptyMessage="No drivers found"
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={drivers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                viewMode="desktop"
              />
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Driver" : "Add Driver"}
        subtitle="In-house staff driver — compliance & pay configuration"
        size="md"
      >
        {editingId && detailLoading ? (
          <div className="flex items-center justify-center py-12 text-[var(--color-ink-muted)]">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading driver...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Full Name <span className="text-[var(--color-danger)]">*</span></label>
                <input className={inputClass} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="e.g. James Mwangi" />
              </div>
              <div>
                <label className={labelClass}>Phone <span className="text-[var(--color-danger)]">*</span></label>
                <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+2547..." />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email (optional)</label>
              <input className={inputClass} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="driver@company.com" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>ID Number <span className="text-[var(--color-danger)]">*</span></label>
                <input className={inputClass} value={form.id_number} onChange={(e) => set("id_number", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>DL Number <span className="text-[var(--color-danger)]">*</span></label>
                <input className={inputClass} value={form.dl_number} onChange={(e) => set("dl_number", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>DL Expiry</label>
                <input className={inputClass} type="date" value={form.dl_expiry} onChange={(e) => set("dl_expiry", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Pay Mode</label>
                <select className={inputClass} value={form.pay_mode} onChange={(e) => set("pay_mode", e.target.value)}>
                  <option value="commission">Commission</option>
                  <option value="fixed_per_job">Fixed / Job</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Daily Fee</label>
                <input className={inputClass} type="number" step="0.01" value={form.daily_fee} onChange={(e) => set("daily_fee", e.target.value)} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>OT Hr Fee</label>
                <input className={inputClass} type="number" step="0.01" value={form.overtime_hourly_fee} onChange={(e) => set("overtime_hourly_fee", e.target.value)} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>Night Fee</label>
                <input className={inputClass} type="number" step="0.01" value={form.night_accommodation_fee} onChange={(e) => set("night_accommodation_fee", e.target.value)} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>Delivery Comm.</label>
                <input className={inputClass} type="number" step="0.01" value={form.delivery_commission} onChange={(e) => set("delivery_commission", e.target.value)} placeholder="—" />
              </div>
            </div>

            <p className="text-[10px] text-[var(--color-ink-muted)]">
              Blank fee fields fall back to your tenant service pricing config. ID/DL numbers are masked in list views.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-surface-border)]">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.full_name || !form.phone || !form.id_number || !form.dl_number}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Driver"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
