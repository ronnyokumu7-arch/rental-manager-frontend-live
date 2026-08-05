"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ContractTemplatePreview, { ContractDetailData } from "@/components/contracts/ContractTemplatePreview";
import { contractsApi } from "@/lib/api/contracts";
import { Loader2 } from "lucide-react";

export default function ContractPreviewPage() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("id");

  const [loading, setLoading] = useState(!!contractId);
  const [liveData, setLiveData] = useState<ContractDetailData | undefined>(undefined);

  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        const rawContract = await contractsApi.getById(Number(contractId));
        
        // Map backend response directly into ContractDetailData
        const formattedData: ContractDetailData = {
          contract_number: rawContract.contract_number,
          created_at: rawContract.created_at,
          status: rawContract.status,
          signed_by_client: rawContract.signed_by_client,
          client_signed_at: rawContract.client_signed_at,
          signature_image_path: rawContract.signature_image_path,
          share_token: rawContract.share_token,
          
          client: rawContract.booking?.client ? {
            full_name: rawContract.booking.client.full_name,
            email: rawContract.booking.client.email,
            phone: rawContract.booking.client.phone,
            id_number: rawContract.booking.client.id_number,
            dl_number: rawContract.booking.client.dl_number,
            dl_expiry: rawContract.booking.client.dl_expiry,
            residential_address: rawContract.booking.client.residential_address,
            next_of_kin_name: rawContract.booking.client.next_of_kin_name,
            next_of_kin_phone: rawContract.booking.client.next_of_kin_phone,
          } : undefined,

          vehicle: rawContract.booking?.vehicle ? {
            make: rawContract.booking.vehicle.make,
            model: rawContract.booking.vehicle.model,
            year: rawContract.booking.vehicle.year,
            plate_number: rawContract.booking.vehicle.plate_number,
            vin: rawContract.booking.vehicle.vin,
            insurance_number: rawContract.booking.vehicle.insurance_number,
            current_mileage: rawContract.booking.vehicle.current_mileage,
          } : undefined,

          booking: rawContract.booking ? {
            booking_number: rawContract.booking.booking_number,
            start_date: rawContract.booking.start_date,
            end_date: rawContract.booking.end_date,
            pickup_location: rawContract.booking.pickup_location,
            return_location: rawContract.booking.return_location,
            destination: rawContract.booking.destination,
            daily_rate: rawContract.booking.daily_rate,
            total_amount: rawContract.booking.total_amount,
            currency_code: rawContract.booking.currency_code,
          } : undefined,
        };

        setLiveData(formattedData);
      } catch (err) {
        console.error("Failed to load backend contract", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-2" />
        <p className="text-sm font-medium text-slate-300">Fetching live contract from database...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 py-10">
      {/* Top Banner Bar for Dev Mode */}
      <div className="max-w-4xl mx-auto px-4 mb-6 flex items-center justify-between text-white">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Contract Template Live Preview</h1>
          <p className="text-xs text-slate-400">
            {contractId ? `Connected to Database (Contract ID: ${contractId})` : "Demo Mode — Ready for Sales Presentation"}
          </p>
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
          {contractId ? "LIVE DATABASE SYNC" : "A4 FORMAT VERIFIED"}
        </span>
      </div>

      {/* Contract Template Canvas */}
      <ContractTemplatePreview data={liveData} />
    </main>
  );
}
