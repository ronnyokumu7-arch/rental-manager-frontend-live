"use client";

import { Calendar, Banknote, Clock, TrendingUp, CheckCircle2, PlayCircle, FileText, X, Download, Share2, Eye, Copy } from "lucide-react";
import type { Booking, Invoice, Vehicle } from "@/lib/types";
import Badge from "@/components/ui/Badge";

interface BookingHeroSectionProps {
  booking: Booking;
  vehicle?: Vehicle;
  duration: number;
  invoice?: Invoice | null;
  onConfirm?: () => void;
  onStartTrip?: () => void;
  onCompleteTrip?: (odometer: number) => void;
  onCancel?: () => void;
  onViewInvoice?: () => void;
  onDownloadInvoice?: () => void;
  onShareInvoice?: () => void;
}

export default function BookingHeroSection({
  booking,
  vehicle, // ✅ Add this line
  duration,
  invoice,
  onConfirm,
  onStartTrip,
  onCompleteTrip,
  onCancel,
  onViewInvoice,
  onDownloadInvoice,
  onShareInvoice,
}: BookingHeroSectionProps) {
  const formatKES = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

  const getTheme = () => {
    switch(booking.status) {
      case "active": return "from-emerald-500 to-teal-600";
      case "confirmed": return "from-blue-500 to-indigo-600";
      case "pending": return "from-amber-500 to-orange-600";
      case "completed": return "from-slate-600 to-slate-800";
      default: return "from-rose-500 to-red-600";
    }
  };

  const lifecycleSteps = [
    { id: "pending", label: "Pending", icon: Clock },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "active", label: "In Progress", icon: PlayCircle },
    { id: "completed", label: "Completed", icon: CheckCircle2 },
  ];

  const currentStepIndex = lifecycleSteps.findIndex(step => step.id === booking.status);

  return (
    <div className={`bg-gradient-to-r ${getTheme()} text-white shadow-lg`}>
      <div className="p-6">
        {/* Top Row: Booking Info + Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
              <Calendar size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">Booking #{booking.id}</h1>
                <Badge 
                  variant={booking.status === "active" ? "success" : booking.status === "pending" ? "warning" : "accent"} 
                  className="bg-white/20 text-white border-white/30"
                >
                  {booking.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-white/80 flex items-center gap-2">
                <span>Created {new Date(booking.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{duration} Days Duration</span>
              </p>
            </div>
          </div>

          {/* Premium Stats Cards */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
              <Banknote size={18} className="text-white mb-1" />
              <p className="text-[10px] uppercase text-white/80 font-semibold tracking-wide">Total Amount</p>
              <p className="text-lg font-bold text-white">{formatKES(booking.total_amount)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
              <Clock size={18} className="text-white mb-1" />
              <p className="text-[10px] uppercase text-white/80 font-semibold tracking-wide">Duration</p>
              <p className="text-lg font-bold text-white">{duration} <span className="text-xs font-normal text-white/70">days</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
              <TrendingUp size={18} className="text-white mb-1" />
              <p className="text-[10px] uppercase text-white/80 font-semibold tracking-wide">Daily Rate</p>
              <p className="text-lg font-bold text-white">{formatKES(booking.total_amount / duration)}</p>
            </div>
          </div>
        </div>

        {/* Lifecycle Progress Tracker */}
        <div className="mb-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            {lifecycleSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? "bg-white text-emerald-600 border-white" :
                      isCurrent ? "bg-white/20 text-white border-white backdrop-blur-sm" :
                      "bg-white/10 text-white/40 border-white/20"
                    }`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={18} />}
                    </div>
                    <p className={`text-[10px] font-semibold mt-2 uppercase tracking-wide ${
                      isCompleted || isCurrent ? "text-white" : "text-white/40"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < lifecycleSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? "bg-white" : "bg-white/20"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-white/20">
          {booking.status === "pending" && (
            <>
              <button onClick={onConfirm} className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
                <CheckCircle2 size={16} /> Confirm Booking
              </button>
              <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors">
                <X size={16} /> Cancel
              </button>
            </>
          )}

          {booking.status === "confirmed" && (
            <>
              <button onClick={onStartTrip} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
                <PlayCircle size={16} /> Start Trip
              </button>
              <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors">
                <X size={16} /> Cancel
              </button>
            </>
          )}

          {booking.status === "active" && (
            <button onClick={() => onCompleteTrip?.(vehicle?.current_mileage || 0)} className="flex items-center gap-2 px-4 py-2 bg-white text-amber-700 hover:bg-amber-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
              <CheckCircle2 size={16} /> Complete Trip
            </button>
          )}

          {booking.status === "completed" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-medium">
              <CheckCircle2 size={16} className="text-emerald-300" />
              <span className="text-white/90">Trip Completed</span>
            </div>
          )}

          {/* Invoice Actions */}
          {invoice && (
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={onViewInvoice} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors" title="View Invoice">
                <Eye size={16} />
              </button>
              <button onClick={onDownloadInvoice} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors" title="Download Invoice">
                <Download size={16} />
              </button>
              <button onClick={onShareInvoice} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors" title="Share Invoice">
                <Share2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
