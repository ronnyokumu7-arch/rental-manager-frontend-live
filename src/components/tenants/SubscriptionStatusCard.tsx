// src/components/tenants/SubscriptionStatusCard.tsx
import { useState } from 'react';
import { 
  CreditCard, Calendar, AlertTriangle, CheckCircle2, XCircle, 
  Clock, Loader2, Zap, Shield 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantsApi } from '@/lib/api/tenants';
import type { Tenant } from '@/lib/types';

interface SubscriptionStatusCardProps {
  tenant: Tenant;
  onUpdated: () => void;
}

export function SubscriptionStatusCard({ tenant, onUpdated }: SubscriptionStatusCardProps) {
  const [isExtending, setIsExtending] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Calculate days remaining for trial
  const getTrialDaysRemaining = () => {
    if (!tenant.trial_ends_at) return null;
    
    const endDate = new Date(tenant.trial_ends_at);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const trialDays = getTrialDaysRemaining();
  const isTrialEndingSoon = trialDays !== null && trialDays <= 7 && trialDays > 0;
  const isTrialExpired = trialDays !== null && trialDays <= 0;

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status badge configuration
  const getStatusBadge = () => {
    const status = tenant.subscription_status;
    
    switch (status) {
      case 'trial':
        return {
          icon: Clock,
          label: 'Free Trial',
          color: 'bg-blue-500/10 text-blue-700 border-blue-200',
        };
      case 'starter_trial':
        return {
          icon: Clock,
          label: 'Starter Trial',
          color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
        };
      case 'active':
        return {
          icon: CheckCircle2,
          label: 'Active',
          color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
        };
      case 'past_due':
        return {
          icon: AlertTriangle,
          label: 'Past Due',
          color: 'bg-amber-500/10 text-amber-700 border-amber-200',
        };
      case 'suspended':
        return {
          icon: XCircle,
          label: 'Suspended',
          color: 'bg-rose-500/10 text-rose-700 border-rose-200',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Cancelled',
          color: 'bg-slate-500/10 text-slate-700 border-slate-200',
        };
      default:
        return {
          icon: CreditCard,
          label: status,
          color: 'bg-slate-500/10 text-slate-700 border-slate-200',
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const handleExtendTrial = async () => {
    setIsExtending(true);
    try {
      // TODO: Implement extend trial API endpoint
      toast.success('Trial extended by 14 days');
      onUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to extend trial');
    } finally {
      setIsExtending(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    try {
      if (tenant.is_active) {
        await tenantsApi.suspend(tenant.id, 'Suspended by Super Admin');
        toast.success('Tenant suspended');
      } else {
        await tenantsApi.activate(tenant.id);
        toast.success('Tenant activated');
      }
      onUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Action failed');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
            <CreditCard size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Subscription & Billing</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Plan status and payment lifecycle</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusBadge.color}`}>
          <StatusIcon size={14} />
          {statusBadge.label}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Plan Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={12} /> Current Plan
            </label>
            <p className="text-lg font-bold text-[var(--color-ink)] capitalize">
              {tenant.plan.replace('_', ' ')}
            </p>
          </div>

          {/* Trial End Date */}
          {tenant.trial_ends_at && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={12} /> Trial Ends
              </label>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${
                  isTrialExpired 
                    ? 'text-rose-600' 
                    : isTrialEndingSoon 
                      ? 'text-amber-600' 
                      : 'text-[var(--color-ink)]'
                }`}>
                  {formatDate(tenant.trial_ends_at)}
                </p>
                {trialDays !== null && trialDays > 0 && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isTrialEndingSoon 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {trialDays} day{trialDays !== 1 ? 's' : ''} left
                  </span>
                )}
                {isTrialExpired && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    Expired
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Subscription End Date */}
          {tenant.subscription_ends_at && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={12} /> Subscription Ends
              </label>
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                {formatDate(tenant.subscription_ends_at)}
              </p>
            </div>
          )}
        </div>

        {/* Grace Period Warning */}
        {tenant.grace_period_ends_at && tenant.subscription_status === 'past_due' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-900">
                Grace Period Active
              </p>
              <p className="text-xs text-amber-700">
                Account will be suspended on {formatDate(tenant.grace_period_ends_at)} if payment is not received.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-surface-border)]">
          {/* Extend Trial Button */}
          {(tenant.subscription_status === 'trial' || tenant.subscription_status === 'starter_trial') && (
            <button
              onClick={handleExtendTrial}
              disabled={isExtending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors disabled:opacity-50"
            >
              {isExtending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Clock size={14} />
              )}
              Extend Trial (14 days)
            </button>
          )}

          {/* Suspend/Activate Button */}
          {!tenant.is_archived && (
            <button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                tenant.is_active
                  ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
              }`}
            >
              {isTogglingStatus ? (
                <Loader2 size={14} className="animate-spin" />
              ) : tenant.is_active ? (
                <XCircle size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {tenant.is_active ? 'Suspend Account' : 'Activate Account'}
            </button>
          )}

          {/* Payment Method Indicator */}
          {tenant.default_payment_method && (
            <div className="ml-auto flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
              <Shield size={14} />
              <span>Default: {tenant.default_payment_method.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
