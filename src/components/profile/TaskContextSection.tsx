"use client";

import { Calendar, Tag, AlertCircle, Clock, ArrowRight, CheckCircle2, Ban } from "lucide-react";
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

  // ✅ ADDED: Status styling for the new workflow states
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'in_progress': return "text-blue-600 dark:text-blue-400 bg-blue-500/5 border-blue-500/10";
      case 'in_review': return "text-purple-600 dark:text-purple-400 bg-purple-500/5 border-purple-500/10";
      case 'blocked': return "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/10";
      case 'completed': return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10";
      case 'unassigned': return "text-[var(--color-ink-subtle)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
      default: return "text-slate-600 dark:text-slate-400 bg-slate-500/5 border-slate-500/10"; // pending
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'in_progress': return <Clock size={10} />;
      case 'in_review': return <AlertCircle size={10} />;
      case 'blocked': return <Ban size={10} />;
      case 'completed': return <CheckCircle2 size={10} />;
      default: return <Clock size={10} />;
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);
  const statusStyle = getStatusStyle(task.status);

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

          {/* ✅ ADDED: Status Badge */}
          {task.status && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusStyle}`}>
              {getStatusIcon(task.status)}
              <span className="capitalize">{task.status.replace("_", " ")}</span>
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
