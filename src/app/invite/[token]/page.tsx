"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Clock, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import NewClientForm from "@/components/client/NewClientForm";
import { env } from "@/lib/env";

type PageStatus = "loading" | "ready" | "invalid" | "expired" | "submitting" | "success";

export default function PublicInvitePage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<PageStatus>("loading");
  const [branding, setBranding] = useState<{ name: string; logo?: string; phone?: string; email?: string } | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({
    full_name: "", email: "", phone: "", 
    id_type: "national_id", id_number: "", 
    dl_number: "", dl_expiry: "", 
    residential_address: "", work_address: "", 
    next_of_kin_name: "", next_of_kin_phone: ""
  });

  // ✅ Real file states (replacing dummyFile)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  // 1. Fetch Invite Preview (Branding + Validity)
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/clients/invite/${token}`);
        
        if (res.status === 410) {
          setStatus("expired");
          return;
        }
        if (!res.ok) {
          setStatus("invalid");
          return;
        }

        const data = await res.json();
        setBranding({
          name: data.tenant_name,
          logo: data.tenant_logo_url,
          phone: data.tenant_phone,
          email: data.tenant_email,
        });
        setStatus("ready");
      } catch (err) {
        console.error("Failed to fetch invite preview:", err);
        setStatus("invalid");
      }
    };

    if (token) fetchPreview();
  }, [token]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 2. Handle Form Submission (Upload-then-Create flow)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate required docs
    if (!idFrontFile || !dlFrontFile) {
      toast.error("ID Front and DL Front are required");
      return;
    }

    setStatus("submitting");

    try {
      // 1. Upload documents first (if any files are selected)
      const uploadedUrls: Record<string, string> = {};
      const uploadPromises: Promise<void>[] = [];

      const uploadDoc = async (file: File, field: string) => {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        
        const res = await fetch(
          `${env.NEXT_PUBLIC_API_URL}/clients/invite/${token}/upload?field=${field}`,
          { method: "POST", body: uploadFormData }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Upload failed");
        }

        const data = await res.json();
        uploadedUrls[field] = data.url;
      };

      if (avatarFile) uploadPromises.push(uploadDoc(avatarFile, "avatar"));
      if (idFrontFile) uploadPromises.push(uploadDoc(idFrontFile, "id_front"));
      if (idBackFile) uploadPromises.push(uploadDoc(idBackFile, "id_back"));
      if (dlFrontFile) uploadPromises.push(uploadDoc(dlFrontFile, "dl_front"));

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // 2. Submit form with uploaded URLs
      const payload = {
        ...formData,
        avatar_image: uploadedUrls.avatar || null,
        id_image_front: uploadedUrls.id_front || null,
        id_image_back: uploadedUrls.id_back || null,
        dl_image_front: uploadedUrls.dl_front || null,
      };

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/clients/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        setStatus("success");
        return;
      }

      if (res.status === 410) {
        setStatus("expired");
        toast.error("This invite link has already been used or expired.");
        return;
      }

      if (res.status === 409) {
        const errorData = await res.json();
        const messages = Array.isArray(errorData.detail) ? errorData.detail : [errorData.detail];
        messages.forEach((msg: string) => toast.error(msg));
        setStatus("ready");
        return;
      }

      if (res.status === 422) {
        const errorData = await res.json();
        toast.error(errorData.detail?.[0]?.msg || "Please check your input and try again.");
        setStatus("ready");
        return;
      }

      throw new Error("Submission failed");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to upload documents");
      setStatus("ready");
    }
  };

  // --- UI STATES ---

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
          <p className="text-[var(--color-ink-muted)] font-medium text-sm">Verifying your invite link...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4 sm:p-6">
        <div className="max-w-md w-full bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-surface-border)] p-8 text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-ink)] mb-2">Invalid Invite Link</h1>
          <p className="text-[var(--color-ink-muted)] text-sm mb-6">
            This link is invalid, broken, or could not be found. Please contact the agency to request a new onboarding link.
          </p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4 sm:p-6">
        <div className="max-w-md w-full bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-surface-border)] p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-ink)] mb-2">Invite Expired or Used</h1>
          <p className="text-[var(--color-ink-muted)] text-sm mb-6">
            This single-use link has either expired or has already been used to create an account. Please contact the agency for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4 sm:p-6">
        <Toaster position="top-center" />
        <div className="max-w-lg w-full bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-surface-border)] p-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-ink)] mb-3">Application Submitted!</h1>
          <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed mb-6">
            Thank you, <span className="font-bold text-[var(--color-ink)]">{formData.full_name}</span>. Your profile has been successfully submitted to <span className="font-bold text-[var(--color-ink)]">{branding?.name}</span>.
          </p>
          
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-left space-y-3 mb-6">
            <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
              <ShieldCheck size={16} /> What happens next?
            </h3>
            <ul className="text-xs text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span> The agency will review your details and verify your identity.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span> Once approved, your account will be activated.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span> You will receive a notification when your account is ready to use.
              </li>
            </ul>
          </div>

          <p className="text-[10px] text-[var(--color-ink-subtle)]">
            You can safely close this window. {branding?.phone && (
              <>If you have questions, call the agency at <a href={`tel:${branding.phone}`} className="font-bold text-[var(--color-primary)] hover:underline">{branding.phone}</a>.</>
            )}
          </p>
        </div>
      </div>
    );
  }

  // --- READY STATE: The Form ---
  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-12">
      <Toaster position="top-center" />
      <NewClientForm
        loading={status === "submitting"}
        formData={formData}
        updateField={updateField}
        handleSubmit={handleSubmit}
        mode="public_intake"
        tenantBranding={branding || undefined}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        idFrontFile={idFrontFile}
        setIdFrontFile={setIdFrontFile}
        idBackFile={idBackFile}
        setIdBackFile={setIdBackFile}
        dlFrontFile={dlFrontFile}
        setDlFrontFile={setDlFrontFile}
      />
    </div>
  );
}
