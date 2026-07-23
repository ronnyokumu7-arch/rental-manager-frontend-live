// src/components/settings/BillingSubscriptionSettings.tsx
"use client";

import React, { useState } from "react";
import { 
  CreditCard, CheckCircle2, ArrowLeft, ShieldCheck, Building2, Smartphone, 
  Receipt, Send, Info, RefreshCw, AlertTriangle 
} from "lucide-react";
import toast from "react-hot-toast";

import { useBillingSubscription } from "@/hooks/settings/useBillingSubscription";
import { PricingGrid, PlanId, BillingCycle } from "@/components/billing/PricingGrid";

// Helper to map UI PlanId to Backend PlanType string
const mapPlanIdToBackend = (planId: PlanId): string => {
  if (planId === "Professional") return "pro";
  return planId.toLowerCase();
};

// Helper to map Backend PlanType string to UI PlanId
const mapBackendToPlanId = (backendPlan: string | null): PlanId => {
  if (backendPlan === "pro") return "Professional";
  if (backendPlan === "starter") return "Starter";
  if (backendPlan === "enterprise") return "Enterprise";
  return "Starter";
};

export default function BillingSubscriptionSettings() {
  const { 
    activeSubscription, isLoading, isActionMutating, submitPaymentVerification, toggleAutoRenew, refreshData
  } = useBillingSubscription();

  const [step, setStep] = useState<"PLANS" | "PAYMENT">("PLANS");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  
  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "bank">("mpesa");
  const [referenceCode, setReferenceCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentPlanId = activeSubscription?.plan ? mapBackendToPlanId(activeSubscription.plan) : null;

  const handleConfirmSelection = (planId: PlanId, cycle: BillingCycle) => {
    setSelectedPlan(planId);
    setBillingCycle(cycle);
    setStep("PAYMENT");
    setIsSubmitted(false);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceCode.trim() || !selectedPlan) {
      toast.error("Please enter your payment reference transaction code.");
      return;
    }

    const payload = {
      target_plan: mapPlanIdToBackend(selectedPlan),
      target_billing_cycle: billingCycle,
      payment_method: paymentMethod,
      reference_code: referenceCode.trim(),
      notes: notes.trim()
    };

    const success = await submitPaymentVerification(payload);
    if (success) setIsSubmitted(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-32"><div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  // RED BANNER LOGIC: For tenants with NO active subscription or bad status
  const showRedBanner = !activeSubscription || ['suspended', 'past_due', 'cancelled'].includes(activeSubscription.status);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 🔴 RED ALERT BANNER (For Inactive/Suspended/No Plan Tenants) */}
      {showRedBanner && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-rose-500 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-rose-500">Subscription Inactive</h3>
            <p className="text-xs text-rose-400 mt-1">
              Your workspace currently has {!activeSubscription ? "no active subscription" : `a ${activeSubscription.status.replace('_', ' ')} status`}. 
              Please select a plan below to restore full access to your rental management tools.
            </p>
          </div>
        </div>
      )}

      {/* 🟢 BEAUTIFUL ACTIVE PLAN BANNER */}
      {activeSubscription && !showRedBanner && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Side: Plan Identity */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeSubscription.status === 'trial' ? 'bg-indigo-500/10 text-indigo-500' : activeSubscription.status === 'pending_verification' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <ShieldCheck size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    activeSubscription.status === 'trial' ? 'bg-indigo-500/10 text-indigo-500' : 
                    activeSubscription.status === 'pending_verification' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {activeSubscription.status === 'pending_verification' ? 'PENDING APPROVAL' : 
                     activeSubscription.status === 'trial' ? 'FREE TRIAL' : 'ACTIVE'}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--color-ink)]">
                    {activeSubscription.plan === 'pro' ? 'Pro Fleet' : activeSubscription.plan} Plan
                  </h2>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  • {activeSubscription.billing_cycle} billing cycle
                  {activeSubscription.status === 'pending_verification' && (
                    <span className="text-amber-500 ml-2 font-semibold">• Awaiting Super Admin approval</span>
                  )}
                </p>
              </div>
            </div>

            {/* Right Side: Stats, Toggle & Refresh */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[var(--color-surface-hover)] px-3 py-2 rounded-xl border border-[var(--color-surface-border)] text-center min-w-[100px]">
                <div className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold tracking-wider">Start Date</div>
                <div className="text-sm font-bold text-[var(--color-ink)] whitespace-nowrap">
                  {new Date(activeSubscription.starts_at).toLocaleDateString()}
                </div>
              </div>

              <div className="bg-[var(--color-surface-hover)] px-3 py-2 rounded-xl border border-[var(--color-surface-border)] text-center min-w-[100px]">
                <div className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold tracking-wider">Next Renewal</div>
                <div className="text-sm font-bold text-[var(--color-ink)] whitespace-nowrap">
                  {activeSubscription.ends_at ? new Date(activeSubscription.ends_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Manual Refresh Button */}
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap"
                title="Refresh subscription status"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                <span className="hidden sm:n"></span>
              </button>

              {activeSubscription.status === 'active' && (
                <button
                  onClick={toggleAutoRenew}
                  disabled={isActionMutating}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeSubscription.auto_renew
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                      : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <RefreshCw size={14} className={isActionMutating ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Auto-Renew: {activeSubscription.auto_renew ? "On" : "Off"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/*  PRICING GRID & PAYMENT FLOW */}
      {step === "PLANS" && (
        <div className="space-y-4">
          {/* Billing Cycle Toggle - Moved to top */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)]">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "annual"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Annual (20% Off)
              </button>
            </div>
          </div>

          <PricingGrid
            selectedPlan={selectedPlan || (currentPlanId as PlanId) || "Starter"}
            billingCycle={billingCycle}
            onSelectPlan={setSelectedPlan}
            onSelectCycle={setBillingCycle}
            onConfirmSelection={handleConfirmSelection}
            currentPlanId={currentPlanId}
            isSubmitting={isActionMutating}
          />
        </div>
      )}

      {/* 💳 PAYMENT SUBMISSION FORM */}
      {step === "PAYMENT" && selectedPlan && (
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setStep("PLANS")} className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] mb-6 transition-colors">
            <ArrowLeft size={14}/> Back to Plan Selection
          </button>

          {isSubmitted ? (
            <div className="bg-[var(--color-surface)] border border-emerald-500/30 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={32}/></div>
              <h3 className="text-xl font-bold text-[var(--color-ink)]">Payment Submitted for Review!</h3>
              <p className="text-xs text-[var(--color-ink-muted)] max-w-md mx-auto">Your reference code <span className="font-mono font-bold text-[var(--color-ink)]">{referenceCode}</span> is now in the Super Admin queue. Your plan will activate automatically upon approval.</p>
              <button onClick={() => { setStep("PLANS"); setIsSubmitted(false); setReferenceCode(""); setNotes(""); }} className="mt-4 px-6 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl hover:opacity-90">Return to Plans</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ✅ LEFT: COMPREHENSIVE PLAN PREVIEW */}
              <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 h-fit sticky top-6">
                <div className="flex items-center gap-2 text-indigo-500 text-[10px] font-bold uppercase tracking-wider mb-4">
                  <Info size={12}/> Selected Tier
                </div>
                
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[var(--color-ink)] mb-1">
                    {selectedPlan === 'Professional' ? 'Pro Fleet' : selectedPlan}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)] capitalize">
                    {billingCycle} billing cycle
                  </p>
                </div>

                {/* Price Display */}
                <div className="bg-[var(--color-surface-hover)] rounded-xl p-4 mb-6 border border-[var(--color-surface-border)]">
                  <div className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold tracking-wider mb-1">Total Payable</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[var(--color-ink)]">
                      KES {selectedPlan === 'Starter' ? (billingCycle === 'annual' ? '15,000' : '18,000') : 
                           selectedPlan === 'Professional' ? (billingCycle === 'annual' ? '42,000' : '50,000') : 
                           billingCycle === 'annual' ? '100,000' : '120,000'}
                    </span>
                    <span className="text-xs text-[var(--color-ink-muted)]">/mo</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Save 20% with annual billing
                    </div>
                  )}
                </div>

                {/* What's Included */}
                <div className="mb-6">
                  <div className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold tracking-wider mb-3">
                    What's Included:
                  </div>
                  <ul className="space-y-2">
                    {(() => {
                      const planFeatures = {
                        'Starter': [
                          'Up to 10 Vehicles',
                          'Basic Booking Calendar',
                          'Standard Client Management',
                          'Email Receipts & Contracts',
                          'Community Support'
                        ],
                        'Professional': [
                          'Up to 50 Vehicles',
                          'Advanced 14-Day Tactical Booking Grid',
                          'Online Contract Signatures & ID Verification',
                          'Automated M-Pesa & Bank Reconciliation',
                          'Multi-User Role Permissions',
                          'Priority WhatsApp & Email Support'
                        ],
                        'Enterprise': [
                          'Unlimited Fleet Capacity',
                          'GPS Tracking & Telematics Integration',
                          'Custom Subdomain & White-Label Branding',
                          'Dedicated Account Manager',
                          'SLA 99.9% Uptime Guarantee',
                          'Custom API Access'
                        ]
                      };
                      
                      return planFeatures[selectedPlan as keyof typeof planFeatures]?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-ink)]">
                          <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0"/>
                          {feature}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>

                {/* Action Required */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <AlertTriangle size={12}/> Action Required
                  </div>
                  <div className="text-xs text-amber-400">
                    Complete payment and submit your transaction reference code for verification.
                  </div>
                </div>
              </div>

              {/* RIGHT: PAYMENT DETAILS */}
              <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6">
                <div className="flex items-center gap-2 text-[var(--color-ink)] text-sm font-bold mb-4">
                  <CreditCard size={16}/> How to Complete Payment
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mb-4">Pay using your preferred channel and provide the transaction reference below.</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => setPaymentMethod("mpesa")} className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${paymentMethod === "mpesa" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"}`}>
                    <Smartphone size={18}/><div className="text-xs"><div className="font-bold">M-Pesa Express</div><div className="text-[10px] opacity-80">Paybill Transfer</div></div>
                  </button>
                  <button onClick={() => setPaymentMethod("bank")} className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${paymentMethod === "bank" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"}`}>
                    <Building2 size={18}/><div className="text-xs"><div className="font-bold">Bank Transfer</div><div className="text-[10px] opacity-80">EFT / RTGS</div></div>
                  </button>
                </div>

                <div className="bg-[var(--color-surface-hover)] rounded-xl p-4 mb-6 border border-[var(--color-surface-border)] text-xs space-y-2">
                  {paymentMethod === "mpesa" ? (
                    <>
                      <p className="font-bold text-emerald-500 flex items-center gap-1"><Info size={12}/> M-Pesa Payment Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 text-[var(--color-ink-muted)] pl-1">
                        <li>Go to M-Pesa → Lipa na M-Pesa → <strong className="text-[var(--color-ink)]">PayBill</strong></li>
                        <li>Business Number: <strong className="font-mono text-[var(--color-ink)]">888222</strong></li>
                        <li>Account Number: <strong className="font-mono text-[var(--color-ink)]">RENTAL-RENEWAL</strong></li>
                        <li>Enter Amount and your M-Pesa PIN</li>
                      </ol>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-[var(--color-primary)] flex items-center gap-1"><Info size={12}/> Bank Wire Transfer Details:</p>
                      <ul className="space-y-1 text-[var(--color-ink-muted)] pl-1">
                        <li>Bank Name: <strong className="text-[var(--color-ink)]">KCB Bank Kenya</strong></li>
                        <li>Account Name: <strong className="text-[var(--color-ink)]">Rental Manager Systems Ltd</strong></li>
                        <li>Account Number: <strong className="font-mono text-[var(--color-ink)]">12948572910</strong></li>
                      </ul>
                    </>
                  )}
                </div>

                <form onSubmit={handleSubmitVerification} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-ink)] mb-1">Payment / Transaction Reference Code <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Receipt size={14} className="absolute left-3 top-3 text-[var(--color-ink-subtle)]"/>
                      <input type="text" required placeholder="e.g. QX829102KS" value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs text-[var(--color-ink)] font-mono focus:ring-2 focus:ring-[var(--color-primary)]/20 uppercase"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Additional Notes to Super Admin (Optional)</label>
                    <textarea rows={2} placeholder="Mention any custom billing notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs text-[var(--color-ink)]"/>
                  </div>
                  <button type="submit" disabled={isActionMutating} className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50">
                    {isActionMutating ? <RefreshCw size={14} className="animate-spin"/> : <><Send size={14}/> Submit Payment for Verification</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
