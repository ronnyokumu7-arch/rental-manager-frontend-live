// src/components/profile/viewers/booking/BookingTripDetails.tsx
"use client";

import { CalendarDays, MapPin, CheckCircle, Clock, FileText, Send } from "lucide-react";

interface BookingTripDetailsProps {
  isEditing: boolean;
  formData: any;
  setFormData: (data: any) => void;
  contractStatus?: string;
}

// ✅ BRAND TOKENS: Consistent with all profile components
const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block";
const valueClass = "text-sm font-medium text-[var(--color-ink)] py-2 flex items-center gap-2";

// ✅ PREMIUM CONTRACT LIFECYCLE TRACKER
const ContractLifecycleTracker = ({ status }: { status?: string }) => {
  const stages = [
    { key: "draft", label: "Draft Created", icon: FileText },
    { key: "sent", label: "Sent to Client", icon: Send },
    { key: "viewed", label: "Client Viewed", icon: Clock },
    { key: "signed", label: "Fully Executed", icon: CheckCircle },
  ];

  const getCurrentStageIndex = () => {
    if (!status) return -1; // Not started
    const index = stages.findIndex(s => s.key === status);
    return index === -1 ? -1 : index;
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Contract Lifecycle</h4>
      
      <div className="relative pl-2">
        {/* Vertical Track Line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-[var(--color-surface-border)]" />
        
        {/* Active Progress Line */}
        {currentIndex >= 0 && (
          <div 
            className="absolute left-[27px] top-4 w-px bg-emerald-500 transition-all duration-500 ease-out"
            style={{ 
              height: `${Math.min(100, (currentIndex / (stages.length - 1)) * 100)}%`,
              maxHeight: 'calc(100% - 2rem)'
            }}
          />
        )}

        {/* Stage Nodes */}
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          
          return (
            <div key={stage.key} className="relative flex items-start gap-4 py-3 last:pb-0">
              
              {/* Node Circle */}
              <div className={`
                relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300
                ${isCompleted 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                  : isCurrent 
                    ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10' 
                    : 'bg-[var(--color-surface-hover)] border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]'}
              `}>
                <Icon size={18} />
              </div>

              {/* Stage Info */}
              <div className="pt-2">
                <p className={`text-xs font-bold ${
                  isCompleted || isCurrent ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'
                }`}>
                  {stage.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] text-[var(--color-primary)] font-semibold mt-0.5">
                    Current Stage
                  </p>
                )}
                {isFuture && (
                  <p className="text-[10px] text-[var(--color-ink-subtle)] mt-0.5">
                    Pending
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function BookingTripDetails({ 
  isEditing, 
  formData, 
  setFormData, 
  contractStatus 
}: BookingTripDetailsProps) {
  
  const tripFields = [
    { key: 'destination', label: 'Destination', icon: MapPin, type: 'text' },
    { key: 'pickup_location', label: 'Pickup Location', icon: MapPin, type: 'text' },
    { key: 'return_location', label: 'Return Location', icon: MapPin, type: 'text' },
    { key: 'start_date', label: 'Rental Start Date', icon: CalendarDays, type: 'date' },
    { key: 'end_date', label: 'Rental End Date', icon: CalendarDays, type: 'date' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: Trip Details */}
      <div className="lg:col-span-7 space-y-5">
        <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Trip Details</h4>
        
        <div className="space-y-4">
          {tripFields.map((field) => (
            <div key={field.key}>
              <label className={labelClass}>{field.label}</label>
              {isEditing ? (
                <input 
                  type={field.type} 
                  value={formData[field.key] || ''} 
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                  className={inputClass} 
                />
              ) : (
                <div className={valueClass}>
                  <field.icon size={14} className="text-[var(--color-ink-subtle)]" />
                  {field.type === 'date' && formData[field.key] 
                    ? new Date(formData[field.key]).toLocaleDateString() 
                    : (formData[field.key] || "Not specified")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Contract Lifecycle Tracker (Container Removed) */}
      <div className="lg:col-span-5 pt-1">
        <ContractLifecycleTracker status={contractStatus} />
      </div>

    </div>
  );
}
