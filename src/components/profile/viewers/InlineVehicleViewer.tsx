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
import TaskContextBar from "../TaskContextBar"; // ✅ NEW

interface InlineVehicleViewerProps {
  vehicle: Vehicle;
  task?: Task; // ✅ Added
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

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm";
  const labelClass = "text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider mb-1.5 block";
  const valueClass = "text-sm font-medium text-slate-900 dark:text-slate-100 py-2 flex items-center gap-2";

  const handleSaveWithRefresh = async () => { await handleSave(); onRefresh(); };
  const handleActionWithRefresh = async (action: "activate" | "maintenance" | "reactivate") => { await handleStatusAction(action); onRefresh(); };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar relative">
      {/* Inline Image Viewer (Lightbox) */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button onClick={() => setViewingImage(null)} className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X size={24} />
            </button>
            <img src={viewingImage} alt="Document Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10" />
            <p className="text-white/60 text-xs mt-4">Click outside or press X to close</p>
          </div>
        </div>
      )}

      {/* 1. HEADER WITH STATUS & ACTIONS */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Car size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {vehicle.make} {vehicle.model}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                  {vehicle.year}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_COLORS[vehicle.status] || "default"} size="sm">
                  {vehicle.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{vehicle.plate_number}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Cancel Editing">
                  <X size={16} />
                </button>
                <button onClick={handleSaveWithRefresh} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all" title="Edit Details">
                  <Pencil size={16} />
                </button>
                {vehicle.status === "pending_activation" && (
                  <button 
                    onClick={() => handleActionWithRefresh("activate")} 
                    disabled={isActionLoading}
                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                    title="Activate Vehicle"
                  >
                    {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  </button>
                )}
                {vehicle.status === "available" && (
                  <button 
                    onClick={() => handleActionWithRefresh("maintenance")} 
                    disabled={isActionLoading}
                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
                    title="Send to Maintenance"
                  >
                    <AlertTriangle size={16} />
                  </button>
                )}
                {vehicle.status === "maintenance" && (
                  <button 
                    onClick={() => handleActionWithRefresh("reactivate")} 
                    disabled={isActionLoading}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
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

      {/* ✅ 2. COMPACT TASK CONTEXT BAR (No scrolling needed!) */}
      {task && <TaskContextBar task={task} />}

      <div className="p-6 space-y-6">
        {/* 3. TOP SECTION: VEHICLE DETAILS */}
        <div>
          <h4 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">Vehicle Details</h4>
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>VIN (Chassis Number)</label>
                  <p className={valueClass}><Shield size={14} className="text-slate-400" /> {vehicle.vin || "Not provided"}</p>
                </div>
                <div>
                  <label className={labelClass}>Daily Rate (KES)</label>
                  <p className={valueClass}><DollarSign size={14} className="text-slate-400" /> {Number(vehicle.daily_rate).toLocaleString()}</p>
                </div>
                <div>
                  <label className={labelClass}>Current Mileage (km)</label>
                  <p className={valueClass}><Gauge size={14} className="text-slate-400" /> {vehicle.current_mileage.toLocaleString()} km</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Next Service (km)</label>
                  <p className={valueClass}><Gauge size={14} className="text-slate-400" /> {vehicle.next_service_km?.toLocaleString() || "Not set"} km</p>
                </div>
                <div>
                  <label className={labelClass}>Insurance Policy Number</label>
                  <p className={valueClass}><Shield size={14} className="text-slate-400" /> {vehicle.insurance_number || "Not provided"}</p>
                </div>
                <div>
                  <label className={labelClass}>Insurance Expiry Date</label>
                  <p className={`text-sm font-medium py-2 flex items-center gap-2 ${isInsuranceExpired ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    <Calendar size={14} className={isInsuranceExpired ? 'text-red-500' : 'text-slate-400'} /> 
                    {formData.insurance_expiry ? new Date(formData.insurance_expiry).toLocaleDateString() : "Not set"}
                    {isInsuranceExpired && <span className="text-[10px] font-bold uppercase ml-1">(Expired)</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Make</label>
                  <input type="text" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Model</label>
                  <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Plate Number</label>
                  <input type="text" value={formData.plate_number} onChange={e => setFormData({...formData, plate_number: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>VIN (Chassis Number)</label>
                  <input type="text" value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Year</label>
                  <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className={inputClass} />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Daily Rate (KES)</label>
                  <input type="number" step="0.01" value={formData.daily_rate} onChange={e => setFormData({...formData, daily_rate: parseFloat(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Current Mileage (km)</label>
                  <input type="number" value={formData.current_mileage} onChange={e => setFormData({...formData, current_mileage: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Next Service (km)</label>
                  <input type="number" value={formData.next_service_km} onChange={e => setFormData({...formData, next_service_km: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Insurance Policy Number</label>
                  <input type="text" value={formData.insurance_number} onChange={e => setFormData({...formData, insurance_number: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Insurance Expiry Date</label>
                  <input type="date" value={formData.insurance_expiry} onChange={e => setFormData({...formData, insurance_expiry: e.target.value})} className={`${inputClass} ${isInsuranceExpired ? 'border-red-500 focus:ring-red-500/20' : ''}`} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* 4. BOTTOM SECTION: DOCUMENTS */}
        <div>
          <h4 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">Compliance Documents</h4>
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

// Sub-component: Document Card
function DocumentCard({ title, imageUrl, isUploading, onUpload, onView }: { title: string; imageUrl?: string | null; isUploading: boolean; onUpload: () => void; onView: () => void }) {
  return (
    <div className="relative group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden aspect-[4/3] flex flex-col">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
          <FileText size={20} className="mb-1" />
          <span className="text-[10px] font-medium">No document</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        {imageUrl && (
          <button onClick={onView} className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-sm" title="View Document">
            <ZoomIn size={16} />
          </button>
        )}
        <button onClick={onUpload} disabled={isUploading} className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-sm disabled:opacity-50" title="Upload New">
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-[10px] font-bold text-white uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}
