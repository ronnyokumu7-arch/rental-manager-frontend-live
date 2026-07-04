// src/hooks/contracts/useContractLifecycle.ts
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { contractsApi } from "@/lib/api/contracts";
import type { Contract } from "@/lib/types";

export function useContractLifecycle(bookingId: number) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareDrawer, setShowShareDrawer] = useState(false);

  // Fetch contract specifically for this booking
  useEffect(() => {
    const fetchContract = async () => {
      if (!bookingId) return;
      setLoading(true);
      try {
        const data = await contractsApi.list({ booking_id: bookingId });
        setContract(data.length > 0 ? data[0] : null);
      } catch (e) {
        console.warn("Contract fetch failed", e);
        setContract(null);
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [bookingId]);

  // Generate and copy the public share link
  const handleCopyLink = async () => {
  if (!contract) return toast.error("No contract found");
  try {
    let shareToken = contract.share_token;
    if (!shareToken) {
      toast.loading("Generating share link...", { duration: 1000 });
      const res = await contractsApi.generateShareLink(contract.id);
      shareToken = res.share_token;
      setContract({ ...contract, share_token: shareToken });
    }
    // ✅ FIXED: Updated to match actual route /contracts/view/[token]
    const shareUrl = `${window.location.origin}/contracts/view/${shareToken}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Contract link copied!");
  } catch (error: any) {
    toast.error(error.response?.data?.detail || "Failed to generate link");
  }
};

  // Open the share drawer
  const handleOpenShareDrawer = () => {
    if (!contract) return toast.error("No contract found");
    setShowShareDrawer(true);
  };

  // Send contract via Email/WhatsApp
  const handleSendContract = async (method: "email" | "whatsapp") => {
    if (!contract) return;
    try {
      toast.loading(`Sending via ${method}...`, { duration: 1000 });
      // Calls the backend endpoint to trigger the email
      await contractsApi.sendToClient(contract.id);
      toast.success(`Contract sent via ${method}!`);
      setShowShareDrawer(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to send contract");
    }
  };

  return {
    contract,
    loading,
    showShareDrawer,
    setShowShareDrawer,
    handleCopyLink,
    handleOpenShareDrawer,
    handleSendContract,
  };
}
