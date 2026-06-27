"use client";

import { useState } from "react";
import { MapPin, Edit2, Save, X } from "lucide-react";
import type { Booking } from "@/lib/types";

interface TripLogisticsSectionProps {
  booking: Booking;
  isEditable: boolean;
  onSaveTripChanges: (dates: { start: string; end: string }, destination: string) => void;
}

const LOCAL_SUGGESTIONS = [
  "Nairobi CBD", "Jomo Kenyatta International Airport (JKIA)", "Westlands", "Karen", "Kilimani",
  "Mombasa", "Nyali", "Diani Beach", "Kisumu", "Eldoret", "Naivasha", "Nakuru", "Malindi"
];

export default function TripLogisticsSection({ booking, isEditable, onSaveTripChanges }: TripLogisticsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tripDates, setTripDates] = useState({
    start: booking.start_date.split("T")[0],
    end: booking.end_date.split("T")[0],
  });
  const [destination, setDestination] = useState(booking.destination || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = LOCAL_SUGGESTIONS.filter((loc) =>
    destination && loc.toLowerCase().includes(destination.toLowerCase())
  );

  const handleSave = () => {
    onSaveTripChanges(tripDates, destination);
    setIsEditing(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  if (isEditing) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-amber-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Trip Logistics (Edit Mode)</h3>
          </div>
          <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide flex items-center gap-1">
            <X size={12} /> Cancel
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Pickup Date</label>
              <input type="date" value={tripDates.start} onChange={(e) => setTripDates({ ...tripDates, start: e.target.value })} className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Return Date</label>
              <input type="date" value={tripDates.end} onChange={(e) => setTripDates({ ...tripDates, end: e.target.value })} min={tripDates.start} className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
          </div>
          <div className="relative">
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Destination / Area of Use</label>
            <input type="text" value={destination} onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder="Start typing a location..." className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredSuggestions.map((loc, i) => (
                  <div key={i} onClick={() => { setDestination(loc); setShowSuggestions(false); }} className="p-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-gray-700">
                    <MapPin size={12} className="text-gray-400" /> {loc}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Trip Logistics</h3>
        </div>
        {isEditable && (
          <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide flex items-center gap-1">
            <Edit2 size={12} /> Edit Trip
          </button>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-[10px] flex-shrink-0">START</div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">Pickup Date</p>
            <p className="text-sm font-bold text-gray-900">{formatDate(booking.start_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-[10px] flex-shrink-0">END</div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">Return Date</p>
            <p className="text-sm font-bold text-gray-900">{formatDate(booking.end_date)}</p>
          </div>
        </div>
        {booking.destination && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2">
            <MapPin size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-blue-700 font-bold">Destination</p>
              <p className="text-sm font-medium text-gray-900">{booking.destination}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
