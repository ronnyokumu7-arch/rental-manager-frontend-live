// src/components/tenants/wizard/StepSubscription.tsx
// import type { OnboardingFormData } from "@/hooks/useTenantOnboarding";
import { PricingGrid } from "@/components/billing/PricingGrid";

export default function StepSubscription({ formData, updateField }: StepSubscriptionProps) {
  return (
    <PricingGrid
      selectedPlan={formData.subscription_plan}
      billingCycle={formData.billing_cycle}
      onSelectPlan={(plan) => updateField("subscription_plan", plan)}
      onSelectCycle={(cycle) => updateField("billing_cycle", cycle)}
    />
  );
}
