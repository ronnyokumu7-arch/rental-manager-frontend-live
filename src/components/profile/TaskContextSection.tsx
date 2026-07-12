// src/components/profile/TaskContextSection.tsx
"use client";

import { Calendar, Tag, AlertCircle, Clock } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskContextSectionProps {
  task: Task;
}

export default function TaskContextSection({ task }: TaskContextSectionProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return {
      text: date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      isOverdue
    };
  };

  const dateInfo = formatDate(task.due_date);

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50",
    high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
    medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  };

  return (
    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Task Context
        </h3>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Meta Grid */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
          {/* Priority */}
          {task.priority && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority] || priorityColors.low}`}>
              <AlertCircle size={10} />
              {task.priority}
            </span>
          )}

          {/* Category */}
          {task.category && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <Tag size={10} />
              {task.category}
            </span>
          )}

          {/* Due Date */}
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${dateInfo.isOverdue ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
            <Calendar size={10} />
            {dateInfo.text}
            {dateInfo.isOverdue && <span className="ml-1">(OVERDUE)</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
