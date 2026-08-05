"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useUsersList } from "@/hooks/users/useUsersList";

import UsersToolbar from "@/components/users/UsersToolbar";
import UsersTable from "@/components/users/UsersTable";

// Dynamic loading of modals to preserve optimal chunking
const QuickInviteModal = dynamic(() => import("@/components/users/QuickInviteModal"), {
  ssr: false,
  loading: () => null,
});

const AddMemberChoiceModal = dynamic(() => import("@/components/users/AddMemberChoiceModal"), {
  ssr: false,
  loading: () => null,
});

const getErrorMessage = (error: any, fallback: string) => {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg).join(", ");
  }
  return typeof detail === "string" ? detail : fallback;
};

export default function RosterTab() {
  const { user } = useAuth();

  // Core Data Hook
  const {
    users, paginatedUsers, filteredUsers, loading,
    totalUsers, activeUsers, inactiveUsers,
    category, setCategory,
    search, setSearch,
    departmentFilter, setDepartmentFilter,
    currentPage, setCurrentPage, totalPages,
    updateUserLocally, removeUserLocally,
  } = useUsersList();

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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      toast.error(getErrorMessage(error, `Failed to send ${channel} verification`));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, []);

  const handleDelete = useCallback(async (userId: number) => {
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
