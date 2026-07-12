// src/app/dashboard/users/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Shield, Bell, CheckCircle2, MoreVertical } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

// ✅ Import the modular components
import UserPersonalInfoCard from "@/components/profile/UserPersonalInfoCard";
import UserStatusCard from "@/components/profile/UserStatusCard";
import UserNotificationsCard from "@/components/profile/UserNotificationsCard";
import OperationsTab from "@/components/profile/OperationsTab"; // ✅ NEW: Import the split-layout component

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">User not found</h2>
        <button onClick={() => router.push("/dashboard/users")} className="mt-4 text-indigo-600 hover:underline font-semibold">
          Back to Users
        </button>
      </div>
    );
  }

  const initials = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const roleLabel = user.role === 'super_admin' 
    ? 'System' 
    : user.role.includes('admin') 
      ? 'Admin' 
      : 'Staff';

  return (
    <div className="space-y-6 pb-20">
      
      {/* ─ UNIFIED PREMIUM HEADER ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        
        {/* Top: Identity & Actions */}
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100 dark:border-slate-800">
          
          {/* Avatar with Status Dot */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-slate-900">
              {initials}
            </div>
            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${
              user.is_suspended ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          </div>

          {/* Identity Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{user.full_name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                user.role === 'super_admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                user.role.includes('admin') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {user.job_title || 'Team Member'} {user.department && `• ${user.department}`}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">{user.email}</p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard/users")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Users
            </button>
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Bottom: Integrated Tab Switcher */}
        <div className="px-6 pt-2 pb-0">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
      <div className="animate-in fade-in duration-300">
        
        {/* ✅ TAB 1: PROFILE & SECURITY */}
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

        {/* ✅ TAB 2: OPERATIONS (REPLACE PLACEHOLDER WITH ACTUAL COMPONENT) */}
        {activeTab === "operations" && (
          <OperationsTab 
            userId={user.id}
            currentUserRole={user.role}
            isSelfView={isSelfView}
          />
        )}

        {/* ✅ TAB 3: PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="max-w-3xl">
            <UserNotificationsCard user={user} />
          </div>
        )}

      </div>
    </div>
  );
}
