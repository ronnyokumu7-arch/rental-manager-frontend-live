// src/components/users/UsersTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { 
  Users, User as UserIcon, Mail, Phone, Building2, Shield, ShieldAlert, 
  Briefcase, KeyRound, Loader2, CheckCircle, Trash2, Send, Star
} from "lucide-react";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
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
  users: User[];
  allUsers?: User[];
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
  actionLoadingId, openDropdownId: _openDropdownId, setOpenDropdownId: _setOpenDropdownId,
  onSuspend, onVerify: _onVerify, onDelete, onResetLink, onSendVerification,
  currentUserRole
}: UsersTableProps) {
  const router = useRouter();

  const mobileList = allUsers && allUsers.length > 0 ? allUsers : users;

  // ✅ Reusable row actions for both table and cards
  const getUserActions = (user: User): RowAction<User>[] => {
    const actions: RowAction<User>[] = [
      {
        label: "View Full Profile",
        icon: UserIcon,
        onClick: () => router.push(`/dashboard/users/${user.id}`),
      },
      {
        label: "Send Reset Link",
        icon: KeyRound,
        variant: "default",
        onClick: () => onResetLink(user.id),
      },
    ];

    // Email verification actions
    if (user.email_verified) {
      actions.push({
        label: "Email Verified",
        icon: CheckCircle,
        variant: "default",
        disabled: true,
        onClick: () => {}, // ✅ FIXED: Added empty onClick for disabled action
      });
    } else {
      actions.push({
        label: "Send Email Verification",
        icon: Mail,
        variant: "default",
        onClick: () => onSendVerification(user.id, "email"),
      });
    }

    // Phone verification actions
    if (user.phone_number) {
      if (user.phone_verified) {
        actions.push({
          label: "Phone Verified",
          icon: CheckCircle,
          variant: "default",
          disabled: true,
          onClick: () => {}, // ✅ FIXED: Added empty onClick for disabled action
        });
      } else {
        actions.push({
          label: "Send Phone Verification",
          icon: Send,
          variant: "default",
          onClick: () => onSendVerification(user.id, "phone"),
        });
      }
    }

    // Delete action (with permission check)
    if (!(user.is_tenant_owner && currentUserRole !== "super_admin")) {
      actions.push({
        label: "Delete User",
        icon: Trash2,
        variant: "danger",
        separator: true,
        onClick: () => onDelete(user.id),
      });
    }

    return actions;
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

  return (
    <>
      {/* ✅ MOBILE: Reusable CardGrid */}
      <div className="block md:hidden">
        <CardGrid<User> // ✅ FIXED: Explicitly pass User generic type
          data={mobileList}
          getCardId={(user) => user.id}
          
          // Header: Avatar + Name + Role/Department
          renderCardHeader={({ item }) => {
            const isAgencyOwner = item.is_tenant_owner === true;
            const emailVerified = item.email_verified === true;
            const phoneVerified = item.phone_verified === true;
            const bothVerified = emailVerified && phoneVerified;
            const partiallyVerified = emailVerified || phoneVerified;
            
            const shieldColor = isAgencyOwner || bothVerified 
              ? "hidden" 
              : partiallyVerified 
                ? "text-amber-500" 
                : "text-[var(--color-ink-muted)]";
            
            return (
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                  <UserIcon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h4 className="text-sm font-bold text-[var(--color-ink)] leading-snug break-words truncate">
                      {item.full_name}
                    </h4>
                    {isAgencyOwner && (
                      <span title="Agency Owner" className="flex-shrink-0">
                        <Star size={14} className="text-amber-500 fill-amber-500/20" />
                      </span>
                    )}
                    {!isAgencyOwner && !bothVerified && (
                      <div className={`relative flex-shrink-0 ${shieldColor}`}>
                        <Shield size={14} />
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none -mt-0.5">!</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary-text)] mt-0.5">
                    <Building2 size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="break-words">{item.department || "Unassigned"}</span>
                  </div>
                </div>
              </div>
            );
          }}
          
          // ✅ FIXED: Merged renderCardPreview and renderCardDetails into renderCardBody
          renderCardBody={({ item }) => {
            const emailVerified = item.email_verified === true;
            const phoneVerified = item.phone_verified === true;
            const isAgencyOwner = item.is_tenant_owner === true;
            const bothVerified = emailVerified && phoneVerified;
            const partiallyVerified = emailVerified || phoneVerified;

            let statusBg = "bg-[var(--color-success-bg)]";
            let statusText = "text-[var(--color-success-text)]";
            let statusLabel = "Active";
            let StatusIcon = CheckCircle;
            
            if (isAgencyOwner) {
              statusBg = "bg-amber-500/10";
              statusText = "text-amber-600 dark:text-amber-400";
              statusLabel = "Agency Owner";
              StatusIcon = Star;
            } else if (bothVerified) {
              if (item.is_suspended) {
                statusBg = "bg-[var(--color-danger-bg)]";
                statusText = "text-[var(--color-danger-text)]";
                statusLabel = "Suspended";
                StatusIcon = ShieldAlert;
              }
            } else if (partiallyVerified) {
              statusBg = "bg-amber-500/10";
              statusText = "text-amber-600 dark:text-amber-400";
              statusLabel = "Verify";
              StatusIcon = Shield;
            } else {
              statusBg = "bg-gray-500/10";
              statusText = "text-gray-600 dark:text-gray-400";
              statusLabel = "Pending";
              StatusIcon = Mail;
            }

            const showMainAction = !isAgencyOwner && !(bothVerified && !partiallyVerified) && partiallyVerified;
            const isSuspended = item.is_suspended && bothVerified;
            
            return (
              <div className="space-y-2.5 text-xs">
                {/* Job Title */}
                <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                  <Briefcase size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className="break-words font-medium">{item.job_title || "No title"}</span>
                </div>

                {/* Email */}
                <a 
                  href={`mailto:${item.email}`} 
                  onClick={(e) => e.stopPropagation()} 
                  className="flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors min-w-0"
                >
                  <Mail size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className="break-all font-medium">{item.email}</span>
                  {emailVerified && (
                    <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0 ml-0.5" />
                  )}
                </a>

                {/* Phone */}
                <a 
                  href={`tel:${item.phone_number}`} 
                  onClick={(e) => e.stopPropagation()} 
                  className="flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors min-w-0"
                >
                  <Phone size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className="break-words font-medium">{item.phone_number || "No phone"}</span>
                  {phoneVerified && (
                    <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0 ml-0.5" />
                  )}
                </a>

                {/* Divider */}
                <div className="border-t border-[var(--color-surface-border)]/60 pt-2 mt-2" />

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">Status:</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBg} ${statusText}`}>
                    <StatusIcon size={10} />
                    {statusLabel}
                  </span>
                </div>
                
                {/* Quick Action */}
                {showMainAction && (
                  <div className="pt-2 border-t border-[var(--color-surface-border)]/40">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSuspend(item); }}
                      disabled={actionLoadingId === item.id}
                      className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 ${
                        isSuspended 
                          ? "text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20" 
                          : "text-amber-600 bg-amber-500/10 hover:bg-amber-500/20"
                      }`}
                    >
                      {actionLoadingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={12} />}
                      <span>{isSuspended ? "Reactivate" : "Suspend"}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }}
          
          // ✅ Row actions (3-dots menu) - correctly targeted via portal in CardGrid
          rowActions={getUserActions}
          
          // Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={3}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ✅ DESKTOP: Reusable DataTable */}
      <div className="hidden md:block">
        <DataTable
          data={users}
          columns={[
            {
              header: "Team Member",
              accessorKey: "full_name",
              cell: ({ row }) => {
                const user = row.original;
                const emailVerified = user.email_verified === true;
                
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                      <UserIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{user.full_name}</p>
                      <a href={`mailto:${user.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate">
                        <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                        {emailVerified && <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0" />}
                      </a>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Role",
              accessorKey: "role",
              cell: ({ row }) => {
                const user = row.original;
                const displayRole = getRoleDisplay(user.role, user.department, user.job_title);
                const { color, Icon } = getRoleStyle(user.role, user.job_title);
                
                return (
                  <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
                    <Icon size={16} strokeWidth={2} />
                    <span>{displayRole}</span>
                  </div>
                );
              },
            },
            {
              header: "Department",
              accessorKey: "department",
              cell: ({ row }) => {
                const user = row.original;
                return user.department ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                    <Building2 size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="font-medium truncate">{user.department}</span>
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-ink-subtle)] italic">Unassigned</span>
                );
              },
            },
            {
              header: "Phone",
              accessorKey: "phone_number",
              cell: ({ row }) => {
                const user = row.original;
                const phoneVerified = user.phone_verified === true;
                
                return user.phone_number ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                    <Phone size={12} className="text-[var(--color-ink-subtle)]" />
                    <span className="font-medium">{user.phone_number}</span>
                    {phoneVerified && <CheckCircle size={12} className="text-[var(--color-success-text)] flex-shrink-0" />}
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                );
              },
            },
            {
              header: "Status",
              accessorKey: "status",
              cell: ({ row }) => {
                const user = row.original;
                const emailVerified = user.email_verified === true;
                const phoneVerified = user.phone_verified === true;
                const isAgencyOwner = user.is_tenant_owner === true;
                const bothVerified = emailVerified && phoneVerified;
                const partiallyVerified = emailVerified || phoneVerified;

                let statusBg = "bg-[var(--color-success-bg)]";
                let statusText = "text-[var(--color-success-text)]";
                let statusLabel = "Active";
                let StatusIcon = CheckCircle;
                let statusTooltip = "Fully verified and active";
                
                if (isAgencyOwner) {
                  statusBg = "bg-amber-500/10";
                  statusText = "text-amber-600 dark:text-amber-400";
                  statusLabel = "Agency Owner";
                  StatusIcon = Star;
                  statusTooltip = "Primary owner of this tenant";
                } else if (bothVerified) {
                  if (user.is_suspended) {
                    statusBg = "bg-[var(--color-danger-bg)]";
                    statusText = "text-[var(--color-danger-text)]";
                    statusLabel = "Suspended";
                    StatusIcon = ShieldAlert;
                    statusTooltip = "Account suspended by admin";
                  }
                } else if (partiallyVerified) {
                  statusBg = "bg-amber-500/10";
                  statusText = "text-amber-600 dark:text-amber-400";
                  statusLabel = "Verify";
                  StatusIcon = Shield;
                  statusTooltip = emailVerified ? "Email verified, phone pending" : "Phone verified, email pending";
                } else {
                  statusBg = "bg-gray-500/10";
                  statusText = "text-gray-600 dark:text-gray-400";
                  statusLabel = "Pending";
                  StatusIcon = Mail;
                  statusTooltip = "Awaiting email and phone verification";
                }
                
                return (
                  <span 
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBg} ${statusText}`}
                    title={statusTooltip}
                  >
                    <StatusIcon size={10} />
                    {statusLabel}
                  </span>
                );
              },
            },
          ]}
          // ✅ Row actions (3-dots menu) - correctly targeted via portal in DataTable
          rowActions={getUserActions}
          getRowId={(user) => user.id}
          loading={loading}
          emptyMessage="No team members found"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          viewMode="desktop"
        />
      </div>
    </>
  );
}