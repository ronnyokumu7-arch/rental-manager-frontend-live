// src/components/tenants/wizard/StepSubscription.tsx
import { Check, Zap, Crown, Layers } from "lucide-react";
import type { OnboardingFormData } from "@/hooks/useTenantOnboarding";

interface StepSubscriptionProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: any) => void;
}

export default function StepSubscription({ formData, updateField }: StepSubscriptionProps) {
  const plans = [
    {
      id: "Starter",
      name: "Starter",
      icon: Zap,
      price: formData.billing_cycle === "annual" ? "15,000" : "18,000",
      desc: "Essential operations for boutique fleets.",
      features: ["Up to 10 Vehicles", "Digital Contracts", "Standard Reporting"],
    },
    {
      id: "Professional",
      name: "Pro Fleet",
      icon: Crown,
      price: formData.billing_cycle === "annual" ? "42,000" : "50,000",
      desc: "Scaling commercial fleets & multi-user teams.",
      features: ["Up to 50 Vehicles", "Advanced Telematics", "Service Rules", "Multi-User Permissions"],
      featured: true,
    },
    {
      id: "Enterprise",
      name: "Enterprise",
      icon: Layers,
      price: "Custom",
      desc: "Dedicated infrastructure & bespoke integrations.",
      features: ["Unlimited Fleet Size", "Dedicated DB Instance", "24/7 Priority Support"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-surface-border)] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">SaaS Subscription Plan</h2>
          <p className="text-xs text-[var(--color-ink-muted)]">Select fleet limit capacities and feature access.</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)] self-start md:self-auto">
          <button
            type="button"
            onClick={() => updateField("billing_cycle", "monthly")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              formData.billing_cycle === "monthly" ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm" : "text-[var(--color-ink-muted)]"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => updateField("billing_cycle", "annual")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              formData.billing_cycle === "annual" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)]"
            }`}
          >
            Annual (20% Off)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isSelected = formData.subscription_plan === plan.id;
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              onClick={() => updateField("subscription_plan", plan.id as any)}
              className={`group relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-[var(--color-surface)] border-[var(--color-primary)] shadow-[var(--shadow-lg)] ring-1 ring-[var(--color-primary)]"
                  : "bg-[var(--color-surface-hover)]/30 border-[var(--color-surface-border)] hover:border-[var(--color-ink-subtle)]"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary)] text-white tracking-wide shadow-sm uppercase">
                  Most Popular
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]">
                    {plan.name}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                  {plan.price !== "Custom" ? `KES ${plan.price}` : "Custom Quote"}
                  {plan.price !== "Custom" && <span className="text-xs font-normal text-[var(--color-ink-subtle)] font-sans"> /mo</span>}
                </h3>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1 mb-6">{plan.desc}</p>
                <div className="space-y-2.5 border-t border-[var(--color-surface-border)] pt-4">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[var(--color-ink-muted)]">
                      <Check size={14} className="text-[var(--color-success-text)] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between text-xs font-semibold">
                <span className={isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"}>
                  {isSelected ? "Selected Tier" : "Select Tier"}
                </span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-[var(--color-surface-border)]"}`}>
                  {isSelected && <Check size={12} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
