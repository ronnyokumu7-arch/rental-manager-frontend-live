// src/hooks/useTenantOnboarding.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { tenantsApi } from "@/lib/api/tenants";
import type { CreateTenantPayload } from "@/lib/types";

export interface OnboardingFormData {
  name: string;
  company_email: string; // Maps to Tenant.email
  is_corporate: boolean;
  business_location: string;
  phone_number: string;
  kra_pin: string;
  currency: string;
  time_zone: string;
  subscription_plan: "Starter" | "Professional" | "Enterprise";
  billing_cycle: "monthly" | "annual";
  admin_name: string;
  admin_email: string; // Maps to User.email
  admin_phone: string;
  admin_password: string;
}

const INITIAL_FORM_DATA: OnboardingFormData = {
  name: "",
  company_email: "",
  is_corporate: true,
  business_location: "",
  phone_number: "",
  kra_pin: "",
  currency: "KES",
  time_zone: "Africa/Nairobi",
  subscription_plan: "Professional",
  billing_cycle: "annual",
  admin_name: "",
  admin_email: "",
  admin_phone: "",
  admin_password: "",
};

export const useTenantOnboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA);

  const updateField = (field: keyof OnboardingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.error("Please provide the legal tenant/business name");
          return false;
        }
        if (!formData.company_email.trim()) {
          toast.error("Please provide an official company email address");
          return false;
        }
        if (!formData.phone_number.trim()) {
          toast.error("Please provide a primary contact phone number");
          return false;
        }
        return true;
      case 2:
        if (formData.is_corporate && !formData.kra_pin.trim()) {
          toast.error("KRA PIN is required for corporate tenant registration");
          return false;
        }
        return true;
      case 3:
        if (!formData.subscription_plan) {
          toast.error("Please select a subscription tier");
          return false;
        }
        return true;
      case 4:
        if (!formData.admin_name.trim() || !formData.admin_email.trim()) {
          toast.error("Please fill in the primary administrator details");
          return false;
        }
        if (!formData.admin_email.includes("@")) {
          toast.error("Please provide a valid administrator email address");
          return false;
        }
        if (!formData.admin_password.trim() || formData.admin_password.trim().length < 8) {
          toast.error("Please set a temporary admin password (min. 8 characters)");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    try {
      // ✅ Mapped exactly to Backend TenantCreate Schema
      const payload: CreateTenantPayload = {
        name: formData.name.trim(),
        email: formData.company_email.trim(), // ✅ SENDS COMPANY EMAIL AS TENANT.EMAIL
        password: formData.admin_password.trim(),
        
        // Admin Details (for User creation)
        admin_name: formData.admin_name?.trim() || undefined,
        admin_email: formData.admin_email.trim(), // ✅ SENDS ADMIN EMAIL SEPARATELY
        admin_phone: formData.admin_phone?.trim() || formData.phone_number?.trim() || undefined,
        
        // Optional Fields
        phone_number: formData.phone_number?.trim() || undefined,
        plan: formData.subscription_plan?.toLowerCase().trim() || "free_trial",
        business_location: formData.business_location?.trim() || undefined,
        kra_pin: formData.kra_pin?.toUpperCase().trim() || undefined,
        
        // Defaults
        currency: formData.currency?.trim() || "KES",
        time_zone: formData.time_zone?.trim() || "Africa/Nairobi",
        is_corporate: formData.is_corporate ?? false,
        billing_cycle: formData.billing_cycle?.trim() || "monthly",
      };

      await tenantsApi.create(payload);
      toast.success("Tenant environment provisioned successfully!");
      router.push("/super-admin/agencies");
    } catch (error: any) {
      // ✅ FIX: Prevent "Objects are not valid as React child" by parsing Pydantic errors
      const detail = error.response?.data?.detail;
      let errorMessage = "Failed to provision tenant.";
      
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // Join all validation errors into one readable message
        errorMessage = detail.map((err: any) => err.msg).join(', ');
      } else if (detail && typeof detail === 'object') {
        errorMessage = detail.msg || JSON.stringify(detail);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    isSubmitting,
    showPassword,
    setShowPassword,
    formData,
    updateField,
    handleNext,
    handlePrev,
    handleSubmit,
  };
};
