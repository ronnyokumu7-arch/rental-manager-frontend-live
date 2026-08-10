// src/app/dashboard/fleet/[id]/page.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useVehicleProfile } from "@/hooks/fleet/useVehicleProfile";
import VehicleHeader from "@/components/fleet/VehicleHeader";
import VehicleSpecsCard from "@/components/fleet/VehicleSpecsCard";
import VehicleDocumentsCard from "@/components/fleet/VehicleDocumentsCard";

export default function VehicleProfilePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = Number(params?.id);

  const {
    vehicle,
    loading,
    isEditing,
    setIsEditing,
    actionLoading,
    handleUpdate,
    handleStatusAction,
  } = useVehicleProfile(vehicleId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-xs sm:text-sm font-medium text-[var(--color-ink-muted)] animate-pulse">
          Loading vehicle profile...
        </p>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="space-y-4 sm:space-y-6 px-3.5 sm:px-6 pb-12 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-4 pt-2">
        <button
          type="button"
          onClick={() => router.push("/dashboard/fleet")}
          className="p-2 sm:p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all active:scale-95 flex-shrink-0"
          title="Back to Fleet"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--color-ink-muted)] truncate">
          <span>Fleet</span>
          <span>/</span>
          <span className="text-[var(--color-ink)] font-semibold truncate">
            {vehicle.plate_number}
          </span>
        </div>
      </div>

      {/* 1. Header: Identity & Actions */}
      <VehicleHeader 
        vehicle={vehicle} 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
        actionLoading={actionLoading} 
        onAction={handleStatusAction} 
      />

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left: Telemetry & Specs */}
        <div className="lg:col-span-7">
          <VehicleSpecsCard 
            vehicle={vehicle} 
            isEditing={isEditing} 
            onSave={handleUpdate} 
            onCancel={() => setIsEditing(false)} 
            actionLoading={actionLoading} 
          />
        </div>

        {/* Right: Compliance Documents (Sticky on desktop) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <VehicleDocumentsCard vehicle={vehicle} />
          </div>
        </div>
      </div>
    </div>
  );
}
