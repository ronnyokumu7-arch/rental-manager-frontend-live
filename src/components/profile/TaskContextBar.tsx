// src/components/profile/TaskContextBar.tsx
"use client";

import { Calendar, Tag } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskContextBarProps {
  task: Task;
}

export default function TaskContextBar({ task }: TaskContextBarProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return {
      text: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      isOverdue
    };
  };

  const dateInfo = formatDate(task.due_date);

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  };

  // Truncate description to 20 words
  const truncateDescription = (text: string, wordLimit: number = 20) => {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return { text, needsTruncation: false };
    return { 
      text: words.slice(0, wordLimit).join(" ") + "...", 
      needsTruncation: true 
    };
  };

  const { text: truncatedDesc, needsTruncation } = task.description 
    ? truncateDescription(task.description, 20)
    : { text: "", needsTruncation: false };

  return (
    <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
      {/* Priority Badge + Title */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${priorityColors[task.priority] || priorityColors.low}`}>
          {task.priority}
        </span>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {task.title}
        </h3>
      </div>

      {/* Description (up to 2 lines / 20 words) */}
      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2">
          {truncatedDesc}
        </p>
      )}

      {/* Meta Info: Category + Due Date */}
      <div className="flex items-center gap-3 text-[10px]">
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Tag size={10} /> 
          <span className="capitalize">{task.category}</span>
        </span>
        <span className={`flex items-center gap-1 font-medium ${dateInfo.isOverdue ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
          <Calendar size={10} /> 
          {dateInfo.text}
          {dateInfo.isOverdue && <span className="font-bold">(OVERDUE)</span>}
        </span>
      </div>
    </div>
  );
}
