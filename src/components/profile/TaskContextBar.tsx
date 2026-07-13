// src/components/profile/TaskContextBar.tsx
"use client";

import { Calendar, Tag, AlertCircle } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskContextBarProps {
  task: Task;
}

export default function TaskContextBar({ task }: TaskContextBarProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "No due date", isOverdue: false };
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return {
      text: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      isOverdue
    };
  };

  const dateInfo = formatDate(task.due_date);

  // ✅ BRAND TOKENS: Semantic priority styling with opacity-based backgrounds
  const getPriorityStyle = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
      case 'high':
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
      case 'medium':
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);

  // Truncate description to 20 words
  const truncateDescription = (text: string, wordLimit: number = 20) => {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return { text, needsTruncation: false };
    return { 
      text: words.slice(0, wordLimit).join(" ") + "...", 
      needsTruncation: true 
    };
  };

  const { text: truncatedDesc } = task.description 
    ? truncateDescription(task.description, 20)
    : { text: "", needsTruncation: false };

  return (
    <div className="px-6 py-4 bg-[var(--color-surface-hover)]/30 border-b border-[var(--color-surface-border)]">
      
      {/* Priority Badge + Title Row */}
      <div className="flex items-center gap-2 mb-2">
        {task.priority && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${priorityStyle}`}>
            <AlertCircle size={9} />
            {task.priority}
          </span>
        )}
        <h3 className="text-sm font-bold text-[var(--color-ink)] leading-tight">
          {task.title}
        </h3>
      </div>

      {/* Description (up to 2 lines / 20 words) */}
      {truncatedDesc && (
        <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-3 line-clamp-2">
          {truncatedDesc}
        </p>
      )}

      {/* Meta Info: Category + Due Date */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
        
        {/* Category Tag */}
        {task.category && (
          <span className="flex items-center gap-1.5 text-[var(--color-ink-subtle)]">
            <Tag size={10} /> 
            <span className="capitalize">{task.category}</span>
          </span>
        )}

        {/* Due Date - Urgent Styling */}
        <span className={`flex items-center gap-1.5 ${
          dateInfo.isOverdue 
            ? "text-rose-600 dark:text-rose-400" 
            : "text-[var(--color-ink-subtle)]"
        }`}>
          <Calendar size={10} /> 
          {dateInfo.text}
          {dateInfo.isOverdue && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold">OVERDUE</span>
          )}
        </span>

      </div>
    </div>
  );
}
