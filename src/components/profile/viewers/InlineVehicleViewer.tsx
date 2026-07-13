// src/components/profile/viewers/InlineVehicleViewer.tsx
"use client";

import {
  Save, Loader2, Car, Calendar, DollarSign, Gauge,
  Shield, FileText, Upload, ZoomIn, X, Pencil,
  CheckCircle, AlertTriangle, RotateCcw
} from "lucide-react";
import { useInlineVehicle } from "@/hooks/profile/useInlineVehicle";
import type { Vehicle, Task } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import TaskContextBar from "../TaskContextBar";

interface InlineVehicleViewerProps {
  vehicle: Vehicle;
  task?: Task;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "danger" | "accent"> = {
  pending_activation: "warning",
  available: "success",
  rented: "accent",
  maintenance: "warning",
  retired: "danger",
};

export default function InlineVehicleViewer({ vehicle, task, onRefresh }: InlineVehicleViewerProps) {
  const {
    isEditing, setIsEditing, isSaving, isActionLoading,
    uploadingDoc, viewingImage, setViewingImage,
    formData, setFormData, isInsuranceExpired,
    insuranceRef, registrationRef, inspectionRef,
    handleSave, handleStatusAction, handleDocUpload,
  } = useInlineVehicle(vehicle);

  // ✅ BRAND TOKENS: Consistent with all profile components
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
  const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block";
  const valueClass = "text-sm font-medium text-[var(--color-ink)] py-2 flex items-center gap-2";

  const handleSaveWithRefresh = async () => { await handleSave(); onRefresh(); };
  const handleActionWithRefresh = async (action: "activate" | "maintenance" | "reactivate") => { await handleStatusAction(action); onRefresh(); };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar relative bg-[var(--color-surface)]">
      
      {/* ✅ PREMIUM LIGHTBOX */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setViewingImage(null)} 
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={24} />
            </button>
            <img 
              src={viewingImage} 
              alt="Document Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
            />
            <p className="text-white/60 text-xs mt-4 font-medium">Click outside or press X to close</p>
          </div>
        </div>
      )}

      {/* 1. UNIFIED HEADER WITH STATUS & ACTIONS */}
      <div className="p-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Car size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-[var(--color-ink)]">
                  {vehicle.make} {vehicle.model}
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] text-[10px] font-bold border border-[var(--color-surface-border)]">
                  {vehicle.year}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_COLORS[vehicle.status] || "default"} size="sm">
                  {vehicle.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-[var(--color-ink-subtle)] font-mono bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded">
                  {vehicle.plate_number}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors" 
                  title="Cancel Editing"
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={handleSaveWithRefresh} 
                  disabled={isSaving} 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50 shadow-sm active:scale-95"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all" 
                  title="Edit Details"
                >
                  <Pencil size={16} />
                </button>
                
                {vehicle.status === "pending_activation" && (
                  <button 
                    onClick={() => handleActionWithRefresh("activate")} 
                    disabled={isActionLoading}
                    className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 transition-colors disabled:opacity-50"
                    title="Activate Vehicle"
                  >
                    {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  </button>
                )}
                {vehicle.status === "available" && (
                  <button 
                    onClick={() => handleActionWithRefresh("maintenance")} 
                    disabled={isActionLoading}
                    className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 transition-colors disabled:opacity-50"
                    title="Send to Maintenance"
                  >
                    <AlertTriangle size={16} />
                  </button>
                )}
                {vehicle.status === "maintenance" && (
                  <button 
                    onClick={() => handleActionWithRefresh("reactivate")} 
                    disabled={isActionLoading}
                    className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 transition-colors disabled:opacity-50"
                    title="Reactivate Vehicle"
                  >
                    {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. COMPACT TASK CONTEXT BAR */}
      {task && <TaskContextBar task={task} />}

      <div className="p-6 space-y-8">
        
        {/* 3. VEHICLE DETAILS SECTION */}
        <div>
          <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-4">Vehicle Specifications</h4>
          
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {[
                { icon: Shield, label: "VIN (Chassis Number)", value: vehicle.vin || "Not provided" },
                { icon: DollarSign, label: "Daily Rate (KES)", value: Number(vehicle.daily_rate).toLocaleString() },
                { icon: Gauge, label: "Current Mileage", value: `${vehicle.current_mileage.toLocaleString()} km` },
                { icon: Gauge, label: "Next Service", value: vehicle.next_service_km ? `${vehicle.next_service_km.toLocaleString()} km` : "Not set" },
                { icon: Shield, label: "Insurance Policy", value: vehicle.insurance_number || "Not provided" },
                { 
                  icon: Calendar, 
                  label: "Insurance Expiry", 
                  value: formData.insurance_expiry ? new Date(formData.insurance_expiry).toLocaleDateString() : "Not set",
                  isWarning: isInsuranceExpired,
                  warningText: "(Expired)"
                },
              ].map((field, i) => (
                <div key={i}>
                  <label className={labelClass}>{field.label}</label>
                  <div className={`${valueClass} ${field.isWarning ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                    <field.icon size={14} className={field.isWarning ? 'text-rose-500' : 'text-[var(--color-ink-subtle)]'} />
                    {field.value}
                    {field.warningText && <span className="text-[10px] font-bold uppercase ml-1">{field.warningText}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                {[
                  { key: 'make', label: 'Make', type: 'text' },
                  { key: 'model', label: 'Model', type: 'text' },
                  { key: 'plate_number', label: 'Plate Number', type: 'text' },
                  { key: 'vin', label: 'VIN (Chassis Number)', type: 'text' },
                  { key: 'year', label: 'Year', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input 
                      type={f.type} 
                      value={formData[f.key as keyof typeof formData]} 
                      onChange={e => setFormData({...formData, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value})} 
                      className={inputClass} 
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { key: 'daily_rate', label: 'Daily Rate (KES)', type: 'number', step: '0.01' },
                  { key: 'current_mileage', label: 'Current Mileage (km)', type: 'number' },
                  { key: 'next_service_km', label: 'Next Service (km)', type: 'number' },
                  { key: 'insurance_number', label: 'Insurance Policy Number', type: 'text' },
                  { key: 'insurance_expiry', label: 'Insurance Expiry Date', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input 
                      type={f.type} 
                      step={f.step}
                      value={formData[f.key as keyof typeof formData]} 
                      onChange={e => setFormData({...formData, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})} 
                      className={`${inputClass} ${f.key === 'insurance_expiry' && isInsuranceExpired ? 'border-rose-500 focus:ring-rose-500/20' : ''}`} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-[var(--color-surface-border)]" />

        {/* 4. COMPLIANCE DOCUMENTS */}
        <div>
          <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-4">Compliance Documents</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DocumentCard title="Insurance" imageUrl={vehicle.insurance_doc} isUploading={uploadingDoc === 'insurance'} onUpload={() => insuranceRef.current?.click()} onView={() => vehicle.insurance_doc && setViewingImage(vehicle.insurance_doc)} />
            <input ref={insuranceRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('insurance', e.target.files[0])} />
            
            <DocumentCard title="Registration" imageUrl={vehicle.registration_doc} isUploading={uploadingDoc === 'registration'} onUpload={() => registrationRef.current?.click()} onView={() => vehicle.registration_doc && setViewingImage(vehicle.registration_doc)} />
            <input ref={registrationRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('registration', e.target.files[0])} />
            
            <DocumentCard title="Inspection" imageUrl={vehicle.inspection_doc} isUploading={uploadingDoc === 'inspection'} onUpload={() => inspectionRef.current?.click()} onView={() => vehicle.inspection_doc && setViewingImage(vehicle.inspection_doc)} />
            <input ref={inspectionRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('inspection', e.target.files[0])} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ PREMIUM DOCUMENT CARD SUB-COMPONENT
function DocumentCard({ title, imageUrl, isUploading, onUpload, onView }: { 
  title: string; 
  imageUrl?: string | null; 
  isUploading: boolean; 
  onUpload: () => void; 
  onView: () => void 
}) {
  return (
    <div className="relative group rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 overflow-hidden aspect-[4/3] flex flex-col cursor-pointer hover:border-[var(--color-surface-border)]/80 transition-all">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-ink-subtle)]">
          <FileText size={24} className="mb-2 opacity-50" />
          <span className="text-[10px] font-bold uppercase tracking-wider">No Document</span>
        </div>
      )}
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
        {imageUrl && (
          <button 
            onClick={(e) => { e.stopPropagation(); onView(); }} 
            className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors" 
            title="View Document"
          >
            <ZoomIn size={18} />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onUpload(); }} 
          disabled={isUploading} 
          className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors disabled:opacity-50" 
          title="Upload New"
        >
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        </button>
      </div>
      
      {/* Label Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
        <p className="text-[10px] font-bold text-white uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );
}
