// src/hooks/users/useUserProfile.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { usersApi, type UserUpdatePayload } from "@/lib/api/users";
import type { User } from "@/lib/types";

export function useUserProfile() {
  const params = useParams();
  // Safely parse the ID, handling cases where params.id might be an array or undefined
  const userId = params.id ? Number(Array.isArray(params.id) ? params.id[0] : params.id) : null;
  
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

  // ✅ IMPROVED: Strictly typed payload instead of 'any'
  const handleUpdateUser = async (data: UserUpdatePayload) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      const updated = await usersApi.update(userId, data);
      setUser(updated);
      toast.success("User details updated successfully");
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const errorMsg = Array.isArray(detail) 
        ? detail.map((e: any) => e.msg).join(", ") 
        : (detail || "Failed to update user");
      toast.error(errorMsg);
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
    refetch: fetchData, // Exposed in case parent components need to force a refresh
  };
}
