// src/components/profile/ActionCenterList.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { 
  CheckCircle2, Clock, Tag, Calendar, Eye, UserPlus, 
  Users, Shield, Briefcase, DollarSign, Car, ArrowUpRight
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Task, User } from "@/lib/types";

interface ActionCenterListProps {
  tasks: Task[];
  unassignedTasks: Task[];
  staffMembers: User[];
  selectedTask: Task | null;
  onSelectTask: (task: Task) => void;
  activeTab: "pending" | "done" | "pool";
  onTabChange: (tab: "pending" | "done" | "pool") => void;
  loading: boolean;
  updatingId: number | null;
  isAdmin: boolean;
  onToggleComplete: (taskId: number) => void;
  onAssignTask: (taskId: number, userId: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  compliance: Shield,
  fleet: Car,
  finance: DollarSign,
  booking: Briefcase,
  hr: Users,
  operations: Tag,
};

const PRIORITY_DOT_COLORS: Record<string, string> = {
  urgent: "bg-rose-500 shadow-[0_0_8px_-2px_rgba(244,63,94,0.6)]",
  high: "bg-amber-500 shadow-[0_0_8px_-2px_rgba(245,158,11,0.6)]",
  medium: "bg-blue-500 shadow-[0_0_8px_-2px_rgba(59,130,246,0.6)]",
  low: "bg-[var(--color-ink-subtle)]",
};

export default function ActionCenterList({
  tasks, unassignedTasks, staffMembers, selectedTask, onSelectTask,
  activeTab, onTabChange, loading, updatingId, isAdmin,
  onToggleComplete, onAssignTask
}: ActionCenterListProps) {

  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenuFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayTasks = activeTab === "pool" 
    ? unassignedTasks 
    : activeTab === "done" 
      ? tasks.filter(t => t.status === "completed")
      : tasks.filter(t => t.status === "pending");

  // ✅ Calculate counts for each tab
  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const unassignedCount = unassignedTasks.length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "No due date", isOverdue: false };
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return {
      text: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      isOverdue
    };
  };

  const handleAssign = (taskId: number, userId: number) => {
    onAssignTask(taskId, userId);
    setShowMenuFor(null);
  };

  const handleClaim = (taskId: number) => {
    if (staffMembers.length > 0) {
      onAssignTask(taskId, staffMembers[0].id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      
      {/* ✅ REDESIGNED HEADER: Heading + Tabs with counts */}
      <div className="px-5 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-lg font-bold text-[var(--color-ink)]">Action Center</h3>
          
          {/* ✅ PREMIUM PURPLE TAB SWITCHER WITH COUNTS */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
            <button
              onClick={() => onTabChange("pending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "pending"
                  ? "bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
              }`}
            >
              Pending
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "pending" 
                  ? "bg-white/20 text-white" 
                  : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]"
              }`}>
                {pendingCount}
              </span>
            </button>
            
            <button
              onClick={() => onTabChange("done")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "done"
                  ? "bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
              }`}
            >
              Completed
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "done" 
                  ? "bg-white/20 text-white" 
                  : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]"
              }`}>
                {completedCount}
              </span>
            </button>
            
            <button
              onClick={() => onTabChange("pool")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "pool"
                  ? "bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
              }`}
            >
              Unassigned Pool
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "pool" 
                  ? "bg-white/20 text-white" 
                  : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]"
              }`}>
                {unassignedCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TASK LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-ink-muted)]">
            <Clock size={24} className="animate-spin mb-3 text-[var(--color-primary)]" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading tasks...</p>
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-[var(--color-ink)] mb-1">All Caught Up!</p>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-[220px] leading-relaxed">
              No tasks in this view. New items will appear here as they are generated.
            </p>
          </div>
        ) : (
          displayTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isSelected = selectedTask?.id === task.id;
            const dateInfo = formatDate(task.due_date);
            const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
            const isOverdue = dateInfo.isOverdue && !isCompleted;
            const isUnassigned = activeTab === "pool";
            const priorityDotColor = PRIORITY_DOT_COLORS[task.priority] || PRIORITY_DOT_COLORS.low;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`group relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 ring-1 ring-[var(--color-primary)]/10"
                    : "bg-[var(--color-surface)] border-[var(--color-surface-border)] hover:border-[var(--color-surface-border)]/80 hover:shadow-sm"
                } ${isCompleted ? "opacity-70" : ""}`}
              >
                <div className="flex items-start gap-3">
                  
                  {/* Left: Priority Dot */}
                  <div className="mt-1 flex-shrink-0">
                    {isUnassigned || !isCompleted ? (
                      <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-[var(--color-surface)] ${priorityDotColor}`} />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-semibold leading-tight ${
                        isCompleted 
                          ? "text-[var(--color-ink-subtle)] line-through decoration-[var(--color-ink-subtle)]/50" 
                          : "text-[var(--color-ink)]"
                      }`}>
                        {task.title}
                      </p>
                      <Badge 
                        variant={
                          task.priority === "urgent" ? "danger" : 
                          task.priority === "high" ? "warning" : 
                          task.priority === "medium" ? "accent" : "default"
                        } 
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                      <span className="flex items-center gap-1">
                        <CategoryIcon size={11} />
                        <span className="capitalize">{task.category}</span>
                      </span>
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-rose-500" : ""}`}>
                        <Calendar size={11} />
                        {dateInfo.text}
                        {isOverdue && <span className="ml-1 px-1 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold">OVERDUE</span>}
                      </span>
                    </div>
                  </div>

                  {/* ✅ SWAPPED: Assign (left) + Claim (right) */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {isUnassigned && isAdmin && (
                      <div className="relative flex items-center gap-1.5" ref={showMenuFor === task.id ? menuRef : undefined}>
                        {/* ✅ Assign Button (now on LEFT) */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setShowMenuFor(showMenuFor === task.id ? null : task.id); 
                          }}
                          className="p-1.5 rounded-lg text-[var(--color-ink-subtle)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/20 transition-all active:scale-95"
                          title="Assign to team member"
                        >
                          <Users size={14} />
                        </button>
                        
                        {/* ✅ Claim Button (now on RIGHT) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleClaim(task.id); }}
                          disabled={updatingId === task.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {updatingId === task.id ? (
                            <Clock size={12} className="animate-spin" />
                          ) : (
                            <UserPlus size={12} />
                          )}
                          Claim
                        </button>
                        
                        {/* Assign Dropdown */}
                        {showMenuFor === task.id && (
                          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2">
                              <p className="text-[10px] font-bold uppercase text-[var(--color-ink-muted)] px-2 py-1.5 mb-1">Assign To:</p>
                              {staffMembers.map((staff) => (
                                <button
                                  key={staff.id}
                                  onClick={(e) => { e.stopPropagation(); handleAssign(task.id, staff.id); }}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors text-left group/item"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] flex-shrink-0 group-hover/item:bg-[var(--color-primary)]/20 transition-colors">
                                    {staff.full_name?.[0] || "U"}
                                  </div>
                                  <span className="truncate flex-1">{staff.full_name}</span>
                                  <ArrowUpRight size={12} className="text-[var(--color-ink-subtle)] opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isUnassigned && !isCompleted && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                        disabled={updatingId === task.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {updatingId === task.id ? (
                          <Clock size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        Done
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                        className="p-2 rounded-lg text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
