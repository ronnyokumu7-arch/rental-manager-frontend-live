// src/components/tenants/GatewayConfigModal.tsx
import { useState } from 'react';
import { 
  CreditCard, Smartphone, Building2, DollarSign, X, Loader2, 
  CheckCircle2, AlertTriangle, Eye, EyeOff, Zap, ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantsApi } from '@/lib/api/tenants';
import type { PaymentGatewayConfig } from '@/lib/api/tenants';

interface GatewayConfigModalProps {
  tenantId: number | string;
  gatewayType?: string;
  existingConfig?: PaymentGatewayConfig | null;
  onClose: () => void;
  onSuccess: () => void;
}

const GATEWAY_META: Record<string, { 
  icon: any; 
  color: string; 
  bg: string; 
  title: string; 
  description: string; 
  requirements: string[] 
}> = {
  mpesa: {
    icon: Smartphone,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'M-Pesa Daraja API',
    description: 'Integrate Safaricom\'s Lipa Na M-Pesa Online (STK Push) for seamless mobile money collections.',
    requirements: ['Daraja Developer Account', 'Production Credentials', 'B2C Shortcode'],
  },
  airtel_money: {
    icon: Smartphone,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    title: 'Airtel Money OpenAPI',
    description: 'Accept payments directly from Airtel Money wallets via USSD and App push notifications.',
    requirements: ['Merchant API Key', 'Service Provider Code', 'Callback URL'],
  },
  bank: {
    icon: Building2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Direct Bank Transfer',
    description: 'Manual reconciliation mode for agencies accepting direct deposits or RTGS transfers.',
    requirements: ['Bank Statement Access', 'Reconciliation Workflow', 'Branch Details'],
  },
  stripe: {
    icon: CreditCard,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'Stripe Payments',
    description: 'Global card processing with support for Visa, Mastercard, and Apple Pay.',
    requirements: ['Stripe Dashboard Access', 'Webhook Endpoint', 'PCI Compliance'],
  },
  paypal: {
    icon: DollarSign,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    title: 'PayPal Checkout',
    description: 'Trusted international payment method for cross-border rental transactions.',
    requirements: ['Business PayPal Account', 'REST API Client ID', 'IPN Configuration'],
  },
};

