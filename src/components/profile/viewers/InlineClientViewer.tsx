// src/components/profile/viewers/InlineClientViewer.tsx
"use client";

import {
  Save, Loader2, Mail, Phone, Shield, Calendar, Upload,
  FileText, Pencil, X, UserCheck, UserX, RotateCcw, ZoomIn
} from "lucide-react";
import { useInlineClient } from "@/hooks/profile/useInlineClient";
import type { Client, Task } from "@/lib/types";
import TaskContextBar from "../TaskContextBar"; // ✅ NEW

interface InlineClientViewerProps {
  client: Client;
  taskId: number;
  task?: Task; // ✅ Added
  onRefresh: () => void;
}

export default function InlineClientViewer({ client, taskId, task, onRefresh }: InlineClientViewerProps) {
  const {
    isEditing, setIsEditing, isSaving, isActionLoading,
    uploadingDoc, viewingImage, setViewingImage,
    formData, setFormData, isExpired,
    idFrontRef, idBackRef, dlFrontRef,
    handleSave, handleStatusAction, handleDocUpload,
  } = useInlineClient(client, taskId);

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm";
  const labelClass = "text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider mb-1.5 block";
  const valueClass = "text-sm font-medium text-slate-900 dark:text-slate-100 py-2 flex items-center gap-2";

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar relative">
      {/* INLINE IMAGE VIEWER (LIGHTBOX) */}
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

      {/* 1. HEADER WITH ACTIONS */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              {client.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{client.full_name}</h2>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${
                client.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                client.status === 'suspended' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {client.status}
              </span>
            </div>
          </div>
          
          {/* Action Buttons (✅ Info icon removed) */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X size={16} />
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all">
                  <Pencil size={16} />
                </button>
                {client.status !== 'active' && (
                  <button onClick={() => handleStatusAction("activate")} disabled={isActionLoading} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors" title="Activate Client">
                    {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  </button>
                )}
                {client.status === 'active' && (
                  <button onClick={() => handleStatusAction("suspend")} disabled={isActionLoading} className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-colors" title="Suspend Client">
                    <UserX size={16} />
                  </button>
                )}
                {client.status === 'suspended' && (
                  <button onClick={() => handleStatusAction("reactivate")} disabled={isActionLoading} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors" title="Reactivate Client">
                    <RotateCcw size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 2. COMPACT TASK CONTEXT BAR (No scrolling needed!) */}
      {task && <TaskContextBar task={task} />}

      {/* 3. MAIN CONTENT */}
      <div className="p-6 space-y-6">
        {/* TOP PART: CLIENT DETAILS */}
        <div>
          <h4 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">Client Details</h4>
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Contact Info */}
            <div className="space-y-4">
              {isEditing && (
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className={inputClass} />
                </div>
              )}
              <div>
                <label className={labelClass}>Email Address</label>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                ) : (
                  <p className={valueClass}><Mail size={14} className="text-slate-400" /> {client.email || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                {isEditing ? (
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                ) : (
                  <p className={valueClass}><Phone size={14} className="text-slate-400" /> {client.phone || "Not provided"}</p>
                )}
              </div>
            </div>
            {/* Right: Compliance IDs */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>ID Number</label>
                {isEditing ? (
                  <input type="text" value={formData.id_number} onChange={e => setFormData({...formData, id_number: e.target.value})} className={inputClass} />
                ) : (
                  <p className={valueClass}><Shield size={14} className="text-slate-400" /> {client.id_number || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>DL Number</label>
                {isEditing ? (
                  <input type="text" value={formData.dl_number} onChange={e => setFormData({...formData, dl_number: e.target.value})} className={inputClass} />
                ) : (
                  <p className={valueClass}><Shield size={14} className="text-slate-400" /> {client.dl_number || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>DL Expiry Date</label>
                {isEditing ? (
                  <input type="date" value={formData.dl_expiry} onChange={e => setFormData({...formData, dl_expiry: e.target.value})} className={`${inputClass} ${isExpired ? 'border-red-500 focus:ring-red-500/20' : ''}`} />
                ) : (
                  <p className={`text-sm font-medium py-2 flex items-center gap-2 ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    <Calendar size={14} className={isExpired ? 'text-red-500' : 'text-slate-400'} /> 
                    {formData.dl_expiry ? new Date(formData.dl_expiry).toLocaleDateString() : "Not set"}
                    {isExpired && <span className="text-[10px] font-bold uppercase ml-1">(Expired)</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* BOTTOM PART: COMPLIANCE DOCUMENTS */}
        <div>
          <h4 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">Compliance Documents</h4>
          <div className="grid grid-cols-3 gap-4">
            <DocumentCard title="ID Front" imageUrl={client.id_image_front} isUploading={uploadingDoc === 'id_front'} onUpload={() => idFrontRef.current?.click()} onView={() => client.id_image_front && setViewingImage(client.id_image_front)} />
            <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('id_front', e.target.files[0])} />
            <DocumentCard title="ID Back" imageUrl={client.id_image_back} isUploading={uploadingDoc === 'id_back'} onUpload={() => idBackRef.current?.click()} onView={() => client.id_image_back && setViewingImage(client.id_image_back)} />
            <input ref={idBackRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('id_back', e.target.files[0])} />
            <DocumentCard title="DL Front" imageUrl={client.dl_image_front} isUploading={uploadingDoc === 'dl_front'} onUpload={() => dlFrontRef.current?.click()} onView={() => client.dl_image_front && setViewingImage(client.dl_image_front)} />
            <input ref={dlFrontRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('dl_front', e.target.files[0])} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─ Sub-component: Document Card (Purely Presentational) ──
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
          <button onClick={onView} className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-sm" title="View Image">
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
