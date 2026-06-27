// src/components/client-profile/ClientInfoPanel.tsx
"use client";
import { useState } from "react";
import {
  MapPin, Home, Briefcase, FileText, Upload, X,
  ExternalLink, Copy, Check
} from "lucide-react";
import type { Client } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";

interface ClientInfoPanelProps {
  client: Client;
}

export default function ClientInfoPanel({ client }: ClientInfoPanelProps) {
  const [addressTab, setAddressTab] = useState<"home" | "work">("home");
  const [copied, setCopied] = useState(false);

  const activeAddress = addressTab === "home" ? client.residential_address : client.work_address;

  const handleCopyAddress = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Address Section - Tighter padding, no inner container */}
      <SectionCard className="!p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wide flex items-center gap-2">
            <MapPin size={14} className="text-accent-dark" />
            Location Details
          </h3>
          
          {/* Premium Segmented Toggle */}
          <div className="inline-flex p-0.5 rounded-lg bg-surface-hover border border-surface-border">
            <button
              onClick={() => setAddressTab("home")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all duration-200 ${
                addressTab === "home"
                  ? "bg-surface-card text-ink shadow-sm border border-surface-border"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Home size={11} /> Home
            </button>
            <button
              onClick={() => setAddressTab("work")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all duration-200 ${
                addressTab === "work"
                  ? "bg-surface-card text-ink shadow-sm border border-surface-border"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Briefcase size={11} /> Work
            </button>
          </div>
        </div>

        {/* Active Address Text & Actions - Plain text, no container */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">
              {addressTab === "home" ? "Residential Address" : "Work Address"}
            </p>
            <p className={`text-sm font-medium break-words leading-relaxed ${activeAddress ? "text-ink" : "text-ink-subtle italic"}`}>
              {activeAddress || "No address provided"}
            </p>
          </div>
          {activeAddress && (
            <button
              onClick={handleCopyAddress}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
              title="Copy address"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        {/* Unified Map Display */}
        <div className="relative h-40 rounded-xl bg-surface border border-surface-border overflow-hidden group">
          <div 
            className="absolute inset-0 opacity-[0.04]" 
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"1\" fill-rule=\"evenodd\"%3E%3Cpath d=\"M0 40L40 0H20L0 20M40 40V20L20 40\"/%3E%3C/g%3E%3C/svg%3E')" }} 
          />

          {activeAddress ? (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-accent-bg/30 flex items-center justify-center animate-pulse-soft">
                  <div className="w-8 h-8 rounded-full bg-accent-dark flex items-center justify-center shadow-lg">
                    <MapPin size={16} className="text-white" />
                  </div>
                </div>
                <div className="w-4 h-1.5 bg-black/10 rounded-full mt-1 blur-[2px]" />
              </div>

              <div className="absolute bottom-3 right-3 flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-surface-card/90 backdrop-blur-md border border-surface-border text-[10px] font-medium text-ink hover:bg-surface-hover transition-colors flex items-center gap-1.5 shadow-sm">
                  <ExternalLink size={12} /> Open in Maps
                </button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-subtle">
              <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mb-3">
                <MapPin size={20} className="opacity-40" />
              </div>
              <p className="text-xs font-medium">No address provided for this location</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Attachments Section */}
      <SectionCard className="!p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wide flex items-center gap-2">
            <FileText size={14} className="text-accent-dark" />
            Documents
          </h3>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-bg text-accent-dark text-[10px] font-semibold hover:bg-accent-bg/80 transition-colors border border-accent/10">
            <Upload size={12} />
            Upload
          </button>
        </div>
        
        {/* File List - Grid layout */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 1, name: "ID_Front.jpg", type: "image", url: client.id_image_front },
            { id: 2, name: "DL_Front.pdf", type: "document", url: client.dl_image_front },
          ].filter(f => f.url).map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-surface-border hover:border-accent/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-bg flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-accent-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink truncate">{file.name}</p>
                <p className="text-[10px] text-ink-subtle capitalize">{file.type}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-6 h-6 rounded-md flex items-center justify-center text-ink-muted hover:bg-danger-bg hover:text-danger-text transition-colors">
                  <X size={11} />
                </button>
              </div>
            </div>
          ))}
          
          {!client.id_image_front && !client.dl_image_front && (
            <div className="col-span-2 text-center py-6 border-2 border-dashed border-surface-border rounded-xl">
              <FileText size={24} className="mx-auto text-ink-subtle mb-1.5 opacity-50" />
              <p className="text-xs text-ink-muted">No documents uploaded</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
