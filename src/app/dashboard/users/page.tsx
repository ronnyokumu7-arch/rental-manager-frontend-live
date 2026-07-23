// src/app/dashboard/users/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

import { useUsersList, type CategoryMode } from "@/hooks/users/useUsersList";
import UsersToolbar from "@/components/users/UsersToolbar";
import UsersTable from "@/components/users/UsersTable";
import QuickInviteModal from "@/components/users/QuickInviteModal";
import AddMemberChoiceModal from "@/components/users/AddMemberChoiceModal";

const TAB_INFO: Record<CategoryMode, { title: string; description: string; icon: any }> = {
  executive: {
    title: "Executive Team",
    description: "Manage your C-suite, directors, and top-level leadership.",
    icon: Shield,
  },
  staff: {
    title: "Staff Members",
    description: "Manage your operational staff, admins, and their access levels.",
    icon: Briefcase,
  },
};

const getErrorMessage = (error: any, fallback: string) => {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg).join(", ");
  }
  return typeof detail === "string" ? detail : fallback;
};

export default function UsersPage() {
  const router = useRouter();
  
  const { user } = useAuth();

  // 1. Core Logic Hook
  const {
    users, paginatedUsers, filteredUsers, loading,
    totalUsers, activeUsers, inactiveUsers,
    category, setCategory,
    search, setSearch,
    departmentFilter, setDepartmentFilter,
    currentPage, setCurrentPage, totalPages,
    updateUserLocally, removeUserLocally,
  } = useUsersList();

  const currentTabInfo = TAB_INFO[category];

  // 2. UI Interaction State
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [showQuickInvite, setShowQuickInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // 3. Derived Data
  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    users.forEach((u) => { if (u.department) depts.add(u.department); });
    return Array.from(depts).sort().map((d) => ({ value: d, label: d }));
  }, [users]);

  // 4. Action Handlers
  const handleQuickInviteSubmit = async (data: { department: string; job_title: string }) => {
    setInviteLoading(true);
    try {
      const tempId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const payload = {
        full_name: "Pending User",
        email: `pending-${tempId}@pending.setup`,
        department: data.department,
        job_title: data.job_title,
        role: "tenant_staff" as const,
        is_active: true,
      };
      
      const newUser = await usersApi.create(payload);
      const link = `${window.location.origin}/invite?token=${newUser.invite_token}`;
      setInviteLink(link);
      updateUserLocally(newUser);
      toast.success("Invite link generated successfully!");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to create invite"));
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied! Ready to share.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseInviteModal = () => {
    setShowQuickInvite(false);
    setInviteLink(null);
    setCopied(false);
  };

  const handleSuspend = async (user: User) => {
    setActionLoadingId(user.id);
    try {
      if (user.is_suspended) {
        await usersApi.reactivate(user.id);
        toast.success("User reactivated successfully");
      } else {
        await usersApi.suspend(user.id, "Suspended via Team Management");
        toast.success("User suspended successfully");
      }
      updateUserLocally({ ...user, is_suspended: !user.is_suspended, is_active: user.is_suspended });
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Action failed"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleVerify = async (userId: number) => {
    setActionLoadingId(userId);
    try {
      await usersApi.update(userId, { is_onboarded: true });
      toast.success("User verified successfully");
      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) updateUserLocally({ ...updatedUser, is_onboarded: true });
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to verify user"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleResetLink = async (userId: number) => {
    setActionLoadingId(userId);
    try {
      await usersApi.sendResetLink(userId, { send_to_email: true, send_to_phone: false });
      toast.success("Reset link sent to user's email");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to send reset link"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  // ✅ UPDATED: Handle Automated Verification Triggers (Clipboard Copy + Fixed Grammar)
  const handleSendVerification = async (userId: number, channel: "email" | "phone") => {
    setActionLoadingId(userId);
    try {
      const response = await usersApi.sendVerification(userId, { channel });
      
      if (channel === "phone" && response.shareable_message) {
        await navigator.clipboard.writeText(response.shareable_message);
        toast.success("Verification message copied to clipboard! You can now paste and send it via WhatsApp or SMS.");
      } else {
        toast.success(`${channel} verification sent successfully!`);
      }
    } catch (error: any) {
      // ✅ FIXED: Better grammar in the fallback message
      toast.error(getErrorMessage(error, `Failed to send ${channel} verification`));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }
    
    setActionLoadingId(userId);
    try {
      await usersApi.delete(userId);
      toast.success("User deleted successfully");
      removeUserLocally(userId);
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to delete user"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  // 5. Render Orchestrator
  return (
    <div className="space-y-6">
      {/* Premium Header with Executive/Staff Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <currentTabInfo.icon size={20} />
            </div>
            {currentTabInfo.title}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* Executive vs Staff Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setCategory("executive")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              category === "executive" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <Shield size={14} /> Executive
          </button>
          <button
            onClick={() => setCategory("staff")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              category === "staff" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <Briefcase size={14} /> Staff
          </button>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        <UsersToolbar
          category={category}
          setCategory={setCategory}
          search={search}
          setSearch={setSearch}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          departmentOptions={departmentOptions}
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          inactiveUsers={inactiveUsers}
          onAddMember={() => setShowAddChoice(true)}
        />

        <UsersTable
          users={paginatedUsers}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          totalItems={filteredUsers.length}
          pageSize={7}
          actionLoadingId={actionLoadingId}
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
          onSuspend={handleSuspend}
          onVerify={handleVerify}
          onResetLink={handleResetLink}
          onSendVerification={handleSendVerification}
          onDelete={handleDelete}
          currentUserRole={user?.role || "tenant_staff"} 
        />
      </div>

      {/* Modals */}
      <AddMemberChoiceModal 
        isOpen={showAddChoice} 
        onClose={() => setShowAddChoice(false)} 
        onInvite={() => setShowQuickInvite(true)} 
      />
      
      <QuickInviteModal
        isOpen={showQuickInvite}
        onClose={handleCloseInviteModal}
        onSubmit={handleQuickInviteSubmit}
        loading={inviteLoading}
        inviteLink={inviteLink}
        copied={copied}
        onCopy={handleCopyInviteLink}
      />
    </div>
  );
}
