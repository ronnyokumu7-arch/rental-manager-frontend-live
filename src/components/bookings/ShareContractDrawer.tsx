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

export default function ShareContractDrawer({ 
  isOpen, 
  onClose, 
  client, 
  onShare 
}: ShareContractDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Premium Backdrop with Focus Isolation */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-[var(--color-surface)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[var(--color-surface-border)]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-surface-border)]">
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Share Contract</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-3">
          <p className="text-xs text-[var(--color-ink-muted)] mb-4 leading-relaxed">
            Send the contract to <span className="font-semibold text-[var(--color-ink)]">{client.full_name}</span> via:
          </p>
          
          {/* Email Option */}
          <button
            onClick={() => onShare('email')}
            disabled={!client.email}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors shrink-0">
              <Mail size={18} className="text-[var(--color-primary)]" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--color-ink)]">Email</p>
              <p className="text-xs text-[var(--color-ink-muted)] truncate">
                {client.email || "No email on file"}
              </p>
            </div>
          </button>

          {/* WhatsApp Option */}
          <button
            onClick={() => onShare('whatsapp')}
            disabled={!client.phone}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--color-surface-border)] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors shrink-0">
              <MessageCircle size={18} className="text-emerald-500" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--color-ink)]">WhatsApp</p>
              <p className="text-xs text-[var(--color-ink-muted)] truncate">
                {client.phone || "No phone on file"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
