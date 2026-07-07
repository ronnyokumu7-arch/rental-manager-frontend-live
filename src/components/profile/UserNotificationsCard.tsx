"use client";
import { Bell, Mail, MessageSquare } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { User } from "@/lib/types";

interface UserNotificationsCardProps {
  user: User;
}

export default function UserNotificationsCard({ user }: UserNotificationsCardProps) {
  // Mock preferences for UI demonstration (will be wired to backend later)
  const preferences = [
    { id: "booking_reminders", label: "Booking Reminders", email: true, sms: false },
    { id: "payment_receipts", label: "Payment Receipts", email: true, sms: false },
    { id: "system_warnings", label: "System Warnings", email: true, sms: true },
    { id: "weekly_reports", label: "Weekly Reports", email: false, sms: false },
  ];

  return (
    <SectionCard className="!p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Bell size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Email and SMS preferences</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-3">
        {preferences.map((pref) => (
          <div 
            key={pref.id} 
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                <Mail size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Channel</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{pref.label}</p>
              </div>
            </div>
            
            {/* Active Channels Badges */}
            <div className="flex items-center gap-2">
              {pref.email && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wide">
                  <Mail size={10} /> Email
                </span>
              )}
              {pref.sms && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                  <MessageSquare size={10} /> SMS
                </span>
              )}
              {!pref.email && !pref.sms && (
                <span className="text-xs text-slate-400 italic">Off</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
