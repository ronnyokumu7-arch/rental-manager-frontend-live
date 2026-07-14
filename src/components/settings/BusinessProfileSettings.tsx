// src/components/settings/BusinessProfileSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Upload, Globe, Mail, Phone, MapPin, Hash, FileText, Save, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { tenantProfileApi, type TenantProfilePayload } from "@/lib/api/tenant-profile";

// ✅ Zod Schema: Transforms empty strings to undefined to play nicely with FastAPI's exclude_unset=True
const businessProfileSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  business_location: z.string().min(5, "Business location is required"),
  kra_pin: z.string().min(11, "KRA PIN must be at least 11 characters").optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  contract_terms: z.string().optional().transform((v) => (v === "" ? undefined : v)),
  logo_url: z.string().optional().transform((v) => (v === "" ? undefined : v)),
});

type BusinessProfileForm = z.infer<typeof businessProfileSchema>;

// ✅ HELPER: Safely extracts FastAPI Pydantic errors into a readable string
const getErrorMessage = (error: any): string => {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg).join(", ") || "Validation failed";
  }
  if (typeof detail === "string") {
    return detail;
  }
  return error?.message || "An unexpected error occurred. Please try again.";
};

export default function BusinessProfileSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BusinessProfileForm>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      company_name: "",
      email: "",
      phone: "",
      website: "",
      business_location: "",
      kra_pin: "",
      contract_terms: "",
      logo_url: "",
    },
  });

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await tenantProfileApi.get();
        // Map DB fields back to form fields
        reset({
          company_name: profile.company_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          website: profile.website || "",
          business_location: profile.address || "",
          kra_pin: profile.tax_number || "",
          contract_terms: profile.contract_footer || "",
          logo_url: profile.logo_url || "",
        });
        if (profile.logo_url) setLogoPreview(profile.logo_url);
      } catch (error: any) {
        // 404 is expected if no profile exists yet (Create Mode). Ignore it.
        if (error.response?.status !== 404) {
          toast.error(getErrorMessage(error));
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  // Handle Logo Upload (Local Preview)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setLogoPreview(localUrl);
      setValue("logo_url", localUrl, { shouldDirty: true });
    }
  };

  const onSubmit = async (data: BusinessProfileForm) => {
    setIsSaving(true);
    try {
      // ✅ GOTCHA PREVENTION: Strip local blob URLs before sending to backend
      const payload: TenantProfilePayload = {
        ...data,
        logo_url: data.logo_url?.startsWith("blob:") ? undefined : data.logo_url,
      };

      try {
        // Attempt Update first
        await tenantProfileApi.update(payload);
        toast.success("Business profile updated successfully");
      } catch (error: any) {
        // If 404, it means no profile exists yet. Switch to Create.
        if (error.response?.status === 404) {
          await tenantProfileApi.create(payload);
          toast.success("Business profile created successfully");
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-6">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">Company Information</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-6">Update your agency's public details and contact information.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                  <input
                    {...register("company_name")}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                    placeholder="e.g. Nairobi Car Rentals"
                  />
                </div>
                {errors.company_name && <p className="text-xs text-[var(--color-danger-text)] mt-1.5">{errors.company_name.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                  <input
                    {...register("email")}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                    placeholder="contact@agency.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-[var(--color-danger-text)] mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                  <input
                    {...register("phone")}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                    placeholder="+254 700 000 000"
                  />
                </div>
                {errors.phone && <p className="text-xs text-[var(--color-danger-text)] mt-1.5">{errors.phone.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                  <input
                    {...register("website")}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                    placeholder="https://www.agency.com"
                  />
                </div>
                {errors.website && <p className="text-xs text-[var(--color-danger-text)] mt-1.5">{errors.website.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2">Business Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                  <input
                    {...register("business_location")}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                    placeholder="Westlands, Nairobi, Kenya"
                  />
                </div>
                {errors.business_location && <p className="text-xs text-[var(--color-danger-text)] mt-1.5">{errors.business_location.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2">KRA PIN (Tax ID)</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
                  <input
                    {...register("kra_pin")}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-mono uppercase"
                    placeholder="A012345678B"
                  />
                </div>
                {errors.kra_pin && <p className="text-xs text-[var(--color-danger-text)] mt-1.5">{errors.kra_pin.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-6">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">Contract Footer</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-6">Terms and conditions appended to all generated contracts.</p>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" />
              <textarea
                {...register("contract_terms")}
                rows={4}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm resize-none"
                placeholder="Enter your standard contract terms..."
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Logo & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-6">
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-4">Company Logo</h3>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] flex items-center justify-center overflow-hidden mb-4 group relative">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-[var(--color-ink-subtle)]" />
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                  <input type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] text-center">
                Click to upload. PNG or JPG up to 2MB.
              </p>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-6 sticky top-6">
            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[var(--shadow-md)]"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isDirty ? (
                <Save className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isSaving ? "Saving Changes..." : isDirty ? "Save Changes" : "All Saved"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
