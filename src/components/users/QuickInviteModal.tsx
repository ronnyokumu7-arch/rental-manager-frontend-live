// src/components/users/QuickInviteModal.tsx
import { useState, useEffect } from "react";
import { Link, Loader2, Check, Copy } from "lucide-react";

const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  "Finance": ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

interface QuickInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { department: string; job_title: string }) => Promise<void>;
  loading: boolean;
  inviteLink: string | null;
  copied: boolean;
  onCopy: () => void;
}

export default function QuickInviteModal({ 
  isOpen, onClose, onSubmit, loading, inviteLink, copied, onCopy 
}: QuickInviteModalProps) {
  const [formData, setFormData] = useState({ department: "", job_title: "" });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ department: "", job_title: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {!inviteLink ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <Link size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Generate Invite Link</h3>
                <p className="text-xs text-[var(--color-ink-muted)]">Select their role. The user will provide their own details upon setup.</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Department</label>
                <select 
                  required 
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none"
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value, job_title: ""})}
                >
                  <option value="">Select Department...</option>
                  {Object.keys(STAFF_DEPARTMENTS).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Job Title</label>
                <select 
                  required 
                  disabled={!formData.department} 
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  value={formData.job_title} 
                  onChange={e => setFormData({...formData, job_title: e.target.value})}
                >
                  <option value="">{formData.department ? "Select Title..." : "Select Dept First"}</option>
                  {formData.department && STAFF_DEPARTMENTS[formData.department]?.map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !formData.department || !formData.job_title} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Link size={16} />}
                {loading ? "Generating..." : "Generate Link"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Check size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Link Ready!</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">Copy the link below and share it via SMS or WhatsApp. The user will set up their own name, email, and password.</p>
            
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              <code className="flex-1 text-xs text-[var(--color-ink)] truncate text-left">{inviteLink}</code>
              <button 
                onClick={onCopy} 
                className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all active:scale-95" 
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all mt-2"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
