"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import apiClient from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(145deg, #f8f9fc 0%, #f0f3fb 100%)" }}>
      {/* Left Panel (Identical to Login for consistency) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0d1325 0%, #1e2a4a 100%)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e6fba 0%, #64b5f6 100%)" }}>RM</div>
          <span className="text-white font-semibold text-lg tracking-tight">Rental Manager</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-bold leading-tight mb-4 tracking-tight">Account Recovery.<br/><span style={{ background: "linear-gradient(135deg, #64b5f6, #90caf9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Secure & Fast.</span></h1>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">We&apos;ll help you get back into your account safely.</p>
        </div>
        <div className="relative z-10 flex items-center gap-6 text-white/40 text-xs font-medium">
          <div className="flex items-center gap-2"><ShieldCheck size={14} /> 256-bit SSL</div>
          <div className="flex items-center gap-2"><ShieldCheck size={14} /> 99.9% Uptime</div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e6fba 0%, #64b5f6 100%)" }}>RM</div>
            <span className="text-ink font-semibold text-lg">Rental Manager</span>
          </div>

          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-ink mb-1 tracking-tight">Reset your password</h2>
              <p className="text-ink-muted text-sm mb-8">Enter your email and we&apos;ll send you a secure reset link.</p>

              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl border text-sm" style={{ background: "#fee2e2", borderColor: "rgba(239,68,68,0.2)", color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="label">Email address</label>
                  <div className="relative">
                    <input type="email" className="input pl-11" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />
                    <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary btn-lg w-full flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Send reset link"}
                </button>
              </form>

              <Link href="/login" className="flex items-center gap-2 mt-6 text-sm text-ink-muted hover:text-ink transition-colors">
                <ArrowLeft size={15} /> Back to login
              </Link>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "#dcfce7" }}>
                <CheckCircle2 size={30} style={{ color: "#15803d" }} strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2 tracking-tight">Check your inbox</h2>
              <p className="text-ink-muted text-sm mb-2">
                If <span className="font-semibold text-ink">{email}</span> is registered, you&apos;ll receive a link shortly.
              </p>
              <p className="text-ink-subtle text-xs mb-8">The link expires in 15 minutes. Check your spam folder if you don&apos;t see it.</p>
              <Link href="/login" className="btn-primary btn inline-flex">Back to login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
