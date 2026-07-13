// src/components/tenants/PaymentGatewaysSection.tsx
import { useState, useEffect } from 'react';
import { 
  CreditCard, Smartphone, Building2, DollarSign, Plus, 
  CheckCircle2, XCircle, Loader2, Edit3, Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantsApi } from '@/lib/api/tenants';
import type { PaymentGatewayConfig } from '@/lib/api/tenants';
import { GatewayConfigModal } from './GatewayConfigModal'; // ✅ Import the real modal

interface PaymentGatewaysSectionProps {
  tenantId: number | string;
  onUpdated?: () => void;
}

export function PaymentGatewaysSection({ tenantId, onUpdated }: PaymentGatewaysSectionProps) {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ Modal State Management
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayConfig | null>(null);
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState<string | undefined>(undefined);

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

  // ✅ Hooked Buttons
  const handleAddGateway = (gatewayType: string) => {
    setSelectedGateway(null);
    setSelectedTypeToAdd(gatewayType);
    setIsConfigModalOpen(true);
  };

  const handleEditGateway = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setSelectedTypeToAdd(undefined);
    setIsConfigModalOpen(true);
  };

  const handleDeleteGateway = async (gatewayType: string, configId: number) => {
    if (!confirm('Are you sure you want to delete this payment gateway configuration? This action cannot be undone.')) return;
    
    try {
      // TODO: Replace with actual delete endpoint when backend is ready
      // await tenantsApi.deletePaymentGateway(tenantId, gatewayType, configId);
      
      // Optimistic update for now
      setGateways(prev => prev.filter(g => g.id !== configId));
      toast.success('Gateway configuration deleted');
      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to delete gateway');
      fetchGateways(); // Revert optimistic update on error
    }
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'mpesa': return Smartphone;
      case 'airtel_money': return Smartphone;
      case 'bank': return Building2;
      case 'stripe': return CreditCard;
      case 'paypal': return DollarSign;
      default: return CreditCard;
    }
  };

  const getGatewayColor = (type: string) => {
    switch (type) {
      case 'mpesa': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'airtel_money': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'bank': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'stripe': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'paypal': return 'bg-indigo-500/10 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  const availableGateways = [
    { type: 'mpesa', label: 'M-Pesa', description: 'Mobile money' },
    { type: 'airtel_money', label: 'Airtel Money', description: 'Mobile wallet' },
    { type: 'bank', label: 'Bank Transfer', description: 'Direct bank' },
    { type: 'stripe', label: 'Stripe', description: 'Cards' },
    { type: 'paypal', label: 'PayPal', description: 'Digital wallet' },
  ];

  const configuredTypes = gateways.map(g => g.type);
  const unconfiguredGateways = availableGateways.filter(g => !configuredTypes.includes(g.type));

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
            <CreditCard size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Payment Gateways</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Configure payment methods</p>
          </div>
        </div>
      </div>

      {/* Compact Body */}
      <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-[var(--color-ink-muted)] gap-2">
            <Loader2 className="animate-spin text-indigo-600" size={16} />
            <span className="text-xs">Loading...</span>
          </div>
        ) : gateways.length === 0 ? (
          <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
            <CreditCard className="mb-2 text-[var(--color-ink-subtle)] opacity-40" size={24} />
            <p className="text-xs font-medium text-[var(--color-ink)]">No gateways configured</p>
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Add a method below</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gateways.map((gateway) => {
              const Icon = getGatewayIcon(gateway.type);
              const colorClass = getGatewayColor(gateway.type);
              
              return (
                <div
                  key={gateway.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink-subtle)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-ink)] capitalize">
                        {gateway.type.replace('_', ' ')}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {gateway.is_active ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 font-medium">
                            <XCircle size={10} /> Inactive
                          </span>
                        )}
                        {gateway.environment && (
                          <span className="text-[10px] text-[var(--color-ink-muted)]">• {gateway.environment}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditGateway(gateway)}
                      className="p-1.5 rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                      title="Edit configuration"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteGateway(gateway.type, gateway.id)}
                      className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete configuration"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Available Gateways - Horizontal Scroll / Dense Grid */}
        {unconfiguredGateways.length > 0 && (
          <div className="pt-3 border-t border-[var(--color-surface-border)]">
            <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2.5">
              Available Methods
            </p>
            <div className="grid grid-cols-2 gap-2">
              {unconfiguredGateways.map((gateway) => {
                const Icon = getGatewayIcon(gateway.type);
                return (
                  <button
                    key={gateway.type}
                    onClick={() => handleAddGateway(gateway.type)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate">{gateway.label}</p>
                      <p className="text-[9px] text-[var(--color-ink-muted)] truncate">{gateway.description}</p>
                    </div>
                    <Plus size={14} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ✅ REAL MODAL INTEGRATION */}
      {isConfigModalOpen && (
        <GatewayConfigModal
          tenantId={tenantId}
          gatewayType={selectedTypeToAdd}
          existingConfig={selectedGateway}
          onClose={() => {
            setIsConfigModalOpen(false);
            setSelectedGateway(null);
            setSelectedTypeToAdd(undefined);
          }}
          onSuccess={() => {
            fetchGateways();
            onUpdated?.();
          }}
        />
      )}
    </div>
  );
}
