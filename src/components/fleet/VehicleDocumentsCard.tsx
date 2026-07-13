// src/components/fleet/VehicleDocumentsCard.tsx
"use client";

import { FileText, Upload, Eye, Loader2 } from "lucide-react";
import type { Vehicle } from "@/lib/types";

interface VehicleDocumentsCardProps {
  vehicle: Vehicle;
}

function DocTile({ title, url }: { title: string; url: string | null }) {
  return (
    <div className="group relative rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 overflow-hidden aspect-[4/3] flex flex-col hover:border-[var(--color-primary)]/30 transition-all">
      {url ? (
        <div className="flex-1 flex items-center justify-center bg-[var(--color-surface)] p-4">
          <FileText size={40} className="text-[var(--color-ink-subtle)] opacity-50" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-ink-subtle)] p-4">
          <FileText size={32} className="mb-2 opacity-30" />
          <span className="text-[10px] font-bold uppercase tracking-wider">No Document</span>
        </div>
      )}
      
      {/* Hover Actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
        {url && (
          <button className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors" title="View">
            <Eye size={18} />
          </button>
        )}
        <button className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors" title="Upload New">
          <Upload size={18} />
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
        <p className="text-[10px] font-bold text-white uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );
}

export default function VehicleDocumentsCard({ vehicle }: VehicleDocumentsCardProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2 mb-6">
        <FileText size={16} className="text-[var(--color-primary)]" /> Compliance Documents
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DocTile title="Insurance Certificate" url={vehicle.insurance_doc} />
        <DocTile title="Registration Book" url={vehicle.registration_doc} />
        <DocTile title="Inspection Report" url={vehicle.inspection_doc} />
      </div>
    </div>
  );
}
