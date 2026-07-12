// src/components/tenants/PaymentGatewaysSection.tsx
import { useState, useEffect } from 'react';
import { 
  CreditCard, Smartphone, Building2, DollarSign, Plus, 
  CheckCircle2, XCircle, Loader2, AlertCircle, Edit3, Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantsApi } from '@/lib/api/tenants';
import type { PaymentGatewayConfig } from '@/lib/api/tenants';

interface PaymentGatewaysSectionProps {
  tenantId: number | string;
  onUpdated?: () => void;
}

export function PaymentGatewaysSection({ tenantId, onUpdated }: PaymentGatewaysSectionProps) {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayConfig | null>(null);

  const fetchGateways = async () => {
    setIsLoading(true);
    try {
      const response = await tenantsApi.getPaymentGateways(tenantId);
      setGateways(response.gateways || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to load payment gateways');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, [tenantId]);

  const handleAddGateway = (gatewayType: string) => {
    setSelectedGateway(null);
    setIsConfigModalOpen(true);
    // TODO: Pass gatewayType to modal
  };

  const handleEditGateway = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setIsConfigModalOpen(true);
  };

  const handleDeleteGateway = async (gatewayType: string, configId: number) => {
    if (!confirm('Are you sure you want to delete this payment gateway configuration?')) return;
    
    try {
      // TODO: Implement delete endpoint
      toast.success('Gateway configuration deleted');
      fetchGateways();
      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to delete gateway');
    }
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'mpesa':
        return Smartphone;
      case 'airtel_money':
        return Smartphone;
      case 'bank':
        return Building2;
      case 'stripe':
        return CreditCard;
      case 'paypal':
        return DollarSign;
      default:
        return CreditCard;
    }
  };

  const getGatewayColor = (type: string) => {
    switch (type) {
      case 'mpesa':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'airtel_money':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'bank':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'stripe':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'paypal':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  const availableGateways = [
    { type: 'mpesa', label: 'M-Pesa', description: 'Mobile money payments' },
    { type: 'airtel_money', label: 'Airtel Money', description: 'Airtel mobile wallet' },
    { type: 'bank', label: 'Bank Transfer', description: 'Direct bank payments' },
    { type: 'stripe', label: 'Stripe', description: 'Credit/debit cards' },
    { type: 'paypal', label: 'PayPal', description: 'PayPal payments' },
  ];

  const configuredTypes = gateways.map(g => g.type);
  const unconfiguredGateways = availableGateways.filter(g => !configuredTypes.includes(g.type));

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
            <CreditCard size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Payment Gateways</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Configure payment methods for this agency</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-[var(--color-ink-muted)] gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={20} />
            <span className="text-sm">Loading payment gateways...</span>
          </div>
        ) : gateways.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto mb-3 text-[var(--color-ink-subtle)] opacity-50" size={32} />
            <p className="text-sm font-medium text-[var(--color-ink)]">No payment gateways configured</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Add a payment method to start accepting payments
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gateways.map((gateway) => {
              const Icon = getGatewayIcon(gateway.type);
              const colorClass = getGatewayColor(gateway.type);
              
              return (
                <div
                  key={gateway.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink-subtle)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg border ${colorClass}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)] capitalize">
                        {gateway.type.replace('_', ' ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {gateway.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                        {gateway.environment && (
                          <span className="text-xs text-[var(--color-ink-muted)]">
                            • {gateway.environment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditGateway(gateway)}
                      className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                      title="Edit configuration"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGateway(gateway.type, gateway.id)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete configuration"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Gateway Buttons */}
        {unconfiguredGateways.length > 0 && (
          <div className="pt-6 border-t border-[var(--color-surface-border)]">
            <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
              Available Payment Methods
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unconfiguredGateways.map((gateway) => {
                const Icon = getGatewayIcon(gateway.type);
                return (
                  <button
                    key={gateway.type}
                    onClick={() => handleAddGateway(gateway.type)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{gateway.label}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">{gateway.description}</p>
                    </div>
                    <Plus size={18} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Config Modal Placeholder */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-4">
              {selectedGateway ? 'Edit Gateway Configuration' : 'Add Gateway Configuration'}
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-6">
              Gateway configuration form will be built next...
            </p>
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
