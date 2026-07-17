// src/hooks/financials/useContracts.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { contractsApi } from "@/lib/api/contracts";
import type { Contract, ContractStatus } from "@/lib/types";

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { contract_status: statusFilter } : undefined;
      const data = await contractsApi.list(params);
      
      // ✅ DATA NORMALIZATION: Heal historical data inconsistencies
      // If a contract has a signed date, force its status to "signed"
      const normalizedData = data.map((c: any) => {
        if (c.client_signed_at || c.signed_at) {
          return { ...c, status: "signed" as ContractStatus };
        }
        return c;
      });
      
      setContracts(normalizedData);
    } catch (error) {
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Client-side filtering
  const filteredContracts = useMemo(() => {
    let result = contracts;
    
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.contract_number.toLowerCase().includes(q) ||
          c.booking_id?.toString().includes(q) ||
          ('booking_ref' in c && String((c as any).booking_ref).toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [contracts, search, statusFilter]);

  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, statusFilter]);

  // Actions
  const handleDownload = async (id: number) => {
    try {
      toast.loading("Generating PDF...");
      const res = await contractsApi.downloadPdf(id);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Contract-${id}.pdf`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      
      setContracts(prev => prev.map(c => 
        c.id === id ? { ...c, status: "sent" as ContractStatus, share_token: res.share_token } : c
      ));
      
      toast.success("Contract share link copied to clipboard!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to generate link");
    }
  };

  const handleSend = async (id: number) => {
    try {
      toast.loading("Sending to client...");
      await contractsApi.sendToClient(id);
      
      setContracts(prev => prev.map(c => 
        c.id === id ? { ...c, status: "sent" as ContractStatus } : c
      ));
      
      toast.dismiss();
      toast.success("Contract sent to client email successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || "Failed to send contract");
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirm("Are you sure you want to void this contract? This action cannot be undone.")) return;
    try {
      const updated = await contractsApi.void(id);
      setContracts(prev => prev.map(c => c.id === id ? updated : c));
      toast.success("Contract voided successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to void contract");
    }
  };

  const handleGenerate = async (bookingId: number) => {
    try {
      toast.loading("Generating contract...");
      const newContract = await contractsApi.regenerate(bookingId);
      
      setContracts(prev => {
        const filtered = prev.filter(c => c.booking_id !== bookingId);
        return [newContract, ...filtered];
      });
      
      toast.dismiss();
      toast.success("Contract generated successfully!");
      return true;
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || "Failed to generate contract");
      return false;
    }
  };

  return {
    contracts: paginatedContracts,
    loading,
    search, 
    setSearch,
    statusFilter, 
    setStatusFilter,
    currentPage, 
    setCurrentPage,
    totalPages,
    totalItems: filteredContracts.length,
    handleDownload,
    handleCopyLink,
    handleSend,
    handleVoid,
    handleGenerate,
    refetch: fetchContracts,
  };
}
