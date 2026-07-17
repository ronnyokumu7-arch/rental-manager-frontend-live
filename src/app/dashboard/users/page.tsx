// src/app/dashboard/users/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Plus, Mail, Phone, User as UserIcon, ChevronRight,
  Shield, ShieldAlert, Briefcase, Building2, Archive, MoreVertical,
  Copy, Check, Trash2, KeyRound, Loader2, Search, Filter, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import type { User as UserType } from "@/lib/types";

// ── Constants for Quick Invite ───────────────────────────────────────────
const ADMIN_TITLES = ["Director", "Manager", "HR"];
const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  "Finance": ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

// ── Helpers ──────────────────────────────────────────────────────────────
const getRoleDisplay = (role: string, department?: string | null, jobTitle?: string | null) => {
  if (role === "super_admin") return "System Admin";
  if (jobTitle) return jobTitle;
  if (department) return department;
  return "Unassigned";
};

// ✅ UPDATED: Admin/Director stays strictly on top
const getSortPriority = (role: string, jobTitle?: string | null) => {
  if (role === "super_admin" || role === "tenant_admin") return 1;
  if (jobTitle === "Admin" || jobTitle === "Director") return 2;
  if (["CEO", "General Manager", "Founder", "Founder & CEO"].includes(jobTitle || "")) return 3;
  if (jobTitle === "Manager") return 4;
  if (["Accountant", "Cashier", "Credit Control"].includes(jobTitle || "")) return 5;
  if (jobTitle === "HR") return 6;
  if (["Dispatcher", "Head of Operations", "Operations Manager"].includes(jobTitle || "")) return 7;
  return 8;
};

