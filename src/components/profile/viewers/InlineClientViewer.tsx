// src/components/profile/viewers/InlineClientViewer.tsx
"use client";

import {
  Save, Loader2, Mail, Phone, Shield, Calendar, Upload,
  FileText, Pencil, X, UserCheck, UserX, RotateCcw, ZoomIn
} from "lucide-react";
import { useInlineClient } from "@/hooks/profile/useInlineClient";
import type { Client, Task } from "@/lib/types";
import TaskContextBar from "../TaskContextBar";

interface InlineClientViewerProps {
  client: Client;
  taskId: number;
  task?: Task;
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

  // ✅ BRAND TOKENS: Consistent with all profile components
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
  const labelClass = "text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block";
  const valueClass = "text-sm font-medium text-[var(--color-ink)] py-2 flex items-center gap-2";

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

      {/* 1. UNIFIED HEADER WITH ACTIONS */}
      <div className="p-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xl">
              {client.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-ink)]">{client.full_name}</h2>
              <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide border ${
                client.status === 'active' ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10' :
                client.status === 'suspended' ? 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10' :
                'bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border-[var(--color-surface-border)]'
              }`}>
                {client.status}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={handleSave} 
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
                >
                  <Pencil size={16} />
                </button>
                
                {client.status !== 'active' && (
                  <button 
                    onClick={() => handleStatusAction("activate")} 
                    disabled={isActionLoading} 
                    className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 transition-colors disabled:opacity-50" 
                    title="Activate Client"
                  >
                    {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  </button>
                )}
                {client.status === 'active' && (
                  <button 
                    onClick={() => handleStatusAction("suspend")} 
                    disabled={isActionLoading} 
                    className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 transition-colors disabled:opacity-50" 
                    title="Suspend Client"
                  >
                    <UserX size={16} />
                  </button>
                )}
                {client.status === 'suspended' && (
                  <button 
                    onClick={() => handleStatusAction("reactivate")} 
                    disabled={isActionLoading} 
                    className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 transition-colors disabled:opacity-50" 
                    title="Reactivate Client"
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

      {/* 3. MAIN CONTENT */}
      <div className="p-6 space-y-8">
        
        {/* CLIENT DETAILS SECTION */}
        <div>
          <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-4">Client Details</h4>
          
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {[
                { icon: Mail, label: "Email Address", value: client.email || "Not provided" },
                { icon: Phone, label: "Phone Number", value: client.phone || "Not provided" },
                { icon: Shield, label: "ID Number", value: client.id_number || "Not provided" },
                { icon: Shield, label: "DL Number", value: client.dl_number || "Not provided" },
                { 
                  icon: Calendar, 
                  label: "DL Expiry Date", 
                  value: formData.dl_expiry ? new Date(formData.dl_expiry).toLocaleDateString() : "Not set",
                  isWarning: isExpired,
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
                  { key: 'full_name', label: 'Full Name', type: 'text' },
                  { key: 'email', label: 'Email Address', type: 'email' },
                  { key: 'phone', label: 'Phone Number', type: 'tel' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input 
                      type={f.type} 
                      value={formData[f.key as keyof typeof formData]} 
                      onChange={e => setFormData({...formData, [f.key]: e.target.value})} 
                      className={inputClass} 
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { key: 'id_number', label: 'ID Number', type: 'text' },
                  { key: 'dl_number', label: 'DL Number', type: 'text' },
                  { key: 'dl_expiry', label: 'DL Expiry Date', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input 
                      type={f.type} 
                      value={formData[f.key as keyof typeof formData]} 
                      onChange={e => setFormData({...formData, [f.key]: e.target.value})} 
                      className={`${inputClass} ${f.key === 'dl_expiry' && isExpired ? 'border-rose-500 focus:ring-rose-500/20' : ''}`} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-[var(--color-surface-border)]" />

        {/* COMPLIANCE DOCUMENTS */}
        <div>
          <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-4">Compliance Documents</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            title="View Image"
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
