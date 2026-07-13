// src/app/dashboard/bookings/[id]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft, Loader2, FileText, CheckCircle2, Car, Flag } from "lucide-react";
import { useBookingProfile } from "@/hooks/bookings/useBookingProfile";
import toast from "react-hot-toast";

// ✅ Import the modular components
import BookingManifestCards from "@/components/bookings/BookingManifestCards";
import TripLogisticsSection from "@/components/bookings/TripLogisticsSection";
import ContractLifecycleSection from "@/components/bookings/ContractLifecycleSection";
import BookingActionBar from "@/components/bookings/BookingActionBar";
import BookingModals from "@/components/bookings/BookingModals";
import ShareContractDrawer from "@/components/bookings/ShareContractDrawer";

export default function BookingProfilePage() {
  const logic = useBookingProfile();
  const { booking, client, vehicle, contract, loading } = logic;
  const router = useRouter();

  // ✅ PREMIUM LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm font-medium text-[var(--color-ink-muted)] animate-pulse">
          Loading Booking Command Center...
        </p>
      </div>
    );
  }

  // ✅ PREMIUM EMPTY STATE
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Booking Not Found</h2>
        <button 
          onClick={() => router.push("/dashboard/bookings")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all active:scale-95"
        >
          <ArrowLeft size={14} /> Back to Bookings
        </button>
      </div>
    );
  }

  // ✅ INLINE HERO LOGIC (Extracted from BookingHeroSection)
  const currentStatus = booking.status;
  const hasShareToken = !!contract?.share_token;

  const getStepState = (stepId: string) => {
    if (stepId === "pending") {
      if (["confirmed", "active", "completed"].includes(currentStatus)) return "completed";
      if (currentStatus === "pending") return "current";
      return "future";
    }
    if (stepId === "confirmed") {
      if (["active", "completed"].includes(currentStatus)) return "completed";
      if (currentStatus === "confirmed") return "current";
      if (currentStatus === "pending" && hasShareToken) return "waiting";
      return "future";
    }
    if (stepId === "active") {
      if (currentStatus === "completed") return "completed";
      if (currentStatus === "active") return "current";
      return "future";
    }
    if (stepId === "completed") {
      if (currentStatus === "completed") return "completed";
      return "future";
    }
    return "future";
  };

  const steps = [
    { id: "pending", label: "Quoted", icon: FileText },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "active", label: "In Progress", icon: Car },
    { id: "completed", label: "Completed", icon: Flag },
  ];

  return (
    <div className="space-y-6 pb-32 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* 1. PREMIUM PAGE HEADER WITH INTEGRATED TRACKING NODES */}
      <div className="px-2 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
          
          {/* Left: Back Button + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/bookings")}
              className="p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all active:scale-95"
              title="Back to Bookings"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                  Booking {booking.booking_number}
                </h1>
              </div>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {client ? `Managed for ${client.full_name}` : "Loading client details..."}
              </p>
            </div>
          </div>

          {/* Right: Floating Tracking Nodes (No Container) */}
          <div className="flex items-center justify-between lg:justify-end gap-1 lg:gap-2 flex-1 lg:flex-none">
            {steps.map((step, index) => {
              const state = getStepState(step.id);
              const Icon = step.icon;
              
              let nodeClass = "bg-[var(--color-surface-hover)] text-[var(--color-ink-subtle)] border-[var(--color-surface-border)]";
              let labelClass = "text-[var(--color-ink-subtle)]";
              
              if (state === "completed") {
                nodeClass = "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_12px_-3px_rgba(16,185,129,0.4)]";
                labelClass = "text-emerald-400";
              } else if (state === "current") {
                nodeClass = "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[0_0_12px_-3px_rgba(99,102,241,0.4)] ring-2 ring-[var(--color-primary)]/30";
                labelClass = "text-[var(--color-primary)]";
              } else if (state === "waiting") {
                nodeClass = "bg-amber-500 text-white border-amber-500 shadow-[0_0_12px_-3px_rgba(245,158,11,0.4)] ring-2 ring-amber-500/30";
                labelClass = "text-amber-400";
              }

              return (
                <div key={step.id} className="flex items-center gap-1 lg:gap-2 group">
                  {/* Connector Line (except first) */}
                  {index > 0 && (
                    <div className={`w-8 lg:w-12 h-0.5 transition-all duration-500 ${
                      state === "completed" || (index > 0 && getStepState(steps[index - 1].id) === "completed")
                        ? "bg-emerald-500 shadow-[0_0_8px_-2px_rgba(16,185,129,0.5)]" 
                        : "bg-[var(--color-surface-border)]"
                    }`} />
                  )}
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg border flex items-center justify-center transition-all duration-300 ${nodeClass}`}>
                      {state === "completed" ? <CheckCircle2 size={14} className="lg:w-5 lg:h-5" /> : <Icon size={14} className="lg:w-5 lg:h-5" />}
                    </div>
                    <span className={`text-[9px] font-bold mt-1.5 uppercase tracking-wider hidden lg:block ${labelClass}`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. MANIFEST CARDS */}
      <BookingManifestCards
        booking={booking}
        client={client}
        vehicle={vehicle}
        isEditable={booking.status === "pending" || booking.status === "confirmed"}
        onChangeClient={() => logic.setShowClientModal(true)}
        onChangeVehicle={() => logic.setShowVehicleModal(true)}
      />

      {/* 3. MAIN CONTENT GRID: Asymmetric for better focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Trip Logistics (Takes up more space for forms/tables) */}
        <div className="lg:col-span-7 space-y-6">
          <TripLogisticsSection
            booking={booking}
            isEditable={booking.status !== "completed" && booking.status !== "cancelled"}
            tripDates={logic.tripDates}
            setTripDates={logic.setTripDates}
            destination={logic.destination}
            setDestination={logic.setDestination}
            onSave={logic.handleSaveTripChanges}
            isSaving={logic.isActionLoading}
          />
        </div>

        {/* RIGHT: Contract Lifecycle & Financials (Sticky sidebar feel) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6">
            <ContractLifecycleSection
              contract={contract}
              onCopyLink={logic.handleCopyContractLink}
              onShare={() => logic.setShowContractDrawer(true)}
            />
          </div>
        </div>
      </div>

      {/* 4. STICKY GLASSMORPHIC ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/80 backdrop-blur-md border-t border-[var(--color-surface-border)] shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <BookingActionBar
            status={booking.status}
            isActionLoading={logic.isActionLoading}
            isTripEnded={logic.isTripEnded}
            onConfirm={() => logic.setConfirmAction("confirm")}
            onActivate={() => logic.setConfirmAction("activate")}
            onCancel={() => logic.setConfirmAction("cancel")}
            onShareInvoice={() => logic.setShowShareModal(true)}
            onStageEndTrip={logic.handleStageEndTrip}
            onOpenMileageModal={logic.handleOpenMileageModal}
            onGenerateQuotation={logic.handleGenerateQuotation}
          />
        </div>
      </div>

      {/* 5. MODALS & DRAWERS */}
      <BookingModals
        booking={booking}
        client={client!}
        showClientModal={logic.showClientModal}
        showVehicleModal={logic.showVehicleModal}
        availableClients={logic.availableClients}
        availableVehicles={logic.availableVehicles}
        onChangeClient={logic.handleChangeClient}
        onChangeVehicle={logic.handleChangeVehicle}
        onCloseClientModal={() => logic.setShowClientModal(false)}
        onCloseVehicleModal={() => logic.setShowVehicleModal(false)}
        showShareModal={logic.showShareModal}
        shareMethod={logic.shareMethod}
        onSetShareMethod={logic.setShareMethod}
        onSendInvoice={logic.handleSendInvoice}
        onCloseShareModal={() => logic.setShowShareModal(false)}
        showConfirmDialog={!!logic.confirmAction}
        confirmAction={logic.confirmAction}
        onConfirmAction={logic.handleStatusTransition}
        onCloseConfirm={() => logic.setConfirmAction(null)}
        isActionLoading={logic.isActionLoading}
        showMileageModal={logic.showMileageModal}
        finalMileage={logic.finalMileage}
        setFinalMileage={logic.setFinalMileage}
        currentVehicleMileage={vehicle?.current_mileage || 0}
        onSaveFinalMileage={logic.handleSaveFinalMileage}
        onCloseMileageModal={() => logic.setShowMileageModal(false)}
        showQuotationModal={logic.showQuotationModal}
        quotationUrl={logic.quotationUrl}
        onCopyQuotationLink={logic.handleCopyQuotationLink}
        onCloseQuotationModal={() => logic.setShowQuotationModal(false)}
      />

      {client && (
        <ShareContractDrawer
          isOpen={logic.showContractDrawer}
          onClose={() => logic.setShowContractDrawer(false)}
          client={client}
          onShare={(method) => {
            toast.success(`Contract sent via ${method}`);
            logic.setShowContractDrawer(false);
          }}
        />
      )}
    </div>
  );
}