const getRoleStyle = (role: string, jobTitle?: string | null) => {
  if (role === "super_admin" || ["CEO", "Director", "General Manager"].includes(jobTitle || "")) {
    return { color: "text-[var(--color-primary)]", Icon: Shield };
  }
  if (role === "tenant_admin" || ["Manager", "HR", "HR/Manager"].includes(jobTitle || "")) {
    return { color: "text-[var(--color-primary)]", Icon: Briefcase };
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
  const pageSize = 7; // ✅ LOCKED DOWN: Exactly 7 users per page

  // Quick Invite Modal State
  const [showQuickInvite, setShowQuickInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [quickInviteData, setQuickInviteData] = useState({
    full_name: "",
    email: "",
    department: "",
    job_title: "",
  });

  // Action State
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

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
    users.forEach((u) => { if (u.department) depts.add(u.department); });
    return Array.from(depts).sort().map((d) => ({ value: d, label: d }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleQuickInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const newUser = await usersApi.create({
        full_name: quickInviteData.full_name,
        email: quickInviteData.email,
        role: "tenant_staff",
        department: quickInviteData.department,
        job_title: quickInviteData.job_title,
        is_active: true,
      });
      
      const link = `${window.location.origin}/invite?token=${newUser.invite_token}`;
      setInviteLink(link);
      setUsers([newUser, ...users]);
      toast.success("Invite generated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied! Ready to share via SMS or WhatsApp.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSuspendToggle = async (user: UserType) => {
    setActionLoadingId(user.id);
    try {
      if (user.is_suspended) {
        await usersApi.reactivate(user.id);
        toast.success("User reactivated successfully");
      } else {
        await usersApi.suspend(user.id, "Suspended via Team Management");
        toast.success("User suspended successfully");
      }
      const data = await usersApi.list();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Action failed");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  // ✅ NEW: Handle Verify Action
  const handleVerifyUser = async (userId: number) => {
    setActionLoadingId(userId);
    try {
      await usersApi.update(userId, { is_onboarded: true });
      toast.success("User verified successfully");
      const data = await usersApi.list();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to verify user");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    setActionLoadingId(userId);
    try {
      await usersApi.delete(userId);
      toast.success("User deleted successfully");
      setUsers(users.filter(u => u.id !== userId));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleSendResetLink = async (userId: number) => {
    setActionLoadingId(userId);
    try {
      await usersApi.sendResetLink(userId, { send_to_email: true, send_to_phone: false });
      toast.success("Reset link sent to user's email");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to send reset link");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    if (openDropdownId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdownId]);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowQuickInvite(true); setInviteLink(null); setQuickInviteData({ full_name: "", email: "", department: "", job_title: "" }); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] shadow-sm transition-all"
            >
              <Mail size={16} /> Quick Invite
            </button>
            <button
              onClick={() => router.push("/dashboard/users/new")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
            >
              <Plus size={16} /> Add Member
            </button>
          </div>
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
              onClick={() => setView("inactive")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                view === "inactive" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Archive size={12} /> Inactive
            </button>
          </div>

          {/* ✅ UPDATED: Standardized Filter Padding (pl-9 pr-9) with custom ChevronDown for perfect symmetry */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, role..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
              <select
                value={departmentFilter || ""}
                onChange={(e) => setDepartmentFilter(e.target.value || null)}
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {departmentFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading team...
          </div>
        ) : processedUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              {view === "active" ? "No active team members" : "No inactive team members"}
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || departmentFilter ? "Try adjusting your search or filters." : view === "active" ? "Add your first team member to get started." : "Deactivated or suspended members will appear here."}
            </p>
            {view === "active" && !search && !departmentFilter && (
              <button onClick={() => router.push("/dashboard/users/new")} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all">
                <Plus size={16} /> Add Member
              </button>
            )}
          </div>
        ) : (
          <>
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
                    
                    // ✅ UPDATED: Precise Status & Shield Button Logic
                    let statusBg = "bg-[var(--color-success-bg)]";
                    let statusText = "text-[var(--color-success-text)]";
                    let statusLabel = "Active";
                    
                    // ✅ UPDATED: Background removed, only semantic text color + hover background
                    let ActionIcon = ShieldAlert;
                    let actionColor = "text-amber-600 hover:bg-amber-500/10";
                    let actionTitle = "Suspend User";
                    let actionHandler = () => handleSuspendToggle(u);

                    if (!u.is_onboarded) {
                      statusBg = "bg-amber-500/10";
                      statusText = "text-amber-600 dark:text-amber-400";
                      statusLabel = "Verify";
                      ActionIcon = Shield;
                      actionColor = "text-blue-600 hover:bg-blue-500/10";
                      actionTitle = "Verify User";
                      actionHandler = () => handleVerifyUser(u.id);
                    } else if (u.is_suspended) {
                      statusBg = "bg-[var(--color-danger-bg)]";
                      statusText = "text-[var(--color-danger-text)]";
                      statusLabel = "Suspended";
                      ActionIcon = Shield;
                      actionColor = "text-emerald-600 hover:bg-emerald-500/10";
                      actionTitle = "Reactivate User";
                      actionHandler = () => handleSuspendToggle(u);
                    }

                    return (
                      <tr
                        key={u.id}
                        onClick={() => router.push(`/dashboard/users/${u.id}`)}
                        className="hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* ✅ UPDATED: Default Avatar Icon instead of initials */}
                            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                              <UserIcon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{u.full_name}</p>
                              <a href={`mailto:${u.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate">
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
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBg} ${statusText}`}>
                            {statusLabel === "Verify" && <Mail size={10} />}
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* ✅ UPDATED: Background removed, only hover effect */}
                            <button
                              onClick={(e) => { e.stopPropagation(); actionHandler(); }}
                              disabled={actionLoadingId === u.id}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-50 ${actionColor}`}
                              title={actionTitle}
                            >
                              {actionLoadingId === u.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <ActionIcon size={14} />
                              )}
                            </button>

                            {/* ✅ UPDATED: Background removed, only hover effect */}
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === u.id ? null : u.id); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                                title="More Actions"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {openDropdownId === u.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    onClick={() => { router.push(`/dashboard/users/${u.id}`); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                                  >
                                    <UserIcon size={14} /> View Full Profile
                                  </button>
                                  <button
                                    onClick={() => handleSendResetLink(u.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                                  >
                                    <KeyRound size={14} /> Send Reset Link
                                  </button>
                                  <button
                                    onClick={() => handleDelete(u.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                                  >
                                    <Trash2 size={14} /> Delete User
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
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, processedUsers.length)} of {processedUsers.length} members
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

      {/* ── Quick Invite Modal ───────────────────────────────────────────── */}
      {showQuickInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {!inviteLink ? (
              <form onSubmit={handleQuickInvite} className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-ink)]">Quick Invite</h3>
                    <p className="text-xs text-[var(--color-ink-muted)]">Send a secure setup link via SMS or WhatsApp.</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Full Name</label>
                    <input required className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" 
                      value={quickInviteData.full_name} onChange={e => setQuickInviteData({...quickInviteData, full_name: e.target.value})} placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Email Address</label>
                    <input required type="email" className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" 
                      value={quickInviteData.email} onChange={e => setQuickInviteData({...quickInviteData, email: e.target.value})} placeholder="john@company.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Department</label>
                      <select required className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none"
                        value={quickInviteData.department} onChange={e => setQuickInviteData({...quickInviteData, department: e.target.value, job_title: ""})}>
                        <option value="">Select...</option>
                        {Object.keys(STAFF_DEPARTMENTS).map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Job Title</label>
                      <select required disabled={!quickInviteData.department} className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        value={quickInviteData.job_title} onChange={e => setQuickInviteData({...quickInviteData, job_title: e.target.value})}>
                        <option value="">{quickInviteData.department ? "Select Title..." : "Select Dept First"}</option>
                        {quickInviteData.department && STAFF_DEPARTMENTS[quickInviteData.department]?.map((title) => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowQuickInvite(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={inviteLoading || !quickInviteData.department || !quickInviteData.job_title} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {inviteLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    {inviteLoading ? "Generating..." : "Generate Invite"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <Check size={32} />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Ready!</h3>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Copy the link below and share it via SMS or WhatsApp. It expires in 48 hours.
                </p>
                
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                  <code className="flex-1 text-xs text-[var(--color-ink)] truncate text-left">{inviteLink}</code>
                  <button 
                    onClick={copyInviteLink}
                    className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all active:scale-95"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <button 
                  onClick={() => { setShowQuickInvite(false); setInviteLink(null); setQuickInviteData({ full_name: "", email: "", department: "", job_title: "" }); }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all mt-2"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
