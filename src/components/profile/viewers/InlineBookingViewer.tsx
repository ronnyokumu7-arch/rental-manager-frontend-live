// src/components/profile/viewers/InlineBookingViewer.tsx
"use client";

import { Banknote } from "lucide-react";
import { useInlineBooking } from "@/hooks/profile/useInlineBooking";
import type { Booking, Task } from "@/lib/types";
import BookingHero from "./booking/BookingHero";
import BookingTripDetails from "./booking/BookingTripDetails";
import TaskContextBar from "../TaskContextBar"; // ✅ ADD THIS IMPORT

interface InlineBookingViewerProps {
  booking: Booking;
  task?: Task; // ✅ ADD THIS PROP
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
  const handleActionWithRefresh = async (action: "confirm" | "activate" | "complete" | "cancel" | "no_show") => { await handleAction(action); onRefresh(); };
  
  const onSendContractWrapper = async () => {
    const url = await handleSendContract();
    if (url) await navigator.clipboard.writeText(url);
  };
  
  const onSendInvoiceWrapper = async () => {
    const url = await handleSendInvoice();
    if (url) await navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar relative">
      {/* 1. HERO */}
      <BookingHero 
        booking={booking}
        client={client}
        vehicle={vehicle}
        contract={contract}
        isEditing={isEditing} isSaving={isSaving} isActionLoading={isActionLoading}
        onEdit={() => setIsEditing(true)} onCancelEdit={() => setIsEditing(false)} onSave={handleSaveWithRefresh}
        onAction={handleActionWithRefresh} 
        onSendInvoice={onSendInvoiceWrapper}
        onSendContract={onSendContractWrapper}
      />
      
      {/* ✅ 2. TASK CONTEXT BAR - ADD THIS */}
      {task && <TaskContextBar task={task} />}
      
      {/* 3. TRIP DETAILS + CONTRACT TRACKER */}
      <BookingTripDetails 
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        contractStatus={contract?.status}
      />
      
      {/* 4. TOTAL AMOUNT FOOTER */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm">
              <Banknote size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Total Amount</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                KES {Number(formData.total_amount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
