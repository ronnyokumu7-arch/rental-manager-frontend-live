"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Eye, EyeOff, LogIn, ArrowRight, ArrowLeft, 
  ShieldCheck, Mail, Car, Calendar, TrendingUp, 
  ChevronLeft, ChevronRight, Sparkles, CheckCircle2,
  Activity, FileText, Lock
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";

// ── Types & Helpers ─────────────────────────────────────────────────────────
type ErrorType = "invalid_credentials" | "suspended" | "inactive" | "unknown";

function getErrorType(error: unknown): ErrorType {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || "";
    if (status === 401) return "invalid_credentials";
    if (status === 403 && detail.toLowerCase().includes("suspended")) return "suspended";
    if (status === 403) return "inactive";
  }
  return "unknown";
}

const ERROR_MESSAGES: Record<ErrorType, string> = {
  invalid_credentials: "Incorrect email or password. Please try again.",
  suspended: "Your account has been suspended. Contact your administrator.",
  inactive: "Your account is inactive. Contact your administrator.",
  unknown: "Something went wrong. Please try again.",
};

// ── Carousel Features Data ───────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Car,
    badge: "Fleet Intelligence",
    title: "Real-Time Fleet Operations",
    description: "Monitor mileage, active status, telematics, and maintenance schedules across all vehicles seamlessly.",
    gradient: "from-blue-500 via-indigo-500 to-cyan-400",
    glowColor: "rgba(59, 130, 246, 0.25)",
    iconColor: "text-blue-400",
    renderMockup: () => (
      <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-700" />
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Car size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Selected Vehicle</p>
              <p className="text-sm font-semibold text-white">Porsche Taycan 4S • #309</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] font-medium text-slate-400">Battery / Fuel</p>
            <p className="text-base font-bold text-white mt-0.5">94%</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] font-medium text-slate-400">Health Index</p>
            <p className="text-base font-bold text-emerald-400 mt-0.5">Optimal</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] font-medium text-slate-400">Odometer</p>
            <p className="text-base font-bold text-white mt-0.5">14,280 km</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Calendar,
    badge: "Automated Workflows",
    title: "Smart Digital Bookings",
    description: "Automate driver verification, electronic contract sign-offs, and instant client check-in workflows.",
    gradient: "from-emerald-500 via-teal-500 to-cyan-400",
    glowColor: "rgba(16, 185, 129, 0.25)",
    iconColor: "text-emerald-400",
    renderMockup: () => (
      <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Rental Contract #RC-8841</p>
              <p className="text-xs text-slate-400">Digital Execution Complete</p>
            </div>
          </div>
          <CheckCircle2 size={20} className="text-emerald-400" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs py-2 px-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-slate-400">Driver Verification</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck size={12} /> Verified
            </span>
          </div>
          <div className="flex items-center justify-between text-xs py-2 px-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-slate-400">Deposit Authorization</span>
            <span className="text-white font-medium">$1,500.00 Hold</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: TrendingUp,
    badge: "Financial Analytics",
    title: "Actionable Revenue Insights",
    description: "Deep analytics, automated billing, and live profitability reporting designed for scaling your agency.",
    gradient: "from-purple-500 via-violet-500 to-pink-500",
    glowColor: "rgba(168, 85, 247, 0.25)",
    iconColor: "text-purple-400",
    renderMockup: () => (
      <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-700" />
        <div className="flex items-center justify-between pb-3">
          <div>
            <p className="text-xs font-medium text-slate-400">Monthly Revenue</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-bold text-white">$128,450</p>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                +24.8% <TrendingUp size={12} className="ml-0.5" />
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Activity size={18} />
          </div>
        </div>
        {/* Simple Animated Visual Bar Chart */}
        <div className="flex items-end gap-2 h-16 pt-2">
          {[40, 65, 55, 80, 70, 90, 100].map((height, i) => (
            <div key={i} className="flex-1 bg-white/5 rounded-t-sm h-full flex items-end">
              <div 
                className="w-full bg-gradient-to-t from-purple-500 to-violet-400 rounded-t-sm transition-all duration-1000 ease-out" 
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  
  // Carousel State
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Login State
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  // ── Carousel Controls ──────────────────────────────────────────────────────
  const nextSlide = useCallback(() => {
    setSlideIndex((prev) => (prev + 1) % FEATURES.length);
  }, []);

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  // ── Form Handlers ─────────────────────────────────────────────────────────
  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorType(null);
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorType(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (_err) {
      setErrorType(getErrorType(_err));
    } finally {
      setLoading(false);
    }
  };

  const currentFeature = FEATURES[slideIndex];

  return (
    <div className="min-h-screen flex bg-surface selection:bg-blue-500 selection:text-white">
      {/* ── Left Panel: Interactive Visual Showcase ─────────────────────────── */}
      <div 
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden bg-slate-950 text-white"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Dynamic Background Ambient Lighting */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-out opacity-40 blur-[120px] pointer-events-none"
          style={{ background: `radial-gradient(circle at 40% 40%, ${currentFeature.glowColor}, transparent 60%)` }}
        />

        {/* Subtle Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} 
        />

        {/* Header / Brand Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-[#1e6fba] to-[#64b5f6] shadow-lg shadow-blue-500/25 border border-white/20">
              RM
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">Rental Manager</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md">
            <Sparkles size={13} className="text-blue-400" /> Enterprise Edition
          </div>
        </div>

        {/* Carousel Showcase Content */}
        <div className="relative z-10 my-auto py-8 max-w-lg mx-auto w-full">
          {/* Animated Feature Mockup Card */}
          <div className="mb-8 min-h-[170px] flex items-center">
            {currentFeature.renderMockup()}
          </div>

          {/* Text Content Fade Slide */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold tracking-wide uppercase text-blue-300">
              {currentFeature.badge}
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              {currentFeature.title}
            </h2>

            <p className="text-slate-400 text-base leading-relaxed">
              {currentFeature.description}
            </p>
          </div>

          {/* Carousel Pagination & Controls */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
            {/* Indicators with Animated Auto-Timer Progress */}
            <div className="flex items-center gap-2">
              {FEATURES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setSlideIndex(index); setIsAutoPlaying(false); }}
                  className={`h-2 rounded-full transition-all duration-500 relative overflow-hidden ${
                    index === slideIndex ? "w-10 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index === slideIndex && isAutoPlaying && (
                    <span className="absolute inset-0 bg-blue-400 animate-[progress_6s_linear_infinite]" />
                  )}
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={prevSlide}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Compliance Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6 text-slate-400 text-xs font-medium">
            <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-blue-400" /> 256-bit SSL</div>
            <div className="flex items-center gap-2"><Lock size={14} className="text-emerald-400" /> SOC 2 Compliant</div>
          </div>
          {step === 1 && (
            <button 
              onClick={() => setStep(2)}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
            >
              Skip intro <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* ── Right Panel: Authentication Form ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Header / Branding */}
          <div className="flex items-center gap-3 lg:hidden mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-[#1e6fba] to-[#64b5f6] shadow-md">
              RM
            </div>
            <span className="text-ink font-semibold text-xl tracking-tight">Rental Manager</span>
          </div>

          {/* ── Step 1: Email Input ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-3xl font-bold text-ink tracking-tight">Welcome back</h1>
                <p className="text-ink-muted text-base mt-2">Sign in to your dashboard to manage your fleet.</p>
              </div>

              <form onSubmit={handleEmailNext} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                    Email address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface border border-surface-border text-ink focus:border-accent-dark focus:ring-2 focus:ring-accent-dark/20 outline-none transition-all text-base placeholder:text-ink-subtle"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle group-focus-within:text-accent-dark transition-colors" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={!email}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1e6fba] to-[#2563eb] hover:from-[#185896] hover:to-[#1d4ed8] text-white font-medium text-base shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* ── Step 2: Password Input & Verification ────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrorType(null); }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors mb-4 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  Change email
                </button>
                <h1 className="text-3xl font-bold text-ink tracking-tight">Enter password</h1>
                <p className="text-ink-muted text-sm mt-1.5 flex items-center gap-1.5">
                  Signing in as <span className="font-semibold text-ink">{email}</span>
                </p>
              </div>

              {/* Error Alert */}
              {errorType && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium flex items-start gap-3 animate-in fade-in duration-200">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    !
                  </div>
                  <div>
                    <p className="font-semibold">Authentication Error</p>
                    <p className="text-xs text-rose-500/90 mt-0.5">{ERROR_MESSAGES[errorType]}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Password
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs font-medium text-accent-dark hover:underline transition-all"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPw ? "text" : "password"}
                      className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface border border-surface-border text-ink focus:border-accent-dark focus:ring-2 focus:ring-accent-dark/20 outline-none transition-all text-base placeholder:text-ink-subtle"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle group-focus-within:text-accent-dark transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors focus:outline-none"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1e6fba] to-[#2563eb] hover:from-[#185896] hover:to-[#1d4ed8] text-white font-medium text-base shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In <LogIn size={18} />
                    </span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── Help / Support Footer ────────────────────────────────────── */}
          <div className="pt-4 border-t border-surface-border text-center text-xs text-ink-muted">
            Need help accessing your account?{" "}
            <a href="mailto:support@company.com" className="font-semibold text-accent-dark hover:underline">
              Contact Support
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
