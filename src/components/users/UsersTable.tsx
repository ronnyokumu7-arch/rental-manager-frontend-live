// src/components/users/UsersTable.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, User as UserIcon, Mail, Phone, Building2, Shield, ShieldAlert, 
  Briefcase, MoreVertical, KeyRound, Loader2, CheckCircle, Trash2, Send, Star
} from "lucide-react";
import type { User } from "@/lib/types";

// Helpers
const getRoleDisplay = (role: string, department?: string | null, jobTitle?: string | null) => {
  if (role === "super_admin") return "System Admin";
  if (jobTitle) return jobTitle;
  if (department) return department;
  return "Unassigned";
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

interface UsersTableProps {
  users: User[]; // Paginated array for Desktop table view
  allUsers?: User[]; // Full unpaginated array for Mobile continuous scroll
  loading: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
  pageSize: number;
  actionLoadingId: number | null;
  openDropdownId: number | null;
  setOpenDropdownId: (id: number | null) => void;
  onSuspend: (user: User) => void;
  onVerify: (userId: number) => void;
  onDelete: (userId: number) => void;
  onResetLink: (userId: number) => void;
  onSendVerification: (userId: number, channel: "email" | "phone") => void;
  currentUserRole: string;
}

export default function UsersTable({
  users, allUsers, loading, currentPage, totalPages, setCurrentPage, totalItems, pageSize,
  actionLoadingId, openDropdownId, setOpenDropdownId,
  onSuspend, onVerify: _onVerify, onDelete, onResetLink, onSendVerification,
  currentUserRole
}: UsersTableProps) {
  const router = useRouter();
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  // Fallback to paginated `users` if `allUsers` isn't explicitly provided
  const mobileList = allUsers && allUsers.length > 0 ? allUsers : users;

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

  const handleToggleDropdown = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    if (openDropdownId === userId) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    } else {
      setOpenDropdownId(userId);
      const rect = e.currentTarget.getBoundingClientRect();
      
      const dropdownWidth = 240;
      const estimatedDropdownHeight = 220;
      const edgePadding = 12;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let rightPos = viewportWidth - rect.right;
      if (viewportWidth - rightPos < dropdownWidth + edgePadding) {
        rightPos = Math.max(edgePadding, viewportWidth - rect.left - dropdownWidth);
      }

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      let topPos: number;
      if (spaceBelow < estimatedDropdownHeight + edgePadding && spaceAbove > spaceBelow) {
        topPos = Math.max(edgePadding, rect.top - estimatedDropdownHeight - 8);
      } else {
        topPos = Math.min(rect.bottom + 8, viewportHeight - estimatedDropdownHeight - edgePadding);
      }

      topPos = Math.max(edgePadding, topPos);

      setDropdownPos({
        top: topPos,
        right: rightPos,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading team...
      </div>
    );
  }

  if (users.length === 0 && mobileList.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
          <Users size={24} className="text-[var(--color-ink-subtle)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
          No team members found
        </h3>
        <p className="text-sm text-[var(--color-ink-muted)]">Try adjusting your search or filters.</p>
      </div>
    );
  }

  const allAvailableUsers = allUsers || users;
  const activeUserForDropdown = allAvailableUsers.find((u) => u.id === openDropdownId);

  return (
    <>
      {/* MOBILE CONTINUOUS SCROLL CARD VIEW (< md) */}
      <div className="block md:hidden p-4 space-y-3">
        {mobileList.map((u) => {
          const displayRole = getRoleDisplay(u.role, u.department, u.job_title);
          const { color, Icon } = getRoleStyle(u.role, u.job_title);
          
          const emailVerified = u.email_verified === true;
          const phoneVerified = u.phone_verified === true;
          const isAgencyOwner = u.is_tenant_owner === true;

          let statusBg = "bg-[var(--color-success-bg)]";
          let statusText = "text-[var(--color-success-text)]";
          let statusLabel = "Active";
          let StatusIcon = CheckCircle;
          
          let ActionIcon = ShieldAlert;
          let actionColor = "text-amber-600 bg-amber-500/10 hover:bg-amber-500/20";
          let actionTitle = "Suspend";
          let actionHandler = () => onSuspend(u);
          let showMainAction = true;

          if (isAgencyOwner) {
            statusBg = "bg-amber-500/10 border border-amber-500/20";
            statusText = "text-amber-600 dark:text-amber-400";
            statusLabel = "Agency Owner";
            StatusIcon = Star;
            showMainAction = false;
          } else if (emailVerified && phoneVerified) {
            if (u.is_suspended) {
              statusBg = "bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)]";
              statusText = "text-[var(--color-danger-text)]";
              statusLabel = "Suspended";
              StatusIcon = ShieldAlert;
              ActionIcon = Shield;
              actionColor = "text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20";
              actionTitle = "Reactivate";
              actionHandler = () => onSuspend(u);
            }
          } else if (emailVerified || phoneVerified) {
            statusBg = "bg-amber-500/10 border border-amber-500/20";
            statusText = "text-amber-600 dark:text-amber-400";
            statusLabel = "Verify";
            StatusIcon = Shield;
            showMainAction = false;
          } else {
            statusBg = "bg-gray-500/10 border border-gray-500/20";
            statusText = "text-gray-600 dark:text-gray-400";
            statusLabel = "Pending";
            StatusIcon = Mail;
            showMainAction = false;
          }

          return (
            <div
              key={`mobile-user-card-${u.id}`}
              className="p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all space-y-3 shadow-sm"
            >
              {/* Header Bar */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                    <UserIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[var(--color-ink)] leading-snug break-words">
                      {u.full_name}
                    </h4>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${color} mt-0.5`}>
                      <Icon size={13} strokeWidth={2} className="flex-shrink-0" />
                      <span className="break-words">{displayRole}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span 
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs ${statusBg} ${statusText} shadow-xs`}
                    title={statusLabel}
                    aria-label={statusLabel}
                  >
                    <StatusIcon size={14} className={isAgencyOwner ? "fill-amber-500/20" : ""} />
                  </span>

                  <div className="relative" data-dropdown-id={u.id}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleDropdown(e, u.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-all"
                      title="More Actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Body Details */}
              <div className="border-t border-[var(--color-surface-border)]/60 pt-2.5 space-y-2 text-xs">
                <a 
                  href={`mailto:${u.email}`} 
                  onClick={(e) => e.stopPropagation()} 
                  className="flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors min-w-0"
                >
                  <Mail size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className="break-all font-medium">{u.email}</span>
                  {emailVerified && (
                    <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0 ml-0.5" />
                  )}
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
                    <Building2 size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="break-words font-medium">{u.department || "Unassigned"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                    <Phone size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="break-words font-medium">{u.phone_number || "No phone"}</span>
                    {phoneVerified && (
                      <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0 ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {showMainAction && (
                <div className="flex items-center justify-end pt-1 border-t border-[var(--color-surface-border)]/40">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); actionHandler(); }}
                    disabled={actionLoadingId === u.id}
                    className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 ${actionColor}`}
                  >
                    {actionLoadingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <ActionIcon size={12} />}
                    <span>{actionTitle}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)]">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Team Member</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Role</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Department</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Phone</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface-border)]">
            {users.map((u) => {
              const displayRole = getRoleDisplay(u.role, u.department, u.job_title);
              const { color, Icon } = getRoleStyle(u.role, u.job_title);
              
              const emailVerified = u.email_verified === true;
              const phoneVerified = u.phone_verified === true;
              const isAgencyOwner = u.is_tenant_owner === true;

              let statusBg = "bg-[var(--color-success-bg)]";
              let statusText = "text-[var(--color-success-text)]";
              let statusLabel = "Active";
              let StatusIcon = CheckCircle;
              let statusTooltip = "Fully verified and active";
              
              let ActionIcon = ShieldAlert;
              let actionColor = "text-amber-600 hover:bg-amber-500/10";
              let actionTitle = "Suspend User";
              let actionHandler = () => onSuspend(u);
              let showMainAction = true;

              if (isAgencyOwner) {
                statusBg = "bg-amber-500/10";
                statusText = "text-amber-600 dark:text-amber-400";
                statusLabel = "Agency Owner";
                StatusIcon = Star;
                statusTooltip = "Primary owner of this tenant";
                showMainAction = false;
              } else if (emailVerified && phoneVerified) {
                if (u.is_suspended) {
                  statusBg = "bg-[var(--color-danger-bg)]";
                  statusText = "text-[var(--color-danger-text)]";
                  statusLabel = "Suspended";
                  StatusIcon = ShieldAlert;
                  statusTooltip = "Account suspended by admin";
                  ActionIcon = Shield;
                  actionColor = "text-emerald-600 hover:bg-emerald-500/10";
                  actionTitle = "Reactivate User";
                  actionHandler = () => onSuspend(u);
                }
              } else if (emailVerified || phoneVerified) {
                statusBg = "bg-amber-500/10";
                statusText = "text-amber-600 dark:text-amber-400";
                statusLabel = "Verify";
                StatusIcon = Shield;
                showMainAction = false;
                statusTooltip = emailVerified ? "Email verified, phone pending" : "Phone verified, email pending";
              } else {
                statusBg = "bg-gray-500/10";
                statusText = "text-gray-600 dark:text-gray-400";
                statusLabel = "Pending";
                StatusIcon = Mail;
                statusTooltip = "Awaiting email and phone verification";
                showMainAction = false;
              }

              return (
                <tr key={u.id} className="group hover:bg-[var(--color-surface-hover)]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                        <UserIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{u.full_name}</p>
                        <a href={`mailto:${u.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate">
                          <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                          <span className="truncate">{u.email}</span>
                          {emailVerified && <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0" />}
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
                        {phoneVerified && <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0" />}
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBg} ${statusText}`}
                      title={statusTooltip}
                    >
                      <StatusIcon size={10} />
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {showMainAction && (
                        <button
                          onClick={(e) => { e.stopPropagation(); actionHandler(); }}
                          disabled={actionLoadingId === u.id}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-50 ${actionColor}`}
                          title={actionTitle}
                        >
                          {actionLoadingId === u.id ? <Loader2 size={14} className="animate-spin" /> : <ActionIcon size={14} />}
                        </button>
                      )}

                      <div className="relative" data-dropdown-id={u.id}>
                        <button
                          onClick={(e) => handleToggleDropdown(e, u.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                          title="More Actions"
                        >
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

      {/* SHARED FLOATING DROPDOWN PORTAL */}
      {openDropdownId !== null && dropdownPos && activeUserForDropdown && (
        <div 
          className="fixed z-[100] w-60 max-h-[calc(100vh-24px)] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => { router.push(`/dashboard/users/${activeUserForDropdown.id}`); setOpenDropdownId(null); setDropdownPos(null); }} 
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <UserIcon size={14} /> View Full Profile
          </button>
          
          <button 
            onClick={() => { onResetLink(activeUserForDropdown.id); setOpenDropdownId(null); setDropdownPos(null); }} 
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
          >
            <KeyRound size={14} /> Send Reset Link
          </button>
          
          {activeUserForDropdown.email_verified ? (
            <div className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-t border-[var(--color-surface-border)] opacity-60 cursor-not-allowed">
              <CheckCircle size={14} /> Email Verified
            </div>
          ) : (
            <button 
              onClick={() => { onSendVerification(activeUserForDropdown.id, "email"); setOpenDropdownId(null); setDropdownPos(null); }} 
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
            >
              <Mail size={14} /> Send Email Verification
            </button>
          )}

          {activeUserForDropdown.phone_number ? (
            activeUserForDropdown.phone_verified ? (
              <div className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-t border-[var(--color-surface-border)] opacity-60 cursor-not-allowed">
                <CheckCircle size={14} /> Phone Verified
              </div>
            ) : (
              <button 
                onClick={() => { onSendVerification(activeUserForDropdown.id, "phone"); setOpenDropdownId(null); setDropdownPos(null); }} 
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
              >
                <Send size={14} /> Send Phone Verification
              </button>
            )
          ) : null}

          {!(activeUserForDropdown.is_tenant_owner && currentUserRole !== "super_admin") && (
            <button 
              onClick={() => { onDelete(activeUserForDropdown.id); setOpenDropdownId(null); setDropdownPos(null); }} 
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
            >
              <Trash2 size={14} /> Delete User
            </button>
          )}
        </div>
      )}

      {/* FOOTER & PAGINATION (Desktop Only: hidden md:flex) */}
      <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-ink-muted)]">
          Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} members
        </p>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1} 
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all border border-transparent"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-primary)] text-white tabular-nums">
            {currentPage} / {totalPages || 1}
          </span>
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages || totalPages === 0} 
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all border border-transparent"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
