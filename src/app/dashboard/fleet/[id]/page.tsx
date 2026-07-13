// src/app/dashboard/fleet/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useVehicleProfile } from "@/hooks/fleet/useVehicleProfile";
import VehicleHeader from "@/components/fleet/VehicleHeader";
import VehicleSpecsCard from "@/components/fleet/VehicleSpecsCard";
import VehicleDocumentsCard from "@/components/fleet/VehicleDocumentsCard";

export default function VehicleProfilePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = Number(params.id);

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm font-medium text-[var(--color-ink-muted)] animate-pulse">Loading vehicle profile...</p>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-4 px-2 pt-2">
        <button
          onClick={() => router.push("/dashboard/fleet")}
          className="p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all active:scale-95"
          title="Back to Fleet"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-medium text-[var(--color-ink-muted)]">Fleet / {vehicle.plate_number}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Telemetry & Specs (Takes more space for forms/tables) */}
        <div className="lg:col-span-7">
          <VehicleSpecsCard 
            vehicle={vehicle} 
            isEditing={isEditing} 
            onSave={handleUpdate} 
            actionLoading={actionLoading} 
          />
        </div>

        {/* Right: Compliance Documents (Sticky on desktop) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <VehicleDocumentsCard vehicle={vehicle} />
          </div>
        </div>
      </div>

    </div>
  );
}
