// src/app/dashboard/users/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Shield, Bell, CheckCircle2, MoreVertical, Camera } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

// ✅ Import the modular components
import UserPersonalInfoCard from "@/components/profile/UserPersonalInfoCard";
import UserStatusCard from "@/components/profile/UserStatusCard";
import UserNotificationsCard from "@/components/profile/UserNotificationsCard";
import OperationsTab from "@/components/profile/OperationsTab";

const TABS = [
  { id: "profile", label: "Profile & Security", icon: User },
  { id: "operations", label: "Operations", icon: CheckCircle2 },
  { id: "preferences", label: "Preferences", icon: Bell },
];

export default function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  
  const { user, loading, handleUpdateUser, handleStatusAction } = useUserProfile();
  
  // TODO: Replace with actual auth context check
  const currentUserId = 1; 
  const isSelfView = user?.id === currentUserId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">User not found</h2>
        <button 
          onClick={() => router.push("/dashboard/users")} 
          className="mt-4 text-[var(--color-primary)] hover:underline font-semibold"
        >
          Back to Users
        </button>
      </div>
    );
  }

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user.full_name);
  
  // Determine role badge styling using opacity-based tokens
  const getRoleBadge = () => {
    switch (user.role) {
      case 'super_admin':
        return { label: 'System', class: 'bg-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-500/10' };
      case 'admin':
        return { label: 'Admin', class: 'bg-[var(--color-primary)]/5 text-[var(--color-primary)] border border-[var(--color-primary)]/10' };
      default:
        return { label: 'Staff', class: 'bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* ─ UNIFIED PREMIUM HEADER ── */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden shadow-[var(--shadow-card)]">
        
        {/* Top: Identity & Actions */}
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-[var(--color-surface-border)]">
          
          {/* Avatar with Status Dot */}
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-[var(--color-surface)] transition-transform group-hover:scale-105">
              {initials}
            </div>
            {/* Upload hint overlay (visual only for now) */}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
            {/* Live Status Indicator */}
            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-[var(--color-surface)] ${
              user.is_suspended ? 'bg-amber-500' : user.is_active ? 'bg-emerald-500' : 'bg-[var(--color-ink-subtle)]'
            }`} title={user.is_suspended ? 'Suspended' : user.is_active ? 'Active' : 'Inactive'} />
          </div>

          {/* Identity Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[var(--color-ink)] truncate">{user.full_name}</h1>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${roleBadge.class}`}>
                {roleBadge.label}
              </span>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] truncate">
              {user.job_title || 'Team Member'} {user.department && `• ${user.department}`}
            </p>
            <p className="text-xs text-[var(--color-ink-subtle)] mt-1 truncate font-mono">{user.email}</p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <button
              onClick={() => router.push("/dashboard/users")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 border border-[var(--color-surface-border)] transition-all active:scale-95"
            >
              <ArrowLeft size={14} /> Back to Users
            </button>
            <button className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Bottom: Integrated Tab Switcher */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex items-center gap-1 bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] p-1 rounded-xl w-fit">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-surface-border)]"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/50"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT AREA ── */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* TAB 1: PROFILE & SECURITY */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UserPersonalInfoCard 
                user={user} 
                onSave={handleUpdateUser} 
                isSelfView={isSelfView} 
              />
            </div>
            <div className="lg:col-span-1">
              <UserStatusCard 
                user={user} 
                onStatusAction={handleStatusAction} 
                isSelfView={isSelfView} 
              />
            </div>
          </div>
        )}

        {/* TAB 2: OPERATIONS */}
        {activeTab === "operations" && (
          <OperationsTab 
            userId={user.id}
            currentUserRole={user.role}
            isSelfView={isSelfView}
          />
        )}

        {/* TAB 3: PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="max-w-3xl">
            <UserNotificationsCard user={user} />
          </div>
        )}

      </div>
    </div>
  );
}
