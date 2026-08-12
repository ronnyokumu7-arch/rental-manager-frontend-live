// src/app/invoice/[token]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { invoicesApi } from "@/lib/api/invoices";
import { useState } from "react";
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
  CreditCard,
  Receipt,
  Smartphone,
  Landmark,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { usePublicInvoice } from "@/hooks/public-docs/usePublicInvoice";

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  const { invoice, loading, error, isPaying, handleRecordPayment } = usePublicInvoice(token);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"mpesa" | "manual">("mpesa");
  const [reference, setReference] = useState("");
  const [payChannel, setPayChannel] = useState<"mpesa" | "bank">("mpesa");

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    
    try {
      toast.loading("Generating PDF...");
      const res = await invoicesApi.downloadPdfByToken(token);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoice.invoice_number}.pdf`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF downloaded");
    } catch {
      toast.dismiss();
      toast.error("Failed to download PDF");
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium text-sm sm:text-base">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-500" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Invoice Unavailable</h1>
          <p className="text-gray-500 text-xs sm:text-sm mb-6">{error || "This invoice link is invalid or has expired."}</p>
          <p className="text-xs text-gray-400">Please contact the rental agency for a new link.</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "paid";
  const remaining = invoice.remaining_balance ?? 0;

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    if (!reference && method === "mpesa") return toast.error("M-Pesa reference is required");
    handleRecordPayment(parseFloat(amount), method, reference);
    return;
  };

  // 3. Main Render
  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{invoice.tenant_name}</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">Rental Invoice Payment Portal</p>
          <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wide">
            <Receipt size={14} />
            {invoice.invoice_number}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Status Banner */}
          <div className={`p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
            isPaid ? "bg-emerald-50" : "bg-blue-50"
          }`}>
            <div className="flex items-center gap-3">
              {isPaid ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <FileText className="h-5 w-5 text-blue-600 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-bold ${isPaid ? "text-emerald-900" : "text-blue-900"}`}>
                  {isPaid ? "Invoice Fully Paid" : "Pending Payment"}
                </p>
                <p className={`text-xs ${isPaid ? "text-emerald-700" : "text-blue-700"}`}>
                  {isPaid ? "Thank you for your payment." : "Please review the details below and arrange payment."}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm shrink-0"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          {/* Invoice Details Grid */}
          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              
              {/* Client Info (✅ phone under name) */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Details</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                    <User size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{invoice.client_name}</p>
                    <p className="text-xs text-slate-500">{invoice.client_phone || "Renter"}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Details</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                    <Car size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{invoice.vehicle_description || "N/A"}</p>
                    <p className="text-xs text-slate-500">Rental Vehicle</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Dates</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                    <Calendar size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">Payment deadline</p>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                    <Banknote size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {invoice.currency_code} {Number(invoice.amount_due).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Total invoice value</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ NEW: How to Complete Payment */}
            <div className="mt-6 sm:mt-10 p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <CreditCard size={16} className="text-slate-600" />
                How to Complete Payment
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Pay using your preferred channel, then record the transaction reference below.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPayChannel("mpesa")}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    payChannel === "mpesa"
                      ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${payChannel === "mpesa" ? "text-emerald-700" : "text-slate-700"}`}>
                    <Smartphone size={13} /> M-Pesa Express
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">PayBill Transfer</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPayChannel("bank")}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    payChannel === "bank"
                      ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${payChannel === "bank" ? "text-indigo-700" : "text-slate-700"}`}>
                    <Landmark size={13} /> Bank Transfer
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">EFT / RTGS</p>
                </button>
              </div>

              {payChannel === "mpesa" ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs font-bold text-emerald-800 mb-2">M-Pesa Payment Instructions:</p>
                  <div className="text-xs text-emerald-900 space-y-1">
                    <p>1. Go to M-Pesa → Lipa na M-Pesa → <span className="font-bold">PayBill</span></p>
                    <p>2. Business Number: <span className="font-bold">888222</span></p>
                    <p>3. Account Number: <span className="font-bold">{invoice.invoice_number}</span></p>
                    <p>4. Enter the amount and your M-Pesa PIN, then send.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-xs font-bold text-indigo-800 mb-2">Bank Wire Transfer Details:</p>
                  <div className="text-xs text-indigo-900 space-y-1">
                    <p>Bank Name: <span className="font-bold">KCB Bank Kenya</span></p>
                    <p>Account Name: <span className="font-bold">{invoice.tenant_name}</span></p>
                    <p>Account Number: <span className="font-bold">12948572910</span></p>
                    <p>Payment Reference: <span className="font-bold">{invoice.invoice_number}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="mt-6 p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-slate-600" />
                Record Offline Payment
              </h4>
              
              {isPaid ? (
                <div className="text-center py-4">
                  <p className="text-sm text-emerald-700 font-medium">This invoice has been fully paid.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">Remaining Balance:</span>
                    <span className="text-sm font-bold text-amber-900">
                      {invoice.currency_code} {remaining.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount ({invoice.currency_code}) *</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        max={remaining}
                        step="0.01"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., 5000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method *</label>
                      <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value as "mpesa" | "manual")}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="mpesa">M-Pesa</option>
                        <option value="manual">Bank Transfer / Cash</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      {method === "mpesa" ? "M-Pesa Transaction Code *" : "Reference / Receipt Number"}
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder={method === "mpesa" ? "e.g., QFG34HJ8L" : "Optional"}
                      required={method === "mpesa"}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} /> Confirm Payment
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer (✅ defensive date check) */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs text-slate-400">
            Secured by Rental Garage • Invoice generated on{" "}
            {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
