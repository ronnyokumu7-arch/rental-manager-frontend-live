import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { tenantsApi } from "@/lib/api/tenants";
import type { Tenant } from "@/lib/types";

export const useTenantsList = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [subFilter, setSubFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await tenantsApi.list(0, 100);
      setTenants(data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load tenant directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const kraPin = tenant.profile?.tax_number || "";
      const matchesSearch =
        tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kraPin.toLowerCase().includes(searchQuery.toLowerCase());

      if (!showArchived && tenant.is_archived) return false;
      if (statusFilter === "ACTIVE" && !tenant.is_active) return false;
      if (statusFilter === "SUSPENDED" && tenant.is_active) return false;

      const subStatus = (tenant.subscription_status || "").toUpperCase();
      if (subFilter === "ACTIVE" && subStatus !== "ACTIVE") return false;
      if (subFilter === "INACTIVE" && (subStatus === "ACTIVE" || subStatus === "")) return false;

      return matchesSearch;
    });
  }, [tenants, searchQuery, statusFilter, subFilter, showArchived]);

  // Actions
  const handleToggleSubscription = async (tenant: Tenant, targetStatus: "ACTIVE" | "INACTIVE") => {
    setActionLoadingId(tenant.id);
    try {
      // Logic extracted from your original page
      if (typeof (tenantsApi as any).updateSubscription === "function") {
        await (tenantsApi as any).updateSubscription(tenant.id, { subscription_status: targetStatus });
      } else if (targetStatus === "ACTIVE") {
        await tenantsApi.activate(tenant.id);
      } else {
        await tenantsApi.suspend(tenant.id, "Subscription update");
      }
      toast.success(`Subscription ${targetStatus === "ACTIVE" ? "activated" : "deactivated"}`);
      await fetchTenants();
    } catch (error: any) {
      toast.error(error?.message || "Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id: number | string) => {
    if (!confirm("Move this tenant to the Vault?")) return;
    setActionLoadingId(id);
    try {
      await tenantsApi.archive(id);
      toast.success("Tenant moved to Vault");
      await fetchTenants();
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    tenants, filteredTenants, loading, actionLoadingId,
    searchQuery, setSearchQuery, statusFilter, setStatusFilter,
    subFilter, setSubFilter, showArchived, setShowArchived,
    fetchTenants, handleToggleSubscription, handleArchive
  };
};
