// src/components/profile/viewers/InlineBookingViewer.tsx
"use client";

import { Banknote } from "lucide-react";
import { useInlineBooking } from "@/hooks/profile/useInlineBooking";
import type { Booking, Task } from "@/lib/types";
import BookingHero from "./booking/BookingHero";
import BookingTripDetails from "./booking/BookingTripDetails";
import TaskContextBar from "../TaskContextBar";

interface InlineBookingViewerProps {
  booking: Booking;
  task?: Task;
  onRefresh: () => void;
}

export default function InlineBookingViewer({ booking, task, onRefresh }: InlineBookingViewerProps) {
  const {
    isEditing, setIsEditing, isSaving, isActionLoading,
    formData, setFormData,
    client, vehicle, contract,
    handleSave, handleAction,
    handleSendContract,
    handleSendInvoice,
  } = useInlineBooking(booking);

  const handleSaveWithRefresh = async () => { await handleSave(); onRefresh(); };
  const handleActionWithRefresh = async (action: "confirm" | "activate" | "complete" | "cancel" | "no_show") => { 
    await handleAction(action); 
    onRefresh(); 
  };
  
  const onSendContractWrapper = async () => {
    const url = await handleSendContract();
    if (url) await navigator.clipboard.writeText(url);
  };
  
  const onSendInvoiceWrapper = async () => {
    const url = await handleSendInvoice();
    if (url) await navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar relative bg-[var(--color-surface)]">
      
      {/* 1. HERO SECTION */}
      <BookingHero 
        booking={booking}
        client={client}
        vehicle={vehicle}
        contract={contract}
        isEditing={isEditing} 
        isSaving={isSaving} 
        isActionLoading={isActionLoading}
        onEdit={() => setIsEditing(true)} 
        onCancelEdit={() => setIsEditing(false)} 
        onSave={handleSaveWithRefresh}
        onAction={handleActionWithRefresh} 
        onSendInvoice={onSendInvoiceWrapper}
        onSendContract={onSendContractWrapper}
      />
      
      {/* 2. TASK CONTEXT BAR */}
      {task && <TaskContextBar task={task} />}
      
      {/* 3. TRIP DETAILS + CONTRACT TRACKER */}
      <div className="px-6 py-5">
        <BookingTripDetails 
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          contractStatus={contract?.status}
        />
      </div>
      
      {/* 4. TOTAL AMOUNT FOOTER - Premium Token Styling */}
      <div className="px-6 pb-6 mt-auto">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm">
              <Banknote size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-0.5">Total Amount</p>
              <p className="text-xl font-bold text-[var(--color-ink)] leading-tight">
                KES {Number(formData.total_amount).toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Optional: Add payment status badge here later */}
          {contract?.status === 'signed' && (
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
              Paid & Signed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
