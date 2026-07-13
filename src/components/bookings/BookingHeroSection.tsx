// src/components/bookings/BookingHeroSection.tsx
"use client";

import { FileText, CheckCircle2, Car, Flag } from "lucide-react";
import type { Booking, Contract } from "@/lib/types";

interface BookingHeroSectionProps {
  booking: Booking;
  contract: Contract | null;
}

export default function BookingHeroSection({ booking, contract }: BookingHeroSectionProps) {
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
      if (currentStatus === "pending" && hasShareToken) return "waiting"; // Amber: waiting for client
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
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between relative">
        
        {/* Background Connecting Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-[var(--color-surface-border)] -z-0 mx-12" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-emerald-500 -z-0 mx-12 transition-all duration-700 ease-out shadow-[0_0_8px_-2px_rgba(16,185,129,0.5)]" 
          style={{ 
            width: currentStatus === "pending" ? "0%" : 
                   currentStatus === "confirmed" ? "33.33%" : 
                   currentStatus === "active" ? "66.66%" : "100%" 
          }} 
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const state = getStepState(step.id);
          const Icon = step.icon;
          
          let nodeClass = "bg-[var(--color-surface-hover)] text-[var(--color-ink-subtle)] border-[var(--color-surface-border)]";
          let labelClass = "text-[var(--color-ink-subtle)]";
          
          if (state === "completed") {
            nodeClass = "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20";
            labelClass = "text-emerald-600 dark:text-emerald-400";
          } else if (state === "current") {
            nodeClass = "bg-[var(--color-primary)] text-white border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20 shadow-sm shadow-[var(--color-primary)]/20";
            labelClass = "text-[var(--color-ink)]";
          } else if (state === "waiting") {
            nodeClass = "bg-amber-500 text-white border-amber-500 ring-4 ring-amber-500/20 shadow-sm shadow-amber-500/20";
            labelClass = "text-amber-600 dark:text-amber-400";
          }

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative z-10 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${nodeClass}`}>
                {state === "completed" ? <CheckCircle2 size={22} /> : <Icon size={20} />}
              </div>
              
              <p className={`text-[10px] font-bold mt-3 uppercase tracking-wider transition-colors duration-300 ${labelClass}`}>
                {step.label}
              </p>
              
              {state === "waiting" && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider mt-1.5 animate-pulse">
                  Awaiting Client
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
