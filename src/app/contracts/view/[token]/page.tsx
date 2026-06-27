"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  Car, 
  User, 
  Banknote,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { contractsApi } from "@/lib/api/contracts";

export default function PublicContractPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<any | null>(null);
  const [signing, setSigning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const data = await contractsApi.publicView(token);
        setContract(data);
        if (data.signed_by_client) setShowSuccess(true);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Contract not found or expired.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchContract();
  }, [token]);

  const handleSignContract = async () => {
    setSigning(true);
    try {
      await contractsApi.publicSign(token);
      toast.success("Contract signed successfully!");
      setShowSuccess(true);
      setContract((prev: any) => prev ? { ...prev, signed_by_client: true, status: "signed" } : null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to sign contract.");
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      toast.loading("Downloading...", { duration: 2000 });
      const response = await contractsApi.publicDownloadPdf(token);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contract-${contract?.contract_number}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (err: any) {
      toast.error("Failed to download PDF");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Contract Unavailable</h1>
          <p className="text-gray-500 text-sm mb-6">{error || "This contract link is invalid or has expired."}</p>
          <p className="text-xs text-gray-400">Please contact the rental agency for a new link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{contract.tenant_name}</h1>
          <p className="mt-2 text-slate-500">Vehicle Rental Agreement</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wide">
            <FileText size={14} />
            {contract.contract_number}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Status Banner */}
          <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${
            showSuccess ? "bg-emerald-50" : "bg-blue-50"
          }`}>
            <div className="flex items-center gap-3">
              {showSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <FileText className="h-5 w-5 text-blue-600" />
              )}
              <div>
                <p className={`text-sm font-bold ${showSuccess ? "text-emerald-900" : "text-blue-900"}`}>
                  {showSuccess ? "Contract Signed & Executed" : "Pending Your Signature"}
                </p>
                <p className={`text-xs ${showSuccess ? "text-emerald-700" : "text-blue-700"}`}>
                  {showSuccess ? "Thank you for completing your rental agreement." : "Please review the details below and sign to proceed."}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          {/* Contract Details Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Client Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Details</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <User size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{contract.client_name}</p>
                    <p className="text-xs text-slate-500">Renter</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Details</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Car size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{contract.vehicle_make} {contract.vehicle_model}</p>
                    <p className="text-xs text-slate-500">Plate: {contract.vehicle_plate}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rental Period</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Calendar size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(contract.start_date).toLocaleDateString()} — {new Date(contract.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">Agreed rental duration</p>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Banknote size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {contract.currency_code} {Number(contract.total_amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Total contract value</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Text */}
            <div className="mt-10 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Terms & Conditions</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                By signing this document, you agree to the rental terms and conditions provided by {contract.tenant_name}. 
                This includes policies regarding fuel, damage, late returns, and security deposits as outlined in the full PDF agreement. 
                Please ensure you have downloaded and read the complete contract before signing.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          {!showSuccess && (
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                By clicking sign, you confirm that you have read and agree to the terms.
              </p>
              <button
                onClick={handleSignContract}
                disabled={signing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Sign Contract
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Secured by Rental Manager • Contract generated on {new Date(contract.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
