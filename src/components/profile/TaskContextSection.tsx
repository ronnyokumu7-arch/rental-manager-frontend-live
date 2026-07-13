// src/components/profile/TaskContextSection.tsx
"use client";

import { Calendar, Tag, AlertCircle, Clock, ArrowRight } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskContextSectionProps {
  task: Task;
}

export default function TaskContextSection({ task }: TaskContextSectionProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "No due date", isOverdue: false };
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return {
      text: date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      isOverdue
    };
  };

  const dateInfo = formatDate(task.due_date);

  // ✅ BRAND TOKENS: Semantic priority styling with opacity-based backgrounds
  const getPriorityStyle = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/10";
      case 'high':
        return "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/10";
      case 'medium':
        return "text-blue-600 dark:text-blue-400 bg-blue-500/5 border-blue-500/10";
      default:
        return "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <div className="p-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
      
      {/* Context Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-4 rounded-full bg-[var(--color-primary)]" />
        <h3 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">
          Task Context
        </h3>
      </div>

      {/* Task Identity */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-ink)] leading-snug">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Meta Grid - Flush Alignment */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--color-surface-border)]/50">
          
          {/* Priority Badge */}
          {task.priority && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${priorityStyle}`}>
              <AlertCircle size={10} />
              {task.priority}
            </span>
          )}

          {/* Category Tag */}
          {task.category && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
              <Tag size={10} />
              {task.category}
            </span>
          )}

          {/* Due Date - Urgent Styling */}
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
            dateInfo.isOverdue 
              ? "text-rose-600 dark:text-rose-400" 
              : "text-[var(--color-ink-muted)]"
          }`}>
            <Calendar size={10} />
            {dateInfo.text}
            {dateInfo.isOverdue && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold">OVERDUE</span>
            )}
          </span>

          {/* Target Reference Link (Optional Enhancement) */}
          {task.target_type && task.target_id && (
            <a 
              href={`/dashboard/${task.target_type}s/${task.target_id}`}
              className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors group"
            >
              View {task.target_type} <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

        </div>
      </div>
    </div>
  );
}
