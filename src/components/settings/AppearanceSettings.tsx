// src/components/settings/AppearanceSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { Monitor, Sun, Moon, Layout, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { userPreferencesApi, type UserPreferences } from "@/lib/api/user-preferences";

export default function AppearanceSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "system",
    density: "comfortable",
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await userPreferencesApi.get();
        setPreferences(data);
        applyTheme(data.theme);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Failed to load preferences");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const applyTheme = (theme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  };

  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    setIsSaving(true);
    try {
      await userPreferencesApi.update({ theme });
      setPreferences((prev) => ({ ...prev, theme }));
      applyTheme(theme);
      toast.success("Theme updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update theme");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDensityChange = async (density: "comfortable" | "compact") => {
    setIsSaving(true);
    try {
      await userPreferencesApi.update({ density });
      setPreferences((prev) => ({ ...prev, density }));
      toast.success("Density updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update density");
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
    <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
      
      {/* Theme Selection */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-6">
        <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">Theme</h3>
        <p className="text-sm text-[var(--color-ink-muted)] mb-6">
          Choose how Rental Manager looks across all your devices.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["light", "dark", "system"] as const).map((t) => {
            const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
            const isActive = preferences.theme === t;
            return (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`group relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-surface-border)] hover:border-[var(--color-surface-border-strong)]"
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                }`}>
                  <Icon size={24} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold capitalize ${isActive ? "text-[var(--color-primary-text)]" : "text-[var(--color-ink)]"}`}>
                    {t}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    {t === "system" ? "Follow device settings" : `Always ${t} mode`}
                  </p>
                </div>
                {isActive && (
                  <div className="absolute top-3 right-3 text-[var(--color-primary)]">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Density Selection */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-6">
        <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">Density</h3>
        <p className="text-sm text-[var(--color-ink-muted)] mb-6">
          Control the spacing and size of UI elements.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["comfortable", "compact"] as const).map((d) => {
            const isActive = preferences.density === d;
            return (
              <button
                key={d}
                onClick={() => handleDensityChange(d)}
                className={`group relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-surface-border)] hover:border-[var(--color-surface-border-strong)]"
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                }`}>
                  <Layout size={24} className={d === "compact" ? "rotate-90" : ""} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-semibold capitalize ${isActive ? "text-[var(--color-primary-text)]" : "text-[var(--color-ink)]"}`}>
                    {d}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    {d === "comfortable" ? "More spacing, relaxed layout" : "Denser layout, more content"}
                  </p>
                </div>
                {isActive && (
                  <div className="text-[var(--color-primary)]">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Saving Indicator */}
      {isSaving && (
        <div className="fixed bottom-6 right-6 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] px-4 py-3 flex items-center gap-3 animate-in slide-in-from-bottom-2 z-50">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
          <span className="text-sm font-medium text-[var(--color-ink)]">Saving preferences...</span>
        </div>
      )}
    </div>
  );
}
