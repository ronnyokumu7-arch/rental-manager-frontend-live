// src/components/tenants/BusinessIdentitySection.tsx
import { useState } from 'react';
import { Building2, Mail, Phone, Hash, MapPin, Edit3, Save, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantsApi } from '@/lib/api/tenants';
import type { Tenant } from '@/lib/types';

interface BusinessIdentitySectionProps {
  tenant: Tenant;
  onUpdated: () => void; // Triggers the parent hook to refetch data
}

export function BusinessIdentitySection({ tenant, onUpdated }: BusinessIdentitySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for editable fields
  const [formData, setFormData] = useState({
    name: tenant.name,
    email: tenant.email,
    phone_number: tenant.phone_number || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await tenantsApi.update(tenant.id, formData);
      toast.success('Business identity updated successfully');
      setIsEditing(false);
      onUpdated(); // Refresh parent data
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update business identity');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: tenant.name,
      email: tenant.email,
      phone_number: tenant.phone_number || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Business Identity</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Core company details and contact information</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-colors disabled:opacity-50"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-colors"
            >
              <Edit3 size={14} /> Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Section Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Building2 size={12} /> Company Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">{tenant.name}</p>
          )}
        </div>

        {/* Primary Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={12} /> Primary Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">{tenant.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={12} /> Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">{tenant.phone_number || '—'}</p>
          )}
        </div>

        {/* KRA PIN (Read-only for now) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Hash size={12} /> KRA PIN
          </label>
          <p className="text-sm font-medium text-[var(--color-ink)] py-2">
            {tenant.profile?.tax_number || '—'}
          </p>
        </div>

        {/* Business Location (Read-only for now) */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={12} /> Business Location
          </label>
          <p className="text-sm font-medium text-[var(--color-ink)] py-2">
            {tenant.profile?.address || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
