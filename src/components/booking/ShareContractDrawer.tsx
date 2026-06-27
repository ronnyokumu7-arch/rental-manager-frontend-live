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
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white shadow-xl h-full p-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Share Contract</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Send the contract link to <span className="font-semibold text-gray-900">{client.full_name}</span> via:
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onShare('email')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail size={20} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-xs text-gray-500">{client.email || 'No email provided'}</p>
            </div>
          </button>

          <button
            onClick={() => onShare('whatsapp')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <MessageCircle size={20} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">WhatsApp</p>
              <p className="text-xs text-gray-500">{client.phone || 'No phone provided'}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
