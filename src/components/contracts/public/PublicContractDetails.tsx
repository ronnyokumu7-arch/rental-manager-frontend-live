// src/components/contracts/public/PublicContractDetails.tsx
"use client";

import { Calendar, Car, User, Banknote } from "lucide-react";
import type { PublicContractView } from "@/lib/types";

interface Props {
  contract: PublicContractView;
}

// Simple date formatter: "01, Jan, 2026"
const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, ", ");
};

export default function PublicContractDetails({ contract }: Props) {
  return (
    <div className="p-4 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        
        {/* Client Info */}
        <DetailSection
          title="Client Details"
          icon={<User size={18} className="text-slate-600" />}
          primary={contract.client_name}
          secondary="Renter"
        />

        {/* Vehicle Info */}
        <DetailSection
          title="Vehicle Details"
          icon={<Car size={18} className="text-slate-600" />}
          primary={`${contract.vehicle_make} ${contract.vehicle_model}`}
          secondary={`Plate: ${contract.vehicle_plate}`}
        />

        {/* Dates */}
        <DetailSection
          title="Rental Period"
          icon={<Calendar size={18} className="text-slate-600" />}
          primary={`${formatDate(contract.start_date)} to ${formatDate(contract.end_date)}`}
          secondary="Agreed rental duration"
        />

        {/* Financials */}
        <DetailSection
          title="Total Amount"
          icon={<Banknote size={18} className="text-slate-600" />}
          primary={`${contract.currency_code} ${Number(contract.total_amount).toLocaleString()}`}
          secondary="Total contract value"
        />
      </div>
    </div>
  );
}

// Reusable detail card
function DetailSection({ 
  title, 
  icon, 
  primary, 
  secondary 
}: { 
  title: string; 
  icon: React.ReactNode; 
  primary: string; 
  secondary: string;
}) {
  return (
    <div className="space-y-2 sm:space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-100 rounded-lg shrink-0">{icon}</div>
        <div>
          <p className="text-sm font-bold text-slate-900">{primary}</p>
          <p className="text-xs text-slate-500">{secondary}</p>
        </div>
      </div>
    </div>
  );
}
