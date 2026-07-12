"use client";
import { FileText, CheckCircle, AlertCircle, Eye, Link, Download } from "lucide-react";

interface DocumentCardProps {
  title: string; status: string;
  onView: () => void; onCopyLink: () => void; onDownload: () => void;
}

export default function DocumentCard({ title, status, onView, onCopyLink, onDownload }: DocumentCardProps) {
  const isGenerated = status === "Generated";
  return (
    <div className="relative group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden aspect-[16/9] flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={onView}>
      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2"><FileText size={20} /></div>
      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
        {isGenerated ? <CheckCircle size={10} className="text-emerald-500" /> : <AlertCircle size={10} className="text-amber-500" />} {status}
      </p>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isGenerated && <button onClick={(e) => { e.stopPropagation(); onView(); }} className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600" title="View Document"><Eye size={12} /></button>}
        <button onClick={(e) => { e.stopPropagation(); onCopyLink(); }} className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600" title="Copy Link"><Link size={12} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600" title="Download PDF"><Download size={12} /></button>
      </div>
    </div>
  );
}
