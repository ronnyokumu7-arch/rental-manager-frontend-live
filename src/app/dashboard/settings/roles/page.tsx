"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, Check, Loader2, ArrowLeft, Sparkles, 
  LayoutDashboard, Users, Car, CalendarDays, Wallet, Settings 
} from "lucide-react";
import toast from "react-hot-toast";
import { roleTemplatesApi } from "@/lib/api/roleTemplates";
import type { PermissionCategory, RoleTemplate } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

// Map category names to icons for the premium feel
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Dashboard & General": LayoutDashboard,
  "Client Management": Users,
  "Fleet & Vehicles": Car,
  "Bookings & Contracts": CalendarDays,
  "Financials": Wallet,
  "Team & Settings": Settings,
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

  // Initial Data Fetch
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
        
        // Auto-select the first role if available
        if (templatesData.length > 0 && !selectedRole) {
          const firstRole = templatesData[0].job_title;
          setSelectedRole(firstRole);
          setActivePermissions(new Set(templatesData[0].permissions));
        }
      } catch (error) {
        toast.error("Failed to load permission settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Role Selection
  const handleSelectRole = (jobTitle: string) => {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to switch roles?")) return;
    }
    
    setSelectedRole(jobTitle);
    const template = templates.find((t) => t.job_title === jobTitle);
    setActivePermissions(new Set(template?.permissions || []));
    setHasChanges(false);
  };

  // Toggle Permission
  const togglePermission = (key: string) => {
    setActivePermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
    setHasChanges(true);
  };

  // Toggle Entire Category
  const toggleCategory = (permissions: { key: string }[]) => {
    const allSelected = permissions.every((p) => activePermissions.has(p.key));
    setActivePermissions((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => {
        if (allSelected) {
          newSet.delete(p.key);
        } else {
          newSet.add(p.key);
        }
      });
      return newSet;
    });
    setHasChanges(true);
  };

  // Save Changes
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

  // Get current template ID
  const currentTemplateId = templates.find((t) => t.job_title === selectedRole)?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Define what each team member can see and do based on their job title."
        icon={Shield}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Roles & Permissions" },
        ]}
        actions={[
          {
            label: "Back to Settings",
            icon: ArrowLeft,
            variant: "secondary",
            onClick: () => router.push("/dashboard/settings"),
          },
        ]}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* ── LEFT PANEL: Role Selector ─────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-3">
          <SectionCard className="!p-0 overflow-hidden sticky top-20">
            <div className="px-5 py-4 border-b border-surface-border bg-surface-hover/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-2">
                <Sparkles size={12} className="text-blue-500" /> Team Roles
              </h3>
            </div>
            <div className="p-2 max-h-[calc(100vh-250px)] overflow-y-auto">
              {templates.length === 0 ? (
                <div className="p-4 text-center text-sm text-ink-muted">
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
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm"
                              : "text-ink hover:bg-surface-hover"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive ? "bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400" : "bg-surface-hover text-ink-muted group-hover:bg-white dark:group-hover:bg-slate-800"
                          }`}>
                            <Shield size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">{template.job_title}</p>
                            <p className="text-[11px] text-ink-muted truncate">
                              {template.permissions.length} permissions
                            </p>
                          </div>
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT PANEL: Permission Matrix ────────────────────────────── */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {selectedRole ? (
            <>
              {Object.entries(matrix).map(([categoryName, permissions]) => {
                const Icon = CATEGORY_ICONS[categoryName] || Settings;
                const allSelected = permissions.every((p: any) => activePermissions.has(p.key));
                const someSelected = permissions.some((p: any) => activePermissions.has(p.key));

                return (
                  <SectionCard key={categoryName} className="!p-0 overflow-hidden">
                    {/* Category Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface-hover/30">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-surface-border flex items-center justify-center text-ink-muted shadow-sm">
                          <Icon size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-ink">{categoryName}</h3>
                          <p className="text-xs text-ink-muted">
                            {permissions.filter((p: any) => activePermissions.has(p.key)).length} of {permissions.length} enabled
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCategory(permissions)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          allSelected
                            ? "bg-slate-100 dark:bg-slate-800 text-ink-muted hover:bg-slate-200 dark:hover:bg-slate-700"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        }`}
                      >
                        {allSelected ? "Deselect All" : someSelected ? "Select Remaining" : "Select All"}
                      </button>
                    </div>

                    {/* Permissions Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {permissions.map((perm: any) => {
                        const isEnabled = activePermissions.has(perm.key);
                        return (
                          <div
                            key={perm.key}
                            className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-surface-hover/50 transition-colors group"
                          >
                            <label className="flex-1 cursor-pointer select-none" onClick={() => togglePermission(perm.key)}>
                              <p className={`text-sm font-medium transition-colors ${isEnabled ? "text-ink" : "text-ink-muted"}`}>
                                {perm.label}
                              </p>
                            </label>
                            
                            {/* Premium Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => togglePermission(perm.key)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isEnabled ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
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
                  </SectionCard>
                );
              })}
            </>
          ) : (
            <SectionCard className="flex flex-col items-center justify-center py-20 text-center">
              <Shield className="w-12 h-12 text-ink-subtle mb-4" />
              <h3 className="text-lg font-bold text-ink">Select a Role</h3>
              <p className="text-sm text-ink-muted mt-1">Choose a role from the left to configure its permissions.</p>
            </SectionCard>
          )}
        </div>
      </div>

      {/* ── STICKY SAVE BAR ─────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          hasChanges ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-surface-border shadow-2xl shadow-slate-900/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-sm font-medium text-ink">
                You have unsaved changes for <span className="font-bold text-blue-600">{selectedRole}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const template = templates.find((t) => t.job_title === selectedRole);
                  setActivePermissions(new Set(template?.permissions || []));
                  setHasChanges(false);
                }}
                className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
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
