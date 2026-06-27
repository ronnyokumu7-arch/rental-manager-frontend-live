"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import apiClient from "@/lib/api-client";
import toast from "react-hot-toast";

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthColors = ["#e2e6f0", "#ef4444", "#f59e0b", "#1e6fba", "#22c55e"];
const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(password);
  const isMatch = confirm.length > 0 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || strength < 3) return;
    
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="text-center">
          <h2 className="text-xl font-bold text-ink mb-2">Invalid Reset Link</h2>
          <p className="text-ink-muted text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/login" className="btn-primary btn">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(145deg, #f8f9fc 0%, #f0f3fb 100%)" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0d1325 0%, #1e2a4a 100%)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e6fba 0%, #64b5f6 100%)" }}>RM</div>
          <span className="text-white font-semibold text-lg tracking-tight">Rental Manager</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-bold leading-tight mb-4 tracking-tight">Secure Your<br/><span style={{ background: "linear-gradient(135deg, #64b5f6, #90caf9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Account.</span></h1>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">Choose a strong password to keep your fleet data safe.</p>
        </div>
        <div className="relative z-10 flex items-center gap-6 text-white/40 text-xs font-medium">
          <div className="flex items-center gap-2"><ShieldCheck size={14} /> 256-bit SSL</div>
          <div className="flex items-center gap-2"><ShieldCheck size={14} /> SOC 2 Compliant</div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e6fba 0%, #64b5f6 100%)" }}>RM</div>
            <span className="text-ink font-semibold text-lg">Rental Manager</span>
          </div>

          {!success ? (
            <>
              <h2 className="text-2xl font-bold text-ink mb-1 tracking-tight">Create new password</h2>
              <p className="text-ink-muted text-sm mb-8">Your new password must be different from previously used passwords.</p>

              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl border text-sm" style={{ background: "#fee2e2", borderColor: "rgba(239,68,68,0.2)", color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      className="input pr-11"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-muted transition-colors" tabIndex={-1}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-1.5 mb-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: i <= strength ? strengthColors[strength] : "#e2e6f0" }} />
                        ))}
                      </div>
                      <p className="text-xs font-medium" style={{ color: strengthColors[strength] }}>
                        {strengthLabels[strength]}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      className={`input pr-11 ${confirm.length > 0 && !isMatch ? "border-danger" : ""}`}
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                    <Lock size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
                  </div>
                  {confirm.length > 0 && !isMatch && (
                    <p className="text-xs text-danger mt-1.5">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isMatch || strength < 3}
                  className="btn-primary btn-lg w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "#dcfce7" }}>
                <CheckCircle2 size={30} style={{ color: "#15803d" }} strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2 tracking-tight">Password Updated</h2>
              <p className="text-ink-muted text-sm mb-8">Your password has been successfully reset. You can now sign in with your new credentials.</p>
              <Link href="/login" className="btn-primary btn inline-flex">Sign in now</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface"><span className="text-ink-muted">Loading...</span></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
