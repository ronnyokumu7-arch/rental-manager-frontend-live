// src/hooks/users/useUserProfile.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/lib/types";

export function useUserProfile() {
  const params = useParams();
  const userId = params.id ? Number(params.id) : null;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userData = await usersApi.get(userId);
      setUser(userData);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateUser = async (data: any) => {
    setActionLoading(true);
    try {
      const updated = await usersApi.update(userId!, data);
      setUser(updated);
      toast.success("User details updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusAction = async (action: "suspend" | "reactivate", reason?: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      let updated: User;
      if (action === "suspend") {
        updated = await usersApi.suspend(user.id, reason);
        toast.success("User suspended successfully", { icon: "⏸️" });
      } else {
        updated = await usersApi.reactivate(user.id);
        toast.success("User reactivated successfully!", { icon: "✅" });
      }
      setUser(updated);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    user,
    loading,
    actionLoading,
    handleUpdateUser,
    handleStatusAction,
  };
}
