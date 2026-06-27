"use client";
import { CheckCircle2, PlayCircle, X, Gauge, CalendarCheck } from "lucide-react";
import FloatingActionBar from "@/components/ui/FloatingActionBar";

interface BookingActionBarProps {
  status: string;
  isEditable: boolean;
  isActionLoading: boolean;
  isTripEnded: boolean; // New prop to track the intermediate state
  onConfirm: () => void;
  onStartTrip: () => void;
  onEndTrip: () => void; // New handler
  onUpdateMileage: () => void; // New handler
  onCancel: () => void;
}

export default function BookingActionBar({
  status,
  isEditable,
  isActionLoading,
  isTripEnded,
  onConfirm,
  onStartTrip,
  onEndTrip,
  onUpdateMileage,
  onCancel,
}: BookingActionBarProps) {
  if (isEditable || status === "completed" || status === "cancelled" || status === "no_show") {
    return null;
  }

  return (
    <FloatingActionBar>
      {status === "pending" && (
        <>
          <button onClick={onConfirm} disabled={isActionLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50">
            <CheckCircle2 size={14} /> {isActionLoading ? "Processing..." : "Confirm"}
          </button>
          <button onClick={onCancel} disabled={isActionLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
            <X size={14} /> Cancel
          </button>
        </>
      )}

      {status === "confirmed" && (
        <>
          <button onClick={onStartTrip} disabled={isActionLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all disabled:opacity-50">
            <PlayCircle size={14} /> {isActionLoading ? "Processing..." : "Start Trip"}
          </button>
          <button onClick={onCancel} disabled={isActionLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
            <X size={14} /> Cancel
          </button>
        </>
      )}

      {status === "active" && (
        <>
          {/* LOGIC: If trip isn't ended yet, show "End Trip". If it is ended, show "Update Mileage" */}
          {!isTripEnded ? (
            <button onClick={onEndTrip} disabled={isActionLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all disabled:opacity-50">
              <CalendarCheck size={14} /> {isActionLoading ? "Processing..." : "End Trip"}
            </button>
          ) : (
            <button onClick={onUpdateMileage} disabled={isActionLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50">
              <Gauge size={14} /> {isActionLoading ? "Processing..." : "Update Mileage"}
            </button>
          )}
          
          <button onClick={onCancel} disabled={isActionLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50">
            <X size={14} /> Cancel
          </button>
        </>
      )}
    </FloatingActionBar>
  );
}
