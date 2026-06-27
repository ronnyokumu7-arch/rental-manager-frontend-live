"use client";

import { Phone, MapPin, Car, Banknote, TrendingUp } from "lucide-react";
import type { Booking, Client, Vehicle } from "@/lib/types";

interface BookingManifestCardsProps {
  booking: Booking;
  client: Client;
  vehicle: Vehicle;
  duration: number;
  isEditable: boolean;
  onChangeClient: () => void;
  onChangeVehicle: () => void;
}

export default function BookingManifestCards({
  booking,
  client,
  vehicle,
  duration,
  isEditable,
  onChangeClient,
  onChangeVehicle,
}: BookingManifestCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Client Card */}
      <div className="bg-white border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow rounded-lg">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {client.full_name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{client.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{client.email || "No email provided"}</p>
            </div>
          </div>
          {isEditable && (
            <button onClick={onChangeClient} className="text-[10px] text-blue-600 font-semibold hover:underline">
              Change
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:${client.phone}`} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors text-xs font-medium truncate">
            <Phone size={12} className="flex-shrink-0" />
            <span className="truncate">{client.phone}</span>
          </a>
          {client.residential_address && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium truncate" title={client.residential_address}>
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{client.residential_address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Card */}
      <div className="bg-white border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow rounded-lg">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Car size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{vehicle.make} {vehicle.model}</p>
              <p className="text-xs text-gray-500 truncate">{vehicle.plate_number} • {vehicle.year}</p>
            </div>
          </div>
          {isEditable && (
            <button onClick={onChangeVehicle} className="text-[10px] text-blue-600 font-semibold hover:underline">
              Change
            </button>
          )}
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/50 border border-purple-100">
          <span className="text-[10px] font-bold text-purple-700 uppercase">Daily Rate</span>
          <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <Banknote size={12} className="text-purple-600" />
            {Number(vehicle.daily_rate).toLocaleString()} KES
          </span>
        </div>
      </div>

      {/* Financials Card */}
      <div className="bg-white border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow rounded-lg">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold">Total Value</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(booking.total_amount)}</p>
            </div>
          </div>
          {isEditable && <button className="text-[10px] text-blue-600 font-semibold hover:underline">Adjust</button>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] uppercase text-gray-500 font-bold">Duration</p>
            <p className="text-xs font-bold text-gray-900">{duration} Days</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] uppercase text-gray-500 font-bold">Balance</p>
            <p className="text-xs font-bold text-gray-900">{formatCurrency(booking.total_amount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
