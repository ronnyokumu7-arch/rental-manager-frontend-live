// src/components/profile/UserNotificationsCard.tsx
"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { User } from "@/lib/types";

interface UserNotificationsCardProps {
  user: User;
}

export default function UserNotificationsCard({ user }: UserNotificationsCardProps) {
  // Mock preferences (will be wired to backend later)
  const [preferences, setPreferences] = useState([
    { id: "booking_reminders", label: "Booking Reminders", email: true, sms: false },
    { id: "payment_receipts", label: "Payment Receipts", email: true, sms: false },
    { id: "system_warnings", label: "System Warnings", email: true, sms: true },
    { id: "weekly_reports", label: "Weekly Reports", email: false, sms: false },
  ]);

  const toggleChannel = (prefId: string, channel: "email" | "sms") => {
    setPreferences(prev => 
      prev.map(p => 
        p.id === prefId ? { ...p, [channel]: !p[channel] } : p
      )
    );
  };

  return (
    <SectionCard className="!p-0 overflow-hidden">
      
      {/* Unified Header */}
      <div className="flex items-center gap-3 p-6 pb-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center">
          <Bell size={18} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Notification Preferences</h3>
          <p className="text-[11px] text-[var(--color-ink-muted)]">Manage how you receive updates and alerts</p>
        </div>
      </div>

      {/* Dense Preference Rows */}
      <div className="px-6 divide-y divide-[var(--color-surface-border)]">
        
        {preferences.map((pref) => (
          <div key={pref.id} className="py-4 first:pt-4 last:pb-4">
            
            {/* Label Row */}
            <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-3">
              {pref.label}
            </p>

            {/* Channel Toggles - Flush Grid Layout */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Email Toggle */}
              <button
                onClick={() => toggleChannel(pref.id, "email")}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  pref.email 
                    ? "bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400" 
                    : "bg-[var(--color-surface-hover)]/30 border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  pref.email 
                    ? "bg-blue-500/10 text-blue-500" 
                    : "bg-[var(--color-surface)] text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink-muted)]"
                }`}>
                  <Mail size={16} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">Email</span>
                  <span className="text-[10px] opacity-70">{pref.email ? "Enabled" : "Disabled"}</span>
                </div>
                
                {/* Active Indicator Dot */}
                {pref.email && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>

              {/* SMS Toggle */}
              <button
                onClick={() => toggleChannel(pref.id, "sms")}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  pref.sms 
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                    : "bg-[var(--color-surface-hover)]/30 border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  pref.sms 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : "bg-[var(--color-surface)] text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink-muted)]"
                }`}>
                  <Smartphone size={16} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">SMS / Text</span>
                  <span className="text-[10px] opacity-70">{pref.sms ? "Enabled" : "Disabled"}</span>
                </div>
                
                {/* Active Indicator Dot */}
                {pref.sms && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

            </div>
          </div>
        ))}

      </div>
    </SectionCard>
  );
}
