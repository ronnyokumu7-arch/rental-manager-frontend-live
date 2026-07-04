// src/components/bookings/ShareContractDrawer.tsx
"use client";

import { X, Mail, MessageCircle } from "lucide-react";
import type { Client } from "@/lib/types";

interface ShareContractDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onShare: (method: 'email' | 'whatsapp') => void;
}

export default function ShareContractDrawer({ isOpen, onClose, client, onShare }: ShareContractDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-surface-card shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-surface-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <h3 className="text-sm font-bold text-ink">Share Contract</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded transition-colors">
            <X size={18} className="text-ink-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-3">
          <p className="text-xs text-ink-muted mb-4">
            Send the contract to <span className="font-semibold text-ink">{client.full_name}</span> via:
          </p>
          
          <button
            onClick={() => onShare('email')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-surface-border hover:border-accent-dark hover:bg-accent-bg transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center group-hover:bg-accent-dark/10 transition-colors">
              <Mail size={16} className="text-accent-dark" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-ink">Email</p>
              <p className="text-xs text-ink-muted">{client.email || "No email on file"}</p>
            </div>
          </button>

          <button
            onClick={() => onShare('whatsapp')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-surface-border hover:border-success hover:bg-success-bg transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-success-bg flex items-center justify-center group-hover:bg-success/10 transition-colors">
              <MessageCircle size={16} className="text-success" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-ink">WhatsApp</p>
              <p className="text-xs text-ink-muted">{client.phone || "No phone on file"}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
