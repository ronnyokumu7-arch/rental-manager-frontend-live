// src/app/dashboard/users/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Archive,
} from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import type { User as UserType } from "@/lib/types";

// ── Helpers ──────────────────────────────────────────────────────────────
const getRoleDisplay = (role: string, department?: string | null, jobTitle?: string | null) => {
  if (role === "super_admin") return "System Admin";
  if (jobTitle) return jobTitle;
  if (department) return department;
  return "Unassigned";
};

const getSortPriority = (role: string, jobTitle?: string | null) => {
  if (role === "tenant_admin" || role === "super_admin") return 1;
  if (["CEO", "Director", "General Manager", "Founder", "Founder & CEO"].includes(jobTitle || "")) return 1;
  if (jobTitle === "Manager") return 2;
  if (["Accountant", "Cashier", "Credit Control"].includes(jobTitle || "")) return 3;
  if (jobTitle === "HR") return 4;
  if (["Dispatcher", "Head of Operations", "Operations Manager"].includes(jobTitle || "")) return 5;
  return 6;
};

const getRoleStyle = (role: string, jobTitle?: string | null) => {
  if (role === "super_admin" || ["CEO", "Director", "General Manager"].includes(jobTitle || "")) {
    return { color: "text-indigo-600 dark:text-indigo-400", Icon: Shield };
  }
  if (role === "tenant_admin" || ["Manager", "HR", "HR/Manager"].includes(jobTitle || "")) {
    return { color: "text-blue-600 dark:text-blue-400", Icon: Briefcase };
  }
  return { color: "text-[var(--color-ink-muted)]", Icon: UserIcon };
};

type ViewMode = "active" | "inactive";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  const departmentFilterOptions = useMemo(() => {
    const depts = new Set<string>();
    users.forEach((u) => {
      if (u.department) depts.add(u.department);
    });
    return Array.from(depts).sort().map((d) => ({ value: d, label: d }));
  }, [users]);

  const processedUsers = useMemo(() => {
    let result = users;
    if (view === "active") {
      result = result.filter((u) => u.is_active && !u.is_suspended);
    } else {
      result = result.filter((u) => !u.is_active || u.is_suspended);
    }
    if (departmentFilter) {
      result = result.filter((u) => u.department === departmentFilter);
    }
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

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Users size={20} />
            </div>
            Team Members
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {view === "active" ? "Manage your staff, admins, and their access levels." : "Deactivated or suspended team members"}
          </p>
        </div>
        {view === "active" && (
          <button
            onClick={() => router.push("/dashboard/users/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
          >
            <Plus size={16} /> Add Member
          </button>
        )}
      </div>

      {/* Premium Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)]">
            <button
              onClick={() => setView("active")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === "active"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setView("inactive")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                view === "inactive"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Archive size={12} /> Inactive
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, role..."
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
            <select
              value={departmentFilter || ""}
              onChange={(e) => setDepartmentFilter(e.target.value || null)}
              className="px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none"
            >
              <option value="">All Departments</option>
              {departmentFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)]">Loading team...</div>
        ) : processedUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              {view === "active" ? "No active team members" : "No inactive team members"}
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || departmentFilter
                ? "Try adjusting your search or filters."
                : view === "active"
                ? "Add your first team member to get started."
                : "Deactivated or suspended members will appear here."}
            </p>
            {view === "active" && !search && !departmentFilter && (
              <button
                onClick={() => router.push("/dashboard/users/new")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
              >
                <Plus size={16} /> Add Member
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Team Member</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Role / Position</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Department</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Phone</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-border)]">
                  {paginatedUsers.map((u) => {
                    const displayRole = getRoleDisplay(u.role, u.department, u.job_title);
                    const { color, Icon } = getRoleStyle(u.role, u.job_title);
                    
                    let statusBg = "bg-[var(--color-success-bg)]";
                    let statusText = "text-[var(--color-success-text)]";
                    let statusLabel = "Active";
                    
                    if (u.is_suspended) {
                      statusBg = "bg-[var(--color-danger-bg)]";
                      statusText = "text-[var(--color-danger-text)]";
                      statusLabel = "Suspended";
                    } else if (!u.is_active) {
                      statusBg = "bg-[var(--color-surface-hover)]";
                      statusText = "text-[var(--color-ink-muted)]";
                      statusLabel = "Inactive";
                    }

                    return (
                      <tr
                        key={u.id}
                        onClick={() => router.push(`/dashboard/users/${u.id}`)}
                        className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                              <UserIcon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{u.full_name}</p>
                              <a href={`mailto:${u.email}`} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate">
                                <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                                <span className="truncate">{u.email}</span>
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
                            <Icon size={16} strokeWidth={2} />
                            <span>{displayRole}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.department ? (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                              <Building2 size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                              <span className="font-medium truncate">{u.department}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-[var(--color-ink-subtle)] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {u.phone_number ? (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                              <Phone size={12} className="text-[var(--color-ink-subtle)]" />
                              <span className="font-medium">{u.phone_number}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusBg} ${statusText}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/users/${u.id}`); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                              title="View Profile"
                            >
                              <ChevronRight size={14} />
                            </button>
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
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, processedUsers.length)} of{" "}
                {processedUsers.length} members
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all"
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
