// src/components/users/UsersTable.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, User as UserIcon, Mail, Phone, Building2, Shield, ShieldAlert, 
  Briefcase, MoreVertical, KeyRound, Loader2, CheckCircle, Trash2, Send, Star
} from "lucide-react";
import type { User } from "@/lib/types";

// Helpers (kept inside UI for visual mapping)
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
  users: User[];
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
  users, loading, currentPage, totalPages, setCurrentPage, totalItems, pageSize,
  actionLoadingId, openDropdownId, setOpenDropdownId,
  onSuspend, onVerify, onDelete, onResetLink, onSendVerification,
  currentUserRole
}: UsersTableProps) {
  const router = useRouter();
  
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

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
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
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

  if (users.length === 0) {
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

  return (
    <>
      <div className="overflow-x-auto">
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
              
              // ✅ THE ABSOLUTE TRUTH: Status is driven ONLY by verification flags
              // Strict boolean checks prevent null/undefined/string "false" bugs
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

              // Rule 0: Agency Owner (Highest Priority)
              if (isAgencyOwner) {
                statusBg = "bg-amber-500/10";
                statusText = "text-amber-600 dark:text-amber-400";
                statusLabel = "Agency Owner";
                StatusIcon = Star;
                statusTooltip = "Primary owner of this tenant";
                showMainAction = false;
              } 
              // Rule 1: 2/2 Verified = ACTIVE
              else if (emailVerified && phoneVerified) {
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
              } 
              // Rule 2: 1/2 Verified = VERIFY (Amber)
              else if (emailVerified || phoneVerified) {
                statusBg = "bg-amber-500/10";
                statusText = "text-amber-600 dark:text-amber-400";
                statusLabel = "Verify";
                StatusIcon = Shield;
                showMainAction = false;
                
                if (emailVerified && !phoneVerified) {
                  statusTooltip = "Email verified, phone verification pending";
                } else if (!emailVerified && phoneVerified) {
                  statusTooltip = "Phone verified, email verification pending";
                }
              } 
              // Rule 3: 0/2 Verified = PENDING (Grey)
              else {
                statusBg = "bg-gray-500/10";
                statusText = "text-gray-600 dark:text-gray-400";
                statusLabel = "Pending";
                StatusIcon = Mail;
                statusTooltip = "Awaiting email and phone verification";
                showMainAction = false;
              }

              const hideDestructiveActions = isAgencyOwner && currentUserRole !== "super_admin";

              return (
                <tr key={u.id} className="group">
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
                          {emailVerified && (
                            <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0" title="Email Verified" />
                          )}
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
                        {phoneVerified && (
                          <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0" title="Phone Verified" />
                        )}
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

                        {openDropdownId === u.id && dropdownPos && (
                          <div 
                            className="fixed z-[100] w-64 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                            style={{ top: dropdownPos.top, right: dropdownPos.right }}
                          >
                            <button onClick={() => { router.push(`/dashboard/users/${u.id}`); setOpenDropdownId(null); setDropdownPos(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors">
                              <UserIcon size={14} /> View Full Profile
                            </button>
                            <button onClick={() => { onResetLink(u.id); setOpenDropdownId(null); setDropdownPos(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]">
                              <KeyRound size={14} /> Send Reset Link
                            </button>
                            
                            {emailVerified ? (
                              <div className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-t border-[var(--color-surface-border)] opacity-60 cursor-not-allowed">
                                <CheckCircle size={14} /> Email Verified
                              </div>
                            ) : (
                              <button 
                                onClick={() => { onSendVerification(u.id, "email"); setOpenDropdownId(null); setDropdownPos(null); }} 
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                              >
                                <Mail size={14} /> Send Email Verification
                              </button>
                            )}

                            {u.phone_number ? (
                              phoneVerified ? (
                                <div className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-t border-[var(--color-surface-border)] opacity-60 cursor-not-allowed">
                                  <CheckCircle size={14} /> Phone Verified
                                </div>
                              ) : (
                                <button 
                                  onClick={() => { onSendVerification(u.id, "phone"); setOpenDropdownId(null); setDropdownPos(null); }} 
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-surface-border)]"
                                >
                                  <Send size={14} /> Send Phone Verification
                                </button>
                              )
                            ) : null}

                            {!hideDestructiveActions && (
                              <button 
                                onClick={() => { onDelete(u.id); setOpenDropdownId(null); setDropdownPos(null); }} 
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors border-t border-[var(--color-surface-border)]"
                              >
                                <Trash2 size={14} /> Delete User
                              </button>
                            )}
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

      <div className="p-4 border-t border-[var(--color-surface-border)] flex items-center justify-between">
        <p className="text-xs text-[var(--color-ink-muted)]">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} members
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all">Previous</button>
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">{currentPage} / {totalPages || 1}</span>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all">Next</button>
        </div>
      </div>
    </>
  );
}
