// src/components/tenants/ChangeAdminEmailModal.tsx
import { useState } from 'react';
import { Shield, Mail, Phone, UserCheck, Loader2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantsApi } from '@/lib/api/tenants';
import type { ChangeAdminEmailPayload } from '@/lib/api/tenants';

interface ChangeAdminEmailModalProps {
  tenantId: number | string;
  currentAdminEmail: string;
  currentAdminPhone?: string | null;
  onClose: () => void;
  onSuccess: () => void; // Triggers parent refetch
}

type VerificationMethod = 'email' | 'phone' | 'manual_override';

export function ChangeAdminEmailModal({
  tenantId,
  currentAdminEmail,
  currentAdminPhone,
  onClose,
  onSuccess,
}: ChangeAdminEmailModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [method, setMethod] = useState<VerificationMethod>('email');
  const [reason, setReason] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isManualOverride = method === 'manual_override';
  const canSubmit = 
    newEmail.length > 0 && 
    reason.length >= 10 && 
    (isManualOverride || otp.length === 6) &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      const payload: ChangeAdminEmailPayload = {
        new_email: newEmail,
        verification_method: method,
        reason,
        otp: isManualOverride ? undefined : otp,
      };

      await tenantsApi.changeAdminEmail(tenantId, payload);
      toast.success('Admin email updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update admin email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--color-surface-border)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-ink)]">Update Email</h3>
              <p className="text-xs text-[var(--color-ink-muted)]">High-security action • Audit logged</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Current vs New Email Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              <span className="text-xs font-medium text-[var(--color-ink-muted)] uppercase">Current Admin Email</span>
              <span className="text-sm font-medium text-[var(--color-ink)]">{currentAdminEmail}</span>
            </div>
            
            <div>
              <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5 block">
                New Admin Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@newdomain.com"
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Verification Method Selector */}
          <div>
            <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-2 block">
              Verification Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'email' as const, label: 'Email', icon: Mail, disabled: false },
                { id: 'phone' as const, label: 'SMS', icon: Phone, disabled: !currentAdminPhone },
                { id: 'manual_override' as const, label: 'Manual', icon: UserCheck, disabled: false },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = method === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => setMethod(opt.id)}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all
                      ${isSelected 
                        ? 'border-amber-500 bg-amber-50 text-amber-700' 
                        : opt.disabled 
                          ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 text-[var(--color-ink-subtle)] cursor-not-allowed opacity-50'
                          : 'border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-subtle)]'}
                    `}
                  >
                    <Icon size={16} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* OTP Input (Conditional) */}
          {!isManualOverride && (
            <div>
              <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5 block">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                required
              />
              <p className="text-[10px] text-[var(--color-ink-subtle)] mt-1">
                Sent to {method === 'email' ? currentAdminEmail : currentAdminPhone}
              </p>
            </div>
          )}

          {/* Mandatory Reason */}
          <div>
            <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5 block">
              Justification (Required for audit)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this change is necessary (min 10 characters)..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
              required
              minLength={10}
            />
          </div>

          {/* Security Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200">
            <AlertTriangle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-700 leading-relaxed">
              This action will immediately change the primary login email. A notification will be sent to the old contact channel. A 24-hour cooldown will be enforced.
            </p>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {isLoading ? 'Processing...' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  );
}
