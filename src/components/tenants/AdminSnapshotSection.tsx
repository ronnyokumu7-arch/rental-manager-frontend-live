// src/components/tenants/AdminSnapshotSection.tsx
import { User, Mail, Phone, Shield, AlertCircle, Edit3, Calendar } from 'lucide-react';
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
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Shield size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Administrator Account</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Primary workspace contact</p>
          </div>
        </div>
        
        {/* Premium Outline Button */}
        <button
          onClick={onChangeEmailClick}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all"
        >
          <Edit3 size={14} className="group-hover:rotate-12 transition-transform" /> 
          Update Email
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-5">
        
        {/* Admin Details Grid */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
              <User size={12} /> Full Name
            </label>
            <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
              {tenant.admin_name || '—'}
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
              <Mail size={12} /> Email Address
            </label>
            <p className="text-sm font-semibold text-[var(--color-ink)] break-all">
              {tenant.admin_email || '—'}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
              <Phone size={12} /> Phone Number
            </label>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {tenant.admin_phone || '—'}
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Audit Trail Info */}
        {emailChangeInfo && (
          <div className="pt-4 border-t border-[var(--color-surface-border)]">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-amber-500/90">
                  Last changed: {emailChangeInfo.date} ({emailChangeInfo.daysSince}d ago)
                </p>
                <p className="text-[10px] text-amber-500/70 leading-relaxed">
                  24-hour cooldown enforced between changes for security.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
