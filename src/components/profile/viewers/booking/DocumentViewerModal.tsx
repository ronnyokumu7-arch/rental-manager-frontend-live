"use client";
import { X } from "lucide-react";

interface DocumentViewerModalProps { title: string; url: string; onClose: () => void; }

export default function DocumentViewerModal({ title, url, onClose }: DocumentViewerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title} Preview</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={16} /></button>
        </div>
        <iframe src={url} className="flex-1 w-full bg-white" title={title} />
      </div>
    </div>
  );
}
