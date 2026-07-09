// src/components/bookings/ContractActions.tsx
"use client";

import { useState } from "react";
import { Copy, CheckCircle2, Eye, Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Contract } from "@/lib/types";

interface ContractActionsProps {
  contract: Contract;
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function ContractActions({ contract, onView, onDownload, onShare }: ContractActionsProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  // ✅ FIXED: Removed the hidden \n at the end of the URL! 
  // Previously, copying the link included an invisible newline, breaking the URL.
  const url = `${window.location.origin}/contract/${contract.share_token}`;

  // ✅ FIXED: Broken arrow function (= >) corrected to (=>)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors"
        title="Copy Link"
      >
        {isCopied ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
      </button>
      <button
        onClick={onView}
        className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors"
        title="View Contract"
      >
        <Eye size={16} />
      </button>
      <button
        onClick={onDownload}
        className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors"
        title="Download PDF"
      >
        <Download size={16} />
      </button>
      <button
        onClick={onShare}
        className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors"
        title="Share Contract"
      >
        <Share2 size={16} />
      </button>
    </div>
  );
}
