// src/hooks/financials/useContracts.ts
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { contractsApi } from "@/lib/api/contracts";
import type { Contract, ContractStatus } from "@/lib/types";

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { contract_status: statusFilter } : undefined;
      const data = await contractsApi.list(params);
      setContracts(data);
    } catch (error) {
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  // Client-side filtering
  const filteredContracts = useMemo(() => {
    if (!search) return contracts;
    const q = search.toLowerCase();
    return contracts.filter(
      (c) =>
        c.contract_number.toLowerCase().includes(q) ||
        c.booking_id?.toString().includes(q)
    );
  }, [contracts, search]);

  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  // Actions
  const handleDownload = async (id: number) => {
    try {
      toast.loading("Generating PDF...");
      const res = await contractsApi.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Contract-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF downloaded");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download PDF");
    }
  };

  const handleCopyLink = async (id: number) => {
    try {
      const res = await contractsApi.generateShareLink(id);
      await navigator.clipboard.writeText(res.share_url);
      toast.success("Contract share link copied to clipboard!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to generate link");
    }
  };

  const handleSend = async (id: number) => {
    try {
      toast.loading("Sending to client...");
      await contractsApi.sendToClient(id);
      toast.dismiss();
      toast.success("Contract sent to client email successfully!");
      fetchContracts(); // Refresh to show 'sent' status
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || "Failed to send contract (Check client email)");
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirm("Are you sure you want to void this contract? This action cannot be undone.")) return;
    try {
      await contractsApi.void(id);
      toast.success("Contract voided successfully");
      fetchContracts();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to void contract");
    }
  };

  return {
    contracts: paginatedContracts,
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    totalPages,
    totalItems: filteredContracts.length,
    handleDownload,
    handleCopyLink,
    handleSend,
    handleVoid,
    refetch: fetchContracts,
  };
}
