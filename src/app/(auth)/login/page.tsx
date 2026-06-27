"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Eye, EyeOff, LogIn, ArrowRight, ArrowLeft, 
  ShieldCheck, Mail, Car, Calendar, TrendingUp, 
  ChevronLeft, ChevronRight 
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

// ── Carousel Data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Car,
    title: "Fleet Management",
    description: "Track mileage, maintenance schedules, and vehicle health in real-time across your entire fleet.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Calendar,
    title: "Smart Bookings",
    description: "Automate reservations, digital contracts, and seamless client onboarding with just a few clicks.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: TrendingUp,
    title: "Financial Insights",
    description: "Real-time revenue tracking, automated invoicing, and deep analytics to scale your agency.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
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

  // ── Carousel Logic ────────────────────────────────────────────────────────
  const nextSlide = useCallback(() => {
    setSlideIndex((prev) => (prev + 1) % FEATURES.length);
  }, []);

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  // ── Form Handlers ─────────────────────────────────────────────────────────
  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorType(null);
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorType(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorType(getErrorType(err));
    } finally {
      setLoading(false);
    }
  };

  const currentFeature = FEATURES[slideIndex];
  const FeatureIcon = currentFeature.icon;

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Left Panel: Interactive Showcase ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-sidebar">
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} 
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-[#1e6fba] to-[#64b5f6] shadow-lg shadow-blue-500/20">
            RM
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Rental Manager</span>
        </div>

        {/* Carousel Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <div className="relative h-64">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === slideIndex;
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-out flex flex-col gap-6 ${
                    isActive 
                      ? "opacity-100 translate-x-0" 
                      : index < slideIndex 
                        ? "opacity-0 -translate-x-12" 
                        : "opacity-0 translate-x-12"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} border border-white/10`}>
                    <Icon size={32} className={feature.iconColor} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
                      {feature.title}
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {FEATURES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setSlideIndex(index); setIsAutoPlaying(false); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === slideIndex ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Skip */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6 text-white/30 text-xs font-medium">
            <div className="flex items-center gap-2"><ShieldCheck size={14} /> 256-bit SSL</div>
            <div className="flex items-center gap-2"><ShieldCheck size={14} /> SOC 2 Compliant</div>
          </div>
          {step === 1 && (
            <button 
              onClick={() => setStep(2)}
              className="text-xs font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              Skip intro <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Right Panel: Auth Flow ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-[#1e6fba] to-[#64b5f6]">
              RM
            </div>
            <span className="text-ink font-semibold text-lg">Rental Manager</span>
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-3xl font-bold text-ink mb-2 tracking-tight">Welcome back</h2>
              <p className="text-ink-muted text-base mb-10">Enter your email to access your dashboard.</p>

              <form onSubmit={handleEmailNext} className="flex flex-col gap-6">
                <div>
                  <label className="label">Email address</label>
                  <div className="relative group">
                    <input
                      type="email"
                      className="input pl-11 h-12 text-base"
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

                <button type="submit" className="btn btn-primary btn-lg w-full h-12 flex items-center justify-center gap-2 text-base">
                  Continue <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-8 group"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Back to email
              </button>
          
              <h2 className="text-3xl font-bold text-ink mb-2 tracking-tight">Enter password</h2>
              <p className="text-ink-muted text-sm mb-2">Signing in as</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-hover border border-surface-border mb-10">
                <div className="w-5 h-5 rounded-full bg-accent-bg text-accent-dark flex items-center justify-center text-[10px] font-bold">
                  {email[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-ink">{email}</span>
              </div>

              {errorType && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-danger-bg border border-danger-border text-danger-text text-sm flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                  {ERROR_MESSAGES[errorType]}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <div>
                  <label className="label">Password</label>
                  <div className="relative group">
                    <input
                      type={showPw ? "text" : "password"}
                      className="input pr-12 h-12 text-base"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPw(!showPw)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end -mt-4">
                  <Link href="/forgot-password" className="text-sm font-medium text-accent-dark hover:text-accent-darker transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full h-12 flex items-center justify-center gap-2 text-base">
                  {loading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <LogIn size={18} /> Sign in securely
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-ink-subtle mt-12">
            Protected by enterprise-grade encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
