// src/components/contracts/public/PublicContractCompanyHeader.tsx
"use client";

import { FileText, MapPin, Phone, Mail } from "lucide-react";
import type { TenantProfile } from "@/lib/types";

interface Props {
  tenant: TenantProfile;
  // Kept so the parent page compiles without changes (no longer rendered)
  bookingNumber: string;
}

export default function PublicContractCompanyHeader({ tenant }: Props) {
  return (
    <div className="mb-8 sm:mb-12">
      {/* ✅ Badge removed — company info gets full width on all screens */}
      <div className="flex items-start gap-3 sm:gap-4">
        
        {/* Company Logo */}
        {tenant.logo_url ? (
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0">
            <img 
              src={tenant.logo_url} 
              alt={`${tenant.company_name} Logo`}
              className="w-full h-full object-contain p-2"
            />
          </div>
        ) : (
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <FileText size={28} className="text-blue-600" />
          </div>
        )}

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            {tenant.company_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Vehicle Rental Agreement</p>
          
          {/* Premium lucide icons */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
            {tenant.business_location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-slate-400 shrink-0" />
                {tenant.business_location}
              </span>
            )}
            {tenant.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="text-slate-400 shrink-0" />
                {tenant.phone}
              </span>
            )}
            {tenant.email && (
              <span className="flex items-center gap-1.5 min-w-0">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{tenant.email}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
