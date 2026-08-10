// src/components/users/manage/RosterTab.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useUsersList } from "@/hooks/users/useUsersList";
import { confirmAction } from "@/lib/utils/confirmAction";

import UsersToolbar from "@/components/users/UsersToolbar";
import UsersTable from "@/components/users/UsersTable";

const QuickInviteModal = dynamic(() => import("@/components/users/QuickInviteModal"), {
  ssr: false,
  loading: () => null,
});

const AddMemberChoiceModal = dynamic(() => import("@/components/users/AddMemberChoiceModal"), {
  ssr: false,
  loading: () => null,
});

interface ApiError {
  response?: {
    data?: {
      detail?: string | Array<{ msg: string }>;
    };
  };
}

const getErrorMessage = (error: ApiError | unknown, fallback: string) => {
  const err = error as ApiError;
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg).join(", ");
  }
  return typeof detail === "string" ? detail : fallback;
};

export default function RosterTab() {
  const { user } = useAuth();

  const {
    users, paginatedUsers, filteredUsers, loading,
    totalUsers, activeUsers, inactiveUsers,
    category, setCategory,
    search, setSearch,
    departmentFilter, setDepartmentFilter,
    currentPage, setCurrentPage, totalPages,
    updateUserLocally, removeUserLocally,
  } = useUsersList();

  // SSR-safe viewport check
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Display strategy:
  // - Desktop (≥640px): Paginated list filtered by current Category tab
  // - Mobile (<640px): Unpaginated FULL combined list (Executive + Staff), respecting search & department filter
  const displayUsers = useMemo(() => {
    if (!isMobile) return paginatedUsers;

    return users.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = u.full_name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchJob = u.job_title?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchJob) return false;
      }
      if (departmentFilter) {
        if (u.department !== departmentFilter) return false;
      }
      return true;
    });
  }, [isMobile, paginatedUsers, users, search, departmentFilter]);

  // Local Interaction State
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [showQuickInvite, setShowQuickInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Derived Department Options
  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    users.forEach((u) => { if (u.department) depts.add(u.department); });
    return Array.from(depts).sort().map((d) => ({ value: d, label: d }));
  }, [users]);

  // Action Handlers
  const handleQuickInviteSubmit = useCallback(async (data: { department: string; job_title: string }) => {
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to create invite"));
    } finally {
      setInviteLoading(false);
    }
  }, [updateUserLocally]);

  const handleCopyInviteLink = useCallback(() => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied! Ready to share.");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [inviteLink]);

  const handleCloseInviteModal = useCallback(() => {
    setShowQuickInvite(false);
    setInviteLink(null);
    setCopied(false);
  }, []);

  const handleSuspend = useCallback(async (userToSuspend: User) => {
    setActionLoadingId(userToSuspend.id);
    try {
      if (userToSuspend.is_suspended) {
        await usersApi.reactivate(userToSuspend.id);
        toast.success("User reactivated successfully");
      } else {
        await usersApi.suspend(userToSuspend.id, "Suspended via Team Management");
        toast.success("User suspended successfully");
      }
      updateUserLocally({
        ...userToSuspend,
        is_suspended: !userToSuspend.is_suspended,
        is_active: userToSuspend.is_suspended
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Action failed"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, [updateUserLocally]);

  const handleVerify = useCallback(async (userId: number) => {
    setActionLoadingId(userId);
    try {
      await usersApi.update(userId, { is_onboarded: true });
      toast.success("User verified successfully");
      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) updateUserLocally({ ...updatedUser, is_onboarded: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to verify user"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, [users, updateUserLocally]);

  const handleResetLink = useCallback(async (userId: number) => {
    setActionLoadingId(userId);
    try {
      await usersApi.sendResetLink(userId, { send_to_email: true, send_to_phone: false });
      toast.success("Reset link sent to user's email");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send reset link"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, []);

  const handleSendVerification = useCallback(async (userId: number, channel: "email" | "phone") => {
    setActionLoadingId(userId);
    try {
      const response = await usersApi.sendVerification(userId, { channel });
      if (channel === "phone" && response.shareable_message) {
        await navigator.clipboard.writeText(response.shareable_message);
        toast.success("Verification message copied to clipboard!");
      } else {
        toast.success(`${channel} verification sent successfully!`);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, `Failed to send ${channel} verification`));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, []);

  const handleDelete = useCallback(async (userId: number) => {
    if (!confirmAction("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }
    setActionLoadingId(userId);
    try {
      await usersApi.delete(userId);
      toast.success("User deleted successfully");
      removeUserLocally(userId);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete user"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, [removeUserLocally]);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
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
        users={displayUsers}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={isMobile ? displayUsers.length : filteredUsers.length}
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

      {/* Lazy Loaded Modals */}
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
