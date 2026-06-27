"use client";
import { FileText, Mail, CheckCircle2, Copy, Eye, Download, Share2, RefreshCw } from "lucide-react";
import type { Contract } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";

interface ContractLifecycleSectionProps {
  contract: Contract | null;
  onRegenerate?: () => void;
  onCopyLink?: () => void;
  onView?: () => void;
  onDownload?: () => void;
  onEmailClient?: () => void;
}

export default function ContractLifecycleSection({ 
  contract, 
  onRegenerate,
  onCopyLink,
  onView,
  onDownload,
  onEmailClient
}: ContractLifecycleSectionProps) {
  
  if (!contract) {
    return (
      <SectionCard className="!p-5">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={18} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Contract Lifecycle</h3>
        </div>
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center">
          <FileText size={24} className="text-slate-300 mb-2" />
          <p className="text-sm text-gray-500 mb-4">No contract generated yet.</p>
          {onRegenerate && (
            <button 
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw size={14} /> Generate Contract
            </button>
          )}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="!p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Contract Lifecycle</h3>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {onCopyLink && (
            <button 
              onClick={onCopyLink} 
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
              title="Copy Share Link"
            >
              <Copy size={16} />
            </button>
          )}
          {onView && (
            <button 
              onClick={onView} 
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
              title="View Contract"
            >
              <Eye size={16} />
            </button>
          )}
          {onDownload && (
            <button 
              onClick={onDownload} 
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
              title="Download PDF"
            >
              <Download size={16} />
            </button>
          )}
          {onEmailClient && (
            <button 
              onClick={onEmailClient} 
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
              title="Email to Client"
            >
              <Mail size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Vertical Tracker */}
      <div className="space-y-4">
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />

          {/* Node 1: Draft */}
          <div className="relative flex items-start gap-3">
            <div className={`absolute -left-6 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 ${
              contract.status === 'draft' ? 'bg-slate-400' : 'bg-slate-600'
            }`}>
              <FileText size={12} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Draft Created</p>
              <p className="text-xs text-gray-500 mt-0.5">Generated on {new Date(contract.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Node 2: Sent */}
          <div className="relative flex items-start gap-3">
            <div className={`absolute -left-6 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 ${
              contract.status === 'draft' ? 'bg-slate-300' : 
              contract.status === 'sent' ? 'bg-blue-500' : 'bg-blue-600'
            }`}>
              <Mail size={12} className={contract.status === 'draft' ? 'text-slate-500' : 'text-white'} />
            </div>
            <div>
              <p className={`text-sm font-bold ${contract.status === 'draft' ? 'text-gray-400' : 'text-gray-900'}`}>
                Sent to Client
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {contract.status !== 'draft' ? `Delivered on ${new Date(contract.updated_at).toLocaleString()}` : 'Awaiting delivery...'}
              </p>
            </div>
          </div>

          {/* Node 3: Signed */}
          <div className="relative flex items-start gap-3">
            <div className={`absolute -left-6 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 ${
              contract.status === 'signed' ? 'bg-emerald-500' : 'bg-slate-300'
            }`}>
              <CheckCircle2 size={12} className={contract.status === 'signed' ? 'text-white' : 'text-slate-400'} />
            </div>
            <div>
              <p className={`text-sm font-bold ${contract.status === 'signed' ? 'text-gray-900' : 'text-gray-400'}`}>
                Contract Signed
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {contract.status === 'signed' ? `Executed on ${new Date(contract.client_signed_at || contract.updated_at).toLocaleString()}` : 'Pending client signature'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase text-gray-500 font-bold">Contract ID</p>
            <p className="text-xs font-mono font-bold text-gray-900">{contract.contract_number}</p>
          </div>
          <Badge variant={contract.status === "signed" ? "success" : contract.status === "sent" ? "accent" : "neutral"} dot>
            {contract.status.toUpperCase()}
          </Badge>
        </div>
      </div>
    </SectionCard>
  );
}
