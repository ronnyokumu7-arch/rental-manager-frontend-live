// src/hooks/clients/useClientsList.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/lib/types";
import toast from "react-hot-toast";

type ViewMode = "active" | "vault";

export function useClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const pageSize = 7;

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = view === "active" ? await clientsApi.list() : await clientsApi.listArchived();
      setClients(data);
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(() => {
    let result = clients;
    if (view === "active" && statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.id_number?.toLowerCase().includes(q) ||
          c.dl_number?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [clients, view, statusFilter, search]);

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    if (openDropdownId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdownId]);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const suspendedClients = clients.filter((c) => c.status === "suspended").length;

  // ✅ UPDATED: Block verification if compliance docs are missing or DL is expired
  const handleVerify = async (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const isDlExpired = client.dl_expiry ? new Date(client.dl_expiry) < new Date() : true;
      if (isDlExpired || !client.id_image_front || !client.dl_image_front) {
        toast.error("Action blocked: Expired or missing compliance documents. Please renew DL and upload documents first.");
        return;
      }
    }
    setActionLoadingId(clientId);
    try {
      await clientsApi.update(clientId, { status: "active" });
      toast.success("Client verified successfully");
      await fetchClients();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to verify client");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleSuspend = async (clientId: number) => {
    setActionLoadingId(clientId);
    try {
      await clientsApi.update(clientId, { status: "suspended" });
      toast.success("Client suspended successfully");
      await fetchClients();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to suspend client");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  // ✅ UPDATED: Block reactivation if compliance docs are missing or DL is expired
  const handleReactivate = async (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const isDlExpired = client.dl_expiry ? new Date(client.dl_expiry) < new Date() : true;
      if (isDlExpired || !client.id_image_front || !client.dl_image_front) {
        toast.error("Action blocked: Expired or missing compliance documents. Please renew DL and upload documents first.");
        return;
      }
    }
    setActionLoadingId(clientId);
    try {
      await clientsApi.update(clientId, { status: "active" });
      toast.success("Client reactivated successfully");
      await fetchClients();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to reactivate client");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleArchive = async (clientId: number) => {
    if (!confirm("Are you sure you want to archive this client? This will move them to the Vault.")) return;
    setActionLoadingId(clientId);
    try {
      await clientsApi.archive(clientId);
      toast.success("Client archived successfully");
      await fetchClients();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to archive client");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  return {
    clients,
    loading,
    view,
    setView,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    filteredClients,
    paginatedClients,
    totalPages,
    totalClients,
    activeClients,
    suspendedClients,
    actionLoadingId,
    openDropdownId,
    setOpenDropdownId,
    handleVerify,
    handleSuspend,
    handleReactivate,
    handleArchive,
    fetchClients,
  };
}