const GATEWAY_FIELDS: Record<string, Array<{ key: string; label: string; placeholder: string; type?: string }>> = {
  mpesa: [
    { key: 'consumer_key', label: 'Consumer Key', placeholder: 'Enter Consumer Key' },
    { key: 'consumer_secret', label: 'Consumer Secret', placeholder: 'Enter Consumer Secret', type: 'password' },
    { key: 'passkey', label: 'Lipa Na M-Pesa Passkey', placeholder: 'Enter Passkey', type: 'password' },
    { key: 'shortcode', label: 'Business Shortcode', placeholder: 'e.g., 174379' },
  ],
  airtel_money: [
    { key: 'api_key', label: 'API Key', placeholder: 'Enter API Key', type: 'password' },
    { key: 'merchant_id', label: 'Merchant ID', placeholder: 'Enter Merchant ID' },
    { key: 'shortcode', label: 'Shortcode', placeholder: 'e.g., *544#' },
  ],
  bank: [
    { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g., Equity Bank' },
    { key: 'account_number', label: 'Account Number', placeholder: 'Enter Account Number' },
    { key: 'branch_code', label: 'Branch Code', placeholder: 'Enter Branch Code' },
  ],
  stripe: [
    { key: 'publishable_key', label: 'Publishable Key', placeholder: 'pk_live_...' },
    { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' },
    { key: 'webhook_secret', label: 'Webhook Signing Secret', placeholder: 'whsec_...', type: 'password' },
  ],
  paypal: [
    { key: 'client_id', label: 'Client ID', placeholder: 'Enter Client ID' },
    { key: 'client_secret', label: 'Client Secret', placeholder: 'Enter Client Secret', type: 'password' },
  ],
};

export function GatewayConfigModal({ 
  tenantId, 
  gatewayType, 
  existingConfig, 
  onClose, 
  onSuccess 
}: GatewayConfigModalProps) {
  const [selectedType, setSelectedType] = useState(gatewayType || 'mpesa');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>(existingConfig?.environment as any || 'sandbox');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useState(() => {
    if (existingConfig) {
      const initialData: Record<string, string> = {};
      Object.keys(existingConfig).forEach(key => {
        if (!['id', 'tenant_id', 'type', 'is_active', 'environment'].includes(key)) {
          initialData[key] = typeof (existingConfig as any)[key] === 'string' ? (existingConfig as any)[key] : '';
        }
      });
      setFormData(initialData);
      setEnvironment(existingConfig.environment as any || 'sandbox');
    }
  });

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async () => {
    if (!gatewayType && !selectedType) return;
    
    setIsTesting(true);
    try {
      await tenantsApi.testPaymentGateway(
        tenantId, 
        gatewayType || selectedType, 
        { ...formData, environment }
      );
      toast.success('Connection test successful! Credentials are valid.');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Connection failed. Please check your credentials.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (existingConfig) {
        await tenantsApi.updatePaymentGateway(
          tenantId, 
          existingConfig.type, 
          existingConfig.id, 
          { ...formData, environment, is_active: true }
        );
        toast.success('Gateway configuration updated successfully');
      } else {
        await tenantsApi.createPaymentGateway(
          tenantId, 
          selectedType, 
          { ...formData, environment, is_active: true }
        );
        toast.success('Gateway configured successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'mpesa': return Smartphone;
      case 'airtel_money': return Smartphone;
      case 'bank': return Building2;
      case 'stripe': return CreditCard;
      case 'paypal': return DollarSign;
      default: return CreditCard;
    }
  };

  const currentFields = GATEWAY_FIELDS[selectedType] || [];
  const meta = GATEWAY_META[selectedType] || GATEWAY_META.mpesa;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* ✅ Removed max-h-[90vh] and overflow-hidden to prevent internal scrolling */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full max-w-3xl border border-[var(--color-surface-border)] flex flex-col">
        
        {/* Hero Section */}
        <div className={`relative p-6 border-b ${meta.bg} transition-colors duration-300`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-black/10 transition-colors">
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-5">
            <div className={`p-3 rounded-xl bg-[var(--color-surface)] shadow-sm border border-[var(--color-surface-border)] ${meta.color}`}>
              <meta.icon size={28} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">
                {existingConfig ? `Edit ${meta.title}` : ` ${meta.title}`}
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
                {meta.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {meta.requirements.map((req, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface)]/80 border border-[var(--color-surface-border)] text-[10px] font-medium text-[var(--color-ink-subtle)]">
                    <ShieldCheck size={10} /> {req}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Body - NO SCROLLBAR ON DESKTOP */}
        <div className="p-6 space-y-5">
          
          {/* Gateway Selector */}
          {!existingConfig && (
            <div>
              <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3 block">
                Select Provider
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {Object.keys(GATEWAY_FIELDS).map((type) => {
                  const TIcon = getIconForType(type);
                  const isSelected = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl border text-[10px] font-semibold capitalize transition-all
                        ${isSelected 
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' 
                          : 'border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)]'}
                      `}
                    >
                      <TIcon size={18} />
                      <span>{type.replace('_', ' ')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Environment Toggle */}
          <div>
            <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2 block">
              Environment Mode
            </label>
            <div className="flex bg-[var(--color-surface-hover)] rounded-lg p-1 border border-[var(--color-surface-border)]">
              {(['sandbox', 'production'] as const).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={`
                    flex-1 py-2 px-3 rounded-md text-xs font-bold capitalize transition-all flex items-center justify-center gap-2
                    ${environment === env 
                      ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm ring-1 ring-black/5' 
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}
                  `}
                >
                  {env === 'production' && <Zap size={12} className={environment === env ? 'text-amber-500' : ''} />}
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ DYNAMIC 2-COLUMN GRID FOR INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentFields.map((field) => {
              const isPassword = field.type === 'password';
              const isVisible = showPasswords[field.key];
              
              return (
                <div key={field.key}>
                  <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5 block">
                    {field.label}
                  </label>
                  <div className="relative group">
                    <input
                      type={isPassword && !isVisible ? 'password' : 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    />
                    {isPassword && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors p-1"
                      >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Connection & Security Note Row */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-colors disabled:opacity-50"
            >
              {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              {isTesting ? 'Testing Connection...' : 'Test Connection'}
            </button>
            
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex-1">
              <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-600/80 leading-relaxed">
                Credentials are encrypted at rest. Use Sandbox mode for testing before switching to Production.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-primary)]/20"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isSaving ? 'Saving...' : existingConfig ? 'Update Configuration' : 'Save & Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
