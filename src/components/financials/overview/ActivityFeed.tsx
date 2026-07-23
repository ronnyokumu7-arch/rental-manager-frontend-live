// src/components/financials/overview/ActivityFeed.tsx
import { useRouter } from "next/navigation";
import { CreditCard, FileText, AlertCircle, ArrowRight } from "lucide-react";
import type { ActivityItem } from "@/hooks/financials/useFinancialOverview";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "payment_received": return CreditCard;
    case "contract_signed": return FileText;
    case "invoice_overdue": return AlertCircle;
    default: return ArrowRight;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "payment_received": return "text-[var(--color-success-text)] bg-[var(--color-success-bg)]";
    case "contract_signed": return "text-[var(--color-primary-text)] bg-[var(--color-primary-muted)]";
    case "invoice_overdue": return "text-[var(--color-danger-text)] bg-[var(--color-danger-bg)]";
    default: return "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)]";
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const router = useRouter();

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[var(--color-ink-muted)]">
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--color-surface-border)] max-h-80 overflow-y-auto custom-scrollbar">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.type);
        const colorClass = getActivityColor(activity.type);

        return (
          <button
            key={activity.id}
            onClick={() => router.push(activity.link)}
            className="w-full flex items-start gap-4 p-4 hover:bg-[var(--color-surface-hover)] transition-colors text-left group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass} transition-transform group-hover:scale-105`}>
              <Icon size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                  {activity.title}
                </p>
                <span className="text-[10px] font-medium text-[var(--color-ink-muted)] whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1 line-clamp-2">
                {activity.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
