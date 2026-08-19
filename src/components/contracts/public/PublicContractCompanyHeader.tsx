// src/components/contracts/public/PublicContractCompanyHeader.tsx
"use client";

import { FileText } from "lucide-react";
import type { TenantProfile } from "@/lib/types";

interface Props {
  tenant: TenantProfile;
  bookingNumber: string;
}

export default function PublicContractCompanyHeader({ tenant, bookingNumber }: Props) {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        
        {/* Company Details - Left Aligned */}
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          {tenant.logo_url ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0">
              <img 
                src={tenant.logo_url} 
                alt={`${tenant.company_name} Logo`}
                className="w-full h-full object-contain p-2"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <FileText size={28} className="text-blue-600" />
            </div>
          )}

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {tenant.company_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Vehicle Rental Agreement</p>
            
            {/* Company Details Grid */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              {tenant.business_location && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">📍</span>
                  {tenant.business_location}
                </span>
              )}
              {tenant.phone && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">📞</span>
                  {tenant.phone}
                </span>
              )}
              {tenant.email && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">✉️</span>
                  {tenant.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Booking Reference - Right Side */}
        <div className="sm:text-right shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wide border border-slate-200">
            <FileText size={14} />
            {bookingNumber}
          </div>
        </div>
      </div>
    </div>
  );
}
