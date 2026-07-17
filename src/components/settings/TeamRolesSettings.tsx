// src/components/settings/TeamRolesSettings.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { ShieldCheck, Loader2, Save, CheckCircle2, Plus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { roleTemplatesApi, type RoleTemplate, type PermissionMatrix } from "@/lib/api/role-templates";

export default function TeamRolesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [activePermissions, setActivePermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // 1. Fetch Data
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
        
        if (templatesData.length > 0) {
          setSelectedRoleId(templatesData[0].id);
          setActivePermissions(new Set(templatesData[0].permissions));
        }
      } catch (error) {
        toast.error("Failed to load role settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Handle Role Selection
  const handleSelectRole = (roleId: number) => {
    if (hasChanges) {
      if (!confirm("You have unsaved permission changes. Switch roles anyway?")) return;
    }
    setSelectedRoleId(roleId);
    const template = templates.find((t) => t.id === roleId);
    setActivePermissions(new Set(template?.permissions || []));
    setHasChanges(false);
  };

  // 3. Handle Permission Toggles
  const togglePermission = (key: string) => {
    setActivePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setHasChanges(true);
  };

  const toggleCategory = (category: string) => {
    const categoryPerms = matrix[category]?.map(p => p.key) || [];
    const allSelected = categoryPerms.every(k => activePermissions.has(k));
    
    setActivePermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        categoryPerms.forEach(k => next.delete(k));
      } else {
        categoryPerms.forEach(k => next.add(k));
      }
      return next;
    });
    setHasChanges(true);
  };

  // 4. Save Changes
  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      await roleTemplatesApi.update(selectedRoleId, { permissions: Array.from(activePermissions) });
      setTemplates((prev) =>
        prev.map((t) => (t.id === selectedRoleId ? { ...t, permissions: Array.from(activePermissions) } : t))
      );
      setHasChanges(false);
      toast.success("Role permissions updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-300">
      {/* LEFT PANEL: Role Selector */}
      <div className="col-span-12 lg:col-span-3">
        <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden sticky top-6">
          <div className="px-5 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-2">
              <Sparkles size={12} className="text-[var(--color-primary)]" /> Team Roles
            </h3>
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {templates.length === 0 ? (
              <div className="p-4 text-center text-sm text-[var(--color-ink-muted)]">No roles created yet.</div>
            ) : (
              <ul className="space-y-1">
                {templates.map((template) => {
                  const isActive = selectedRoleId === template.id;
                  return (
                    <li key={template.id}>
                      <button
                        onClick={() => handleSelectRole(template.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isActive
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-text)] border border-[var(--color-primary)]/20"
                            : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] border border-transparent"
                        }`}
                      >
                        <ShieldCheck size={16} className={isActive ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"} />
                        <span className="text-sm font-medium truncate">{template.job_title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="p-3 border-t border-[var(--color-surface-border)]">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all">
              <Plus size={14} /> Add New Role
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Permission Matrix */}
      <div className="col-span-12 lg:col-span-9 space-y-6">
        {selectedRoleId ? (
          <>
            <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-ink)]">
                    Permissions for {templates.find(t => t.id === selectedRoleId)?.job_title}
                  </h3>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                    Control exactly what this role can view, create, edit, and delete across the platform.
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[var(--shadow-md)]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : hasChanges ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {saving ? "Saving..." : hasChanges ? "Save Changes" : "All Saved"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(matrix).map(([category, permissions]) => {
                  const categoryKeys = permissions.map(p => p.key);
                  const selectedCount = categoryKeys.filter(k => activePermissions.has(k)).length;
                  const allSelected = selectedCount === categoryKeys.length;
                  const someSelected = selectedCount > 0 && !allSelected;

                  return (
                    <div key={category} className="bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-[var(--color-ink)]">{category}</h4>
                        <button 
                          onClick={() => toggleCategory(category)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${
                            allSelected 
                              ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]" 
                              : "bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          {allSelected ? "All Granted" : someSelected ? `${selectedCount}/${categoryKeys.length}` : "None"}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {permissions.map((perm) => (
                          <label key={perm.key} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={activePermissions.has(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="w-4 h-4 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 bg-[var(--color-surface)]"
                            />
                            <span className="text-sm text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors">
                              {perm.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-[var(--color-ink-subtle)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">No Role Selected</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">Select a role from the left panel to edit its permissions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
