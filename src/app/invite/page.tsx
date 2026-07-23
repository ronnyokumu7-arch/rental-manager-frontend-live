// src/app/invite/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, CheckCircle, AlertCircle, Loader2, ShieldCheck, 
  User, Mail, Phone, Camera, CreditCard, FileText, Calendar, ArrowRight, ArrowLeft 
} from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    avatar_url: "",
    id_number: "",
    id_image_url: "",
    dl_number: "",
    dl_image_url: "",
    dl_expiry: "",
    password: "",
    confirmPassword: "",
  });

  // If no token is present, show an error state immediately
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invite link. Please contact your administrator.");
    }
  }, [token]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // V1: Convert to Base64 string (Keep file sizes reasonable in production)
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (): boolean => {
    setError(null);
    if (step === 1) {
      if (!formData.full_name.trim() || !formData.email.trim()) {
        setError("Full Name and Email are required.");
        return false;
      }
      if (!formData.email.includes("@")) {
        setError("Please enter a valid email address.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.id_number.trim()) {
        setError("National ID Number is required.");
        return false;
      }
    }
    if (step === 3) {
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(3, s + 1));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (!token) return;

    setLoading(true);
    try {
      await usersApi.acceptInvite({
        invite_token: token,
        password: formData.password,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || undefined,
        avatar_url: formData.avatar_url || undefined,
        id_number: formData.id_number.trim() || undefined,
        id_image_url: formData.id_image_url || undefined,
        dl_number: formData.dl_number.trim() || undefined,
        dl_image_url: formData.dl_image_url || undefined,
        dl_expiry: formData.dl_expiry || undefined,
      });
      
      setSuccess(true);
      toast.success("Account activated successfully! Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2500);
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to activate account. The link may be expired or invalid.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (error && !token) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-[var(--color-danger-text)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Invalid Invite Link</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[var(--color-success-text)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Account Activated!</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            Your account has been successfully set up. Redirecting you to the login page...
          </p>
          <div className="flex justify-center">
            <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header / Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">Complete Your Setup</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2">
            Step {step} of 3: {step === 1 ? "Identity" : step === 2 ? "Compliance" : "Security"}
          </p>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4 max-w-[200px] mx-auto">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-border)]"
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[var(--color-danger-bg)] flex items-start gap-2">
                <AlertCircle size={16} className="text-[var(--color-danger-text)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--color-danger-text)] font-medium">{error}</p>
              </div>
            )}

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => updateField("full_name", e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => updateField("phone_number", e.target.value)}
                      placeholder="+254 700 000000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">Profile Photo (Optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-sm text-[var(--color-ink-muted)] cursor-pointer hover:bg-[var(--color-surface-hover)]/80 transition-all">
                      <Camera size={16} />
                      <span>{formData.avatar_url ? "Change Photo" : "Upload Photo"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange("avatar_url", e)} />
                    </label>
                    {formData.avatar_url && (
                      <button type="button" onClick={() => updateField("avatar_url", "")} className="text-xs text-[var(--color-danger-text)] hover:underline">Remove</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: COMPLIANCE */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">National ID Number *</label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                    <input
                      type="text"
                      value={formData.id_number}
                      onChange={(e) => updateField("id_number", e.target.value)}
                      placeholder="e.g. 12345678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">ID Document Image (Optional)</label>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-sm text-[var(--color-ink-muted)] cursor-pointer hover:bg-[var(--color-surface-hover)]/80 transition-all">
                    <FileText size={16} />
                    <span>{formData.id_image_url ? "Change ID Image" : "Upload ID Image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange("id_image_url", e)} />
                  </label>
                </div>
                
                <div className="pt-4 border-t border-[var(--color-surface-border)]">
                  <p className="text-xs font-bold text-[var(--color-ink)] mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[var(--color-primary)]" />
                    Driver's License (Required for Drivers)
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">DL Number</label>
                      <input
                        type="text"
                        value={formData.dl_number}
                        onChange={(e) => updateField("dl_number", e.target.value)}
                        placeholder="e.g. DL-01234"
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">DL Expiry</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                          <input
                            type="date"
                            value={formData.dl_expiry}
                            onChange={(e) => updateField("dl_expiry", e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">DL Image</label>
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-sm text-[var(--color-ink-muted)] cursor-pointer hover:bg-[var(--color-surface-hover)]/80 transition-all h-[42px]">
                          <FileText size={16} />
                          <span className="truncate">{formData.dl_image_url ? "Changed" : "Upload"}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange("dl_image_url", e)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SECURITY */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">New Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-[var(--color-surface-border)] mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div /> /* Spacer */
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] transition-all active:scale-[0.98]"
                >
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 shadow-[var(--shadow-md)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {loading ? "Activating Account..." : "Activate Account"}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--color-ink-muted)]">
              Having trouble? Contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
