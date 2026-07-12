// src/components/tenants/AdminSnapshotSection.tsx
import { useState } from 'react';
import { User, Mail, Phone, Shield, AlertCircle, Edit3 } from 'lucide-react';
import type { Tenant } from '@/lib/types';

interface AdminSnapshotSectionProps {
  tenant: Tenant;
  onChangeEmailClick: () => void;
}

export function AdminSnapshotSection({ tenant, onChangeEmailClick }: AdminSnapshotSectionProps) {
  // Calculate days since last email change
  const getEmailChangeInfo = () => {
    if (!tenant.admin_email_changed_at) return null;
    
    const changeDate = new Date(tenant.admin_email_changed_at);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      date: changeDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      daysSince,
    };
  };

  const emailChangeInfo = getEmailChangeInfo();

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Administrator Account</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Primary contact for this agency workspace</p>
          </div>
        </div>
        
        {/* Action Button */}
        <button
          onClick={onChangeEmailClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors"
        >
          <Edit3 size={14} /> Change Admin Email
        </button>
      </div>

      {/* Section Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} /> Full Name
            </label>
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">
              {tenant.admin_name || '—'}
            </p>
          </div>

          {/* Admin Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={12} /> Email Address
            </label>
            <p className="text-sm font-medium text-[var(--color-ink)] py-2 break-all">
              {tenant.admin_email || '—'}
            </p>
          </div>

          {/* Admin Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={12} /> Phone Number
            </label>
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">
              {tenant.admin_phone || '—'}
            </p>
          </div>
        </div>

        {/* Email Change Audit Info */}
        {emailChangeInfo && (
          <div className="mt-6 pt-6 border-t border-[var(--color-surface-border)]">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-900">
                  Last email change: {emailChangeInfo.date} ({emailChangeInfo.daysSince} day{emailChangeInfo.daysSince !== 1 ? 's' : ''} ago)
                </p>
                <p className="text-xs text-amber-700">
                  Admin email changes are logged for security compliance. A 24-hour cooldown is enforced between changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
