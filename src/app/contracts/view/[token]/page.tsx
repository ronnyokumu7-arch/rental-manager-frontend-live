// src/app/contracts/view/[token]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { FileText, CheckCircle2, Download } from "lucide-react"; // ✅ Added FileText, CheckCircle2, Download

// Import hook and components
import { usePublicContract } from "@/components/contracts/public/hooks/usePublicContract";
import { tenantProfileApi } from "@/lib/api/tenant-profile";
import PublicContractCompanyHeader from "@/components/contracts/public/PublicContractCompanyHeader";
import PublicContractDetails from "@/components/contracts/public/PublicContractDetails";
import PublicContractTermsSection from "@/components/contracts/public/PublicContractTermsSection";
import PublicContractSignTab from "@/components/contracts/public/PublicContractSignTab";
import ContractLoadingState from "@/components/ui/ContractLoadingState";
import ContractErrorState from "@/components/ui/ContractErrorState";
import type { TenantProfile } from "@/lib/types";

// Simple date formatter: "01, Jan, 2026"
const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, ", ");
};

export default function PublicContractViewPage() {
  const params = useParams();
  const token = params.token as string;
  
  const { contract, loading: contractLoading, error, signed, signContract, downloadPdf } = usePublicContract(token);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);

  // Fetch tenant profile for company details
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const data = await tenantProfileApi.get();
        setTenant(data);
      } catch (err) {
        console.error("Failed to fetch tenant profile:", err);
        // Fallback data
        setTenant({
          company_name: "Rental Company",
          business_location: "",
          phone: "",
          email: "",
          website: "",
          kra_pin: "",
          logo_url: "",
          contract_terms: "",
        });
      } finally {
        setLoadingTenant(false);
      }
    };
    fetchTenant();
  }, []);

  const loading = contractLoading || loadingTenant;
  if (loading) return <ContractLoadingState message="Loading contract..." />;
  if (error || !contract) return <ContractErrorState message={error || "Contract not found"} />;

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ USE THE REUSABLE COMPANY HEADER COMPONENT */}
        {tenant && (
          <PublicContractCompanyHeader 
            tenant={tenant}
            bookingNumber={contract.booking_number || `BK-${contract.booking_id}`}
          />
        )}

        {/* Main card container - Blue banner now INSIDE */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* ✅ Premium Status Banner (Inside the card, attached) */}
          <div className={`p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${
            signed ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"
          }`}>
            <div className="flex items-center gap-3">
              {signed ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className={`text-sm font-bold ${signed ? "text-emerald-900" : "text-blue-900"}`}>
                  {signed ? "Contract Signed & Executed" : "Pending Your Signature"}
                </h3>
                <p className={`text-xs ${signed ? "text-emerald-700" : "text-blue-700"}`}>
                  {signed 
                    ? "This agreement is fully executed." 
                    : "Please review details and sign to proceed."}
                </p>
              </div>
            </div>
            
            {/* Download Button */}
            <button
              onClick={downloadPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm shrink-0"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          {/* Contract Details Grid */}
          <PublicContractDetails contract={contract} />
          
          {/* Tabbed Terms Section (Summary open by default) */}
          <PublicContractTermsSection tenantName={tenant?.company_name || "Rental Company"} />
          
          {/* Signature + Mandatory Checkbox + Sign Button (only if not signed) */}
          {!signed && (
            <PublicContractSignTab 
              contract={contract}
              onSign={signContract}
              isSigned={signed}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs text-slate-400">
            Secured by Rental Garage • Contract generated on {formatDate(contract.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
