// src/components/settings/UserManagementSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Users, Plus, Mail, Copy, Check, Loader2, MoreVertical, 
  Shield, ShieldAlert, Trash2, UserCheck, UserX 
} from "lucide-react";
import toast from "react-hot-toast";
import { usersApi, type UserCreatePayload } from "@/lib/api/users";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department?: string | null;
  job_title?: string | null;
  is_active: boolean;
  is_suspended: boolean;
  is_onboarded: boolean;
  invite_token?: string | null;
}

export default function UserManagementSettings() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserCreatePayload>({
    full_name: "",
    email: "",
    role: "tenant_staff",
    department: "",
    job_title: "",
    is_active: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Notice: We do NOT send a password. This triggers "Invite Mode" on the backend.
      const newUser = await usersApi.create({ ...formData, password: undefined });
      setUsers([newUser, ...users]);
      setShowInviteModal(false);
      
      // Generate the shareable link
      const link = `${window.location.origin}/invite?token=${newUser.invite_token}`;
      setInviteLink(link);
      toast.success("Invite created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied! Ready to share via SMS or WhatsApp.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSuspend = async (userId: number) => {
    try {
      await usersApi.suspend(userId, "Suspended via Settings");
      toast.success("User suspended");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to suspend user");
    }
  };

  const handleReactivate = async (userId: number) => {
    try {
      await usersApi.reactivate(userId);
      toast.success("User reactivated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to reactivate user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-ink)]">Team Members</h3>
          <p className="text-sm text-[var(--color-ink-muted)]">Manage access, roles, and invite new staff.</p>
        </div>
        <button
          onClick={() => { setShowInviteModal(true); setInviteLink(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 shadow-[var(--shadow-md)]"
        >
          <Plus size={16} /> Invite User
        </button>
      </div>

      {/* User List */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-hover)]/50 border-b border-[var(--color-surface-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[var(--color-ink-muted)]">User</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-ink-muted)]">Role & Department</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-ink-muted)]">Status</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-ink-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-surface-border)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-xs">
                        {user.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--color-ink)] flex items-center gap-2">
                          {user.full_name}
                          {!user.is_onboarded && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Pending Invite
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--color-ink-muted)]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[var(--color-ink)]">{user.job_title || "No Title"}</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">{user.department || "No Department"}</div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_suspended ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                        <UserX size={12} /> Suspended
                      </span>
                    ) : user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <UserCheck size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.is_suspended ? (
                        <button onClick={() => handleReactivate(user.id)} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors" title="Reactivate">
                          <UserCheck size={16} />
                        </button>
                      ) : (
                        <button onClick={() => handleSuspend(user.id)} className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-600 transition-colors" title="Suspend">
                          <ShieldAlert size={16} />
                        </button>
                      )}
                      <button className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {!inviteLink ? (
              <form onSubmit={handleInvite} className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Team Member</h3>
                    <p className="text-xs text-[var(--color-ink-muted)]">They will receive a secure link to set up their account.</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Full Name</label>
                    <input required className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" 
                      value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Email Address</label>
                    <input required type="email" className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Department</label>
                      <select className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                        <option value="">Select...</option>
                        <option value="Fleet & Operations">Fleet & Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="Sales & Contracts">Sales & Contracts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Job Title</label>
                      <input className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" 
                        value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} placeholder="e.g. Dispatcher" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2">
                    Generate Invite
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <Check size={32} />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Ready!</h3>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Copy the link below and share it via SMS or WhatsApp. It expires in 48 hours.
                </p>
                
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                  <code className="flex-1 text-xs text-[var(--color-ink)] truncate text-left">{inviteLink}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all active:scale-95"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <button 
                  onClick={() => { setShowInviteModal(false); setInviteLink(null); setFormData({ full_name: "", email: "", role: "tenant_staff", department: "", job_title: "", is_active: true }); }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all mt-2"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
