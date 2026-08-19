// src/components/users/QuickInviteModal.tsx
import { useState, useEffect } from "react";
import { UserPlus, Loader2, Check, Copy, Mail, MessageSquare, Phone } from "lucide-react";

const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  "Finance": ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

interface QuickInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    full_name: string; 
    email: string; 
    phone_number?: string;
    department: string; 
    job_title: string;
    password: string;
  }) => Promise<void>;
  loading: boolean;
  successMessage: string | null;
}

export default function QuickInviteModal({ 
  isOpen, onClose, onSubmit, loading, successMessage 
}: QuickInviteModalProps) {
  const [formData, setFormData] = useState({ 
    full_name: "", 
    email: "", 
    phone_number: "",
    department: "", 
    job_title: "",
    password: ""
  });
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ 
        full_name: "", 
        email: "", 
        phone_number: "",
        department: "", 
        job_title: "",
        password: ""
      });
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleCopyCredentials = () => {
    const credentials = `Email: ${formData.email}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(credentials);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `Your account has been created!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nPlease log in and change your password.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareSMS = () => {
    const message = `Your account: ${formData.email} / ${formData.password}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = "Your Account Credentials";
    const body = `Email: ${formData.email}\nPassword: ${formData.password}\n\nPlease log in and change your password.`;
    window.open(`mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {!successMessage ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Quick Add Member</h3>
                <p className="text-xs text-[var(--color-ink-muted)]">Create an account and email their credentials.</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Name & Email */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Full Name <span className="text-[var(--color-danger)]">*</span></label>
                <input 
                  type="text"
                  required 
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Email Address <span className="text-[var(--color-danger)]">*</span></label>
                <input 
                  type="email"
                  required 
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Phone Number</label>
                <input 
                  type="tel"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  value={formData.phone_number} 
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="+254 7..."
                />
              </div>

              {/* Department & Job Title */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Department <span className="text-[var(--color-danger)]">*</span></label>
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
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Job Title <span className="text-[var(--color-danger)]">*</span></label>
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

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Temporary Password <span className="text-[var(--color-danger)]">*</span></label>
                <input 
                  type="password"
                  required 
                  minLength={8}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Min 8 characters"
                />
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
                disabled={loading || !formData.full_name || !formData.email || !formData.department || !formData.job_title || !formData.password} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Check size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">Account Created!</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">{successMessage}</p>
            
            {/* Unified Share Buttons */}
            <div className="space-y-2 pt-2">
              <button 
                onClick={handleCopyCredentials}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Credentials"}
              </button>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
                >
                  <MessageSquare size={14} />
                  WhatsApp
                </button>
                <button 
                  onClick={handleShareSMS}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
                >
                  <Phone size={14} />
                  SMS
                </button>
                <button 
                  onClick={handleShareEmail}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
                >
                  <Mail size={14} />
                  Email
                </button>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all mt-4"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
