// src/app/dashboard/settings/roles/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Check, Loader2, ArrowLeft, Sparkles,
  LayoutDashboard, Users, Car, CalendarDays, Wallet, Settings
} from "lucide-react";
import toast from "react-hot-toast";

import { roleTemplatesApi } from "@/lib/api/roleTemplates";
import type { RoleTemplate } from "@/lib/types";

// Map category names to short labels and icons for the sub-tabs
const CATEGORY_CONFIG: Record<string, { label: string; icon: any }> = {
  "Dashboard & General": { label: "General", icon: LayoutDashboard },
  "Client Management": { label: "Clients", icon: Users },
  "Fleet & Vehicles": { label: "Fleet", icon: Car },
  "Bookings & Contracts": { label: "Bookings", icon: CalendarDays },
  "Financials": { label: "Financials", icon: Wallet },
  "Team & Settings": { label: "Team & System", icon: Settings },
};

export default function RolesPermissionsPage() {
  const router = useRouter();
  const [matrix, setMatrix] = useState<Record<string, any[]>>({});
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [activePermissions, setActivePermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [matrixData, templatesData] = await Promise.all([
          roleTemplatesApi.getMatrix(),
          roleTemplatesApi.list(),
        ]);
        setMatrix(matrixData);
        setTemplates(templatesData);

        if (templatesData.length > 0 && !selectedRole) {
          const firstRole = templatesData[0].job_title;
          setSelectedRole(firstRole);
          setActivePermissions(new Set(templatesData[0].permissions));
        }
        
        const firstCategory = Object.keys(matrixData)[0];
        if (firstCategory && !activeCategoryTab) {
          setActiveCategoryTab(firstCategory);
        }
      } catch (error) {
        toast.error("Failed to load permission settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectRole = (jobTitle: string) => {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to switch roles?")) return;
    }
    setSelectedRole(jobTitle);
    const template = templates.find((t) => t.job_title === jobTitle);
    setActivePermissions(new Set(template?.permissions || []));
    setHasChanges(false);
  };

  const togglePermission = (key: string) => {
    setActivePermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
    setHasChanges(true);
  };

  const toggleCategory = (permissions: { key: string }[]) => {
    const allSelected = permissions.every((p) => activePermissions.has(p.key));
    setActivePermissions((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => {
        if (allSelected) newSet.delete(p.key);
        else newSet.add(p.key);
      });
      return newSet;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    const template = templates.find((t) => t.job_title === selectedRole);
    if (!template) return;

    setSaving(true);
    try {
      const updated = await roleTemplatesApi.update(template.id, Array.from(activePermissions));
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setHasChanges(false);
      toast.success(`Permissions for "${selectedRole}" updated successfully!`);
    } catch (error) {
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const currentPermissions = activeCategoryTab ? matrix[activeCategoryTab] || [] : [];
  const allSelected = currentPermissions.every((p: any) => activePermissions.has(p.key));
  const someSelected = currentPermissions.some((p: any) => activePermissions.has(p.key));
  const ActiveIcon = activeCategoryTab ? (CATEGORY_CONFIG[activeCategoryTab]?.icon || Settings) : Settings;

  return (
    <div className="space-y-6 pb-24">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Shield size={20} />
            </div>
            Roles & Permissions
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Define what each team member can see and do based on their job title.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] shadow-sm transition-all w-fit"
        >
          <ArrowLeft size={16} /> Back to Settings
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* ─ LEFT PANEL: Role Selector ─────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-2">
                <Sparkles size={12} className="text-[var(--color-primary)]" /> Team Roles
              </h3>
            </div>
            {/* ✅ REDUCED HEIGHT: Mathematically calculated to prevent full-page scroll */}
            <div className="p-2 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
              {templates.length === 0 ? (
                <div className="p-4 text-center text-sm text-[var(--color-ink-muted)]">
                  No roles created yet.
                </div>
              ) : (
                <ul className="space-y-1">
                  {templates.map((template) => {
                    const isActive = selectedRole === template.job_title;
                    return (
                      <li key={template.id}>
                        <button
                          onClick={() => handleSelectRole(template.job_title)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                            isActive
                              ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)] shadow-sm"
                              : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive ? "bg-[var(--color-slate)]/20 text-[var(--color-primary)]" : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                          }`}>
                            <Shield size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">{template.job_title}</p>
                            <p className="text-[11px] text-[var(--color-ink-muted)] truncate">
                              {template.permissions.length} permissions
                            </p>
                          </div>
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Permission Matrix ────────────────────────────── */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {selectedRole ? (
            <>
              {/* Category Sub-Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
                {Object.keys(matrix).map((catName) => {
                  const config = CATEGORY_CONFIG[catName] || { label: catName, icon: Settings };
                  const Icon = config.icon;
                  const isActiveTab = activeCategoryTab === catName;
                  return (
                    <button
                      key={catName}
                      onClick={() => setActiveCategoryTab(catName)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        isActiveTab
                          ? "bg-[var(--color-primary)] text-white shadow-sm"
                          : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                      }`}
                    >
                      <Icon size={14} />
                      {config.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Category Content */}
              {activeCategoryTab && matrix[activeCategoryTab] && (
                <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-200">
                  
                  {/* Category Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                        <ActiveIcon size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--color-ink)]">{activeCategoryTab}</h3>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                          {currentPermissions.filter((p: any) => activePermissions.has(p.key)).length} of {currentPermissions.length} enabled
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCategory(currentPermissions)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        allSelected
                          ? "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-border)]"
                          : "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary)] hover:text-white"
                      }`}
                    >
                      {allSelected ? "Deselect All" : someSelected ? "Select Remaining" : "Select All"}
                    </button>
                  </div>

                  {/* Permissions Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {currentPermissions.map((perm: any) => {
                      const isEnabled = activePermissions.has(perm.key);
                      return (
                        <div
                          key={perm.key}
                          className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-[var(--color-surface-hover)]/50 transition-colors group"
                        >
                          <label className="flex-1 cursor-pointer select-none" onClick={() => togglePermission(perm.key)}>
                            <p className={`text-sm font-medium transition-colors ${isEnabled ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"}`}>
                              {perm.label}
                            </p>
                          </label>
                          {/* Premium Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => togglePermission(perm.key)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] ${
                              isEnabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-border)]"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center mb-4">
                <Shield size={28} className="text-[var(--color-ink-muted)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">Select a Role</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">Choose a role from the left to configure its permissions.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─ STICKY SAVE BAR ─────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          hasChanges ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-surface-border)] shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-pulse" />
              <p className="text-sm font-medium text-[var(--color-ink)]">
                You have unsaved changes for <span className="font-bold text-[var(--color-primary)]">{selectedRole}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const template = templates.find((t) => t.job_title === selectedRole);
                  setActivePermissions(new Set(template?.permissions || []));
                  setHasChanges(false);
                }}
                className="px-4 py-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl shadow-[var(--shadow-md)] transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
