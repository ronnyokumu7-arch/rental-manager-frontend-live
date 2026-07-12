// src/components/profile/viewers/booking/BookingTripDetails.tsx
"use client";

import { CalendarDays, MapPin, CheckCircle, Clock, FileText, Send } from "lucide-react";

interface BookingTripDetailsProps {
  isEditing: boolean;
  formData: any;
  setFormData: (data: any) => void;
  contractStatus?: string;
}

const inputClass = "w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm";
const labelClass = "text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider mb-1 block";
const valueClass = "text-sm font-medium text-slate-900 dark:text-slate-100 py-1.5 flex items-center gap-2";

// ✅ Billion-Dollar Vertical Tracking Nodes
const ContractLifecycleTracker = ({ status }: { status?: string }) => {
  const stages = [
    { key: "draft", label: "Draft", icon: FileText },
    { key: "sent", label: "Sent", icon: Send },
    { key: "viewed", label: "Viewed", icon: Clock },
    { key: "signed", label: "Signed", icon: CheckCircle },
  ];

  const getCurrentStageIndex = () => {
    if (!status) return 0;
    const index = stages.findIndex(s => s.key === status);
    return index === -1 ? 0 : index;
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="space-y-4 pt-6"> {/* ✅ Added pt-6 to push the whole tracker down */}
      <h4 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">
        Contract Lifecycle
      </h4>
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
        
        {/* Progress Line */}
        <div 
          className="absolute left-[19px] top-2 w-0.5 bg-emerald-500 transition-all duration-500"
          style={{ 
            height: currentIndex > 0 ? `${(currentIndex / (stages.length - 1)) * 100}%` : '0',
            bottom: 'auto'
          }}
        />

        {/* Stages */}
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={stage.key} className="relative flex items-center gap-3 py-2.5"> {/* ✅ Increased py-1 to py-2.5 for breathing space */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center z-10 transition-all duration-300
                ${isCompleted 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : isCurrent 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
              `}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${isCompleted || isCurrent ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                  {stage.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Current Stage
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

export default function BookingTripDetails({ isEditing, formData, setFormData, contractStatus }: BookingTripDetailsProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: All Trip Details */}
        <div className="space-y-2">
          <div>
            <label className={labelClass}>Destination</label>
            {isEditing ? (
              <input type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className={inputClass} />
            ) : (
              <p className={valueClass}><MapPin size={14} className="text-slate-400" /> {formData.destination || "Not specified"}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Pickup Location</label>
            {isEditing ? (
              <input type="text" value={formData.pickup_location} onChange={e => setFormData({...formData, pickup_location: e.target.value})} className={inputClass} />
            ) : (
              <p className={valueClass}><MapPin size={14} className="text-slate-400" /> {formData.pickup_location || "Not specified"}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Return Location</label>
            {isEditing ? (
              <input type="text" value={formData.return_location} onChange={e => setFormData({...formData, return_location: e.target.value})} className={inputClass} />
            ) : (
              <p className={valueClass}><MapPin size={14} className="text-slate-400" /> {formData.return_location || "Not specified"}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Rental Start Date</label>
            {isEditing ? (
              <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className={inputClass} />
            ) : (
              <p className={valueClass}><CalendarDays size={14} className="text-slate-400" /> {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Not set"}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Rental End Date</label>
            {isEditing ? (
              <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className={inputClass} />
            ) : (
              <p className={valueClass}><CalendarDays size={14} className="text-slate-400" /> {formData.end_date ? new Date(formData.end_date).toLocaleDateString() : "Not set"}</p>
            )}
          </div>
        </div>

        {/* Right Column: Contract Lifecycle Tracker */}
        <div>
          <ContractLifecycleTracker status={contractStatus} />
        </div>
        
      </div>
    </div>
  );
}
