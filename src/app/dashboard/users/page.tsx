"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Plus,
  Mail,
  Phone,
  User as UserIcon,
  ChevronRight,
  Shield,
  Briefcase,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

// API & Types
import { usersApi } from "@/lib/api/users";
import type { User as UserType } from "@/lib/types";

// UI Components
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import TableToolbar from "@/components/ui/TableToolbar";

// ── Helpers ──────────────────────────────────────────────────────────────
// ✅ STRICT TITLE ENFORCEMENT: Never shows "Admin" or "Staff"
const getRoleDisplay = (role: string, department?: string | null, jobTitle?: string | null) => {
  if (role === "super_admin") return "System Admin";
  // 1. Always prioritize the explicitly assigned job title (e.g., HR, Driver, CEO)
  if (jobTitle) return jobTitle;
  // 2. Fallback to department name if no specific title was set
  if (department) return department;
  // 3. Ultimate fallback (Hides the backend tenant_admin/tenant_staff enums)
  return "Unassigned";
};

const getSortPriority = (role: string, jobTitle?: string | null) => {
  if (role === "tenant_admin" || role === "super_admin") return 1;
  if (["CEO", "Director", "General Manager", "Founder", "Founder & CEO"].includes(jobTitle || "")) return 1; // Top leadership
  if (jobTitle === "Manager") return 2;
  if (["Accountant", "Cashier", "Credit Control"].includes(jobTitle || "")) return 3;
  if (jobTitle === "HR") return 4;
  if (jobTitle === "Dispatcher", "Head of Operations", "Operations Manager") return 5;
  return 6;
};

// ✅ SMART STYLING: Recognizes CEO/Director as top-tier leadership
const getRoleStyle = (role: string, jobTitle?: string | null) => {
  // Top leadership (Super Admin, CEO, Director) gets the Shield & Indigo
  if (role === "super_admin" || ["CEO", "Director", "General Manager"].includes(jobTitle || "")) {
    return { color: "text-indigo-600 dark:text-indigo-400", Icon: Shield };
  }
  // Admins, HR, and Managers get the Briefcase & Blue
  if (role === "tenant_admin" || ["Manager", "HR", "HR/Manager"].includes(jobTitle || "")) {
    return { color: "text-blue-600 dark:text-blue-400", Icon: Briefcase };
  }
  // Everyone else gets the User icon & Slate
  return { color: "text-slate-500 dark:text-slate-400", Icon: UserIcon };
};

type ViewMode = "active" | "inactive";

export default function UsersPage() {
  const router = useRouter();
  
  // ── State ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ── Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await usersApi.list();
        setUsers(data);
      } catch (error) {
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ── Dynamic Filter Options (Extracts unique Departments) ───────────────
  const departmentFilterOptions = useMemo(() => {
    const depts = new Set<string>();
    users.forEach((u) => {
      if (u.department) depts.add(u.department);
    });
    return Array.from(depts).sort().map((d) => ({ value: d, label: d }));
  }, [users]);

  // ── Client-side Filtering, Sorting & Pagination ────────────────────────
  const processedUsers = useMemo(() => {
    let result = users;

    // 1. View Filter (Active vs Inactive/Suspended)
    if (view === "active") {
      result = result.filter((u) => u.is_active && !u.is_suspended);
    } else {
      result = result.filter((u) => !u.is_active || u.is_suspended);
    }

    // 2. Department Filter
    if (departmentFilter) {
      result = result.filter((u) => u.department === departmentFilter);
    }

    // 3. Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone_number?.toLowerCase().includes(q) ||
        u.job_title?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q)
      );
    }

    // 4. Custom Sort Priority
    return [...result].sort((a, b) => {
      const priorityA = getSortPriority(a.role, a.job_title);
      const priorityB = getSortPriority(b.role, b.job_title);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.full_name.localeCompare(b.full_name);
    });
  }, [users, view, departmentFilter, search]);

  const totalPages = Math.ceil(processedUsers.length / pageSize);
  const paginatedUsers = processedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, departmentFilter, view]);

  // ── Table Columns ──────────────────────────────────────────────────────
  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "full_name",
      header: "Team Member",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center text-ink-subtle flex-shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{u.full_name}</p>
              <a href={`mailto:${u.email}`} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-dark transition-colors truncate">
                <Mail size={12} className="text-ink-subtle flex-shrink-0" />
                <span className="truncate">{u.email}</span>
              </a>
            </div>
          </div>
        );
      },
    },
    {
      // ✅ SWAPPED: Role / Position is now 2nd
      accessorKey: "role",
      header: "Role / Position",
      cell: ({ row }) => {
        const u = row.original;
        const displayRole = getRoleDisplay(u.role, u.department, u.job_title);
        const { color, Icon } = getRoleStyle(u.role, u.job_title);
        return (
          <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
            <Icon size={16} strokeWidth={2} />
            <span>{displayRole}</span>
          </div>
        );
      },
    },
    {
      // ✅ SWAPPED: Department is now 3rd
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const u = row.original;
        if (!u.department) {
          return <span className="text-sm text-ink-subtle italic">Unassigned</span>;
        }
        return (
          <div className="flex items-center gap-2 text-sm text-ink">
            <Building2 size={14} className="text-ink-subtle flex-shrink-0" />
            <span className="font-medium truncate">{u.department}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }) => {
        const u = row.original;
        if (!u.phone_number) return <span className="text-sm text-ink-subtle italic">Not provided</span>;
        return (
          <div className="flex items-center gap-2 text-sm text-ink">
            <Phone size={12} className="text-ink-subtle" />
            <span className="font-medium">{u.phone_number}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "is_suspended",
      header: "Status",
      cell: ({ row }) => {
        const u = row.original;
        if (u.is_suspended) return <Badge variant="danger" dot>Suspended</Badge>;
        if (!u.is_active) return <Badge variant="neutral" dot>Inactive</Badge>;
        return <Badge variant="success" dot>Active</Badge>;
      },
    },
    {
      id: "actions",
      header: "Manage",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/users/${u.id}`); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="View Profile"
          >
            <ChevronRight size={14} />
          </button>
        );
      },
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Team Members"
        subtitle="Manage your staff, admins, and their access levels."
        icon={Users}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Team" }]}
        actions={[{ label: "Add Member", icon: Plus, variant: "primary", onClick: () => router.push("/dashboard/users/new") }]}
      />

      <SectionCard padding={false}>
        <TableToolbar
          viewMode={view}
          onViewModeChange={setView}
          activeCount={users.filter((u) => u.is_active && !u.is_suspended).length}
          vaultCount={users.filter((u) => !u.is_active || u.is_suspended).length}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, email, phone, role..."
          filterValue={departmentFilter}
          onFilterChange={setDepartmentFilter}
          filterOptions={departmentFilterOptions}
          filterPlaceholder="All Departments"
        />

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading team...</div>
        ) : processedUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={view === "active" ? "No active team members" : "No inactive team members"}
            description={search || departmentFilter ? "Try adjusting your search or filters." : view === "active" ? "Add your first team member to get started." : "Deactivated or suspended members will appear here."}
            action={view === "active" && !search && !departmentFilter ? (
              <button className="btn btn-primary" onClick={() => router.push("/dashboard/users/new")}><Plus size={16} /> Add Member</button>
            ) : null}
          />
        ) : (
          <>
            <DataTable data={paginatedUsers} columns={columns} onRowClick={(user) => router.push(`/dashboard/users/${user.id}`)} />
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={processedUsers.length} pageSize={pageSize} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </div>
  );
}
