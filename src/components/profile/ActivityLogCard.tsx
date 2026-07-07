"use client";
import { FileText, Users, Car, Settings, Clock } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { ActivityLog } from "@/lib/api/activityLogs";

interface ActivityLogCardProps {
  logs: ActivityLog[];
}

// Helper to get icon based on target type
const getLogIcon = (targetType: string | null) => {
  switch (targetType) {
    case "booking": return <FileText size={14} />;
    case "client": return <Users size={14} />;
    case "vehicle": return <Car size={14} />;
    default: return <Settings size={14} />;
  }
};

// Helper to format action text
const formatAction = (action: string) => {
  return action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

export default function ActivityLogCard({ logs }: ActivityLogCardProps) {
  return (
    <SectionCard className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Recent Activity</h3>
        </div>
      </div>

      <div className="px-5 py-4">
        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-8 bottom-[-16px] w-px bg-slate-200 dark:bg-slate-700 last:hidden" />
                
                {/* Icon Dot */}
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  {getLogIcon(log.target_type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1.5">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatAction(log.action)}
                    {log.target_id && <span className="text-slate-500 dark:text-slate-400 font-normal"> #{log.target_id}</span>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Clock size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity found.</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
