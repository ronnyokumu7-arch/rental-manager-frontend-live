// src/components/profile/ActionCenterList.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { 
  CheckCircle2, Circle, Clock, AlertCircle, 
  Tag, Calendar, Eye, UserPlus, MoreVertical,
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

// ✅ BRAND TOKENS: Semantic category icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  compliance: Shield,
  fleet: Car,
  finance: DollarSign,
  booking: Briefcase,
  hr: Users,
  operations: Tag,
};

// Priority dot colors using opacity-based tokens
const PRIORITY_DOT_COLORS: Record<string, string> = {
  low: "bg-[var(--color-ink-subtle)]",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  urgent: "bg-rose-500",
};

export default function ActionCenterList({
  tasks, unassignedTasks, staffMembers, selectedTask, onSelectTask,
  activeTab, onTabChange, loading, updatingId, isAdmin,
  onToggleComplete, onAssignTask
}: ActionCenterListProps) {

  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenuFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tasks by tab
  const displayTasks = activeTab === "pool" 
    ? unassignedTasks 
    : activeTab === "done" 
      ? tasks.filter(t => t.status === "completed")
      : tasks.filter(t => t.status === "pending");

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
      
      {/* Unified Header with Integrated Tabs */}
      <div className="px-6 py-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Action Center</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] px-2 py-1 rounded-lg">
            {displayTasks.length} Items
          </span>
        </div>
        
        {/* Premium Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
          {(["pending", "done", "pool"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-surface-border)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/50"
              }`}
            >
              {tab === "pending" ? "Pending" : tab === "done" ? "Completed" : "Unassigned Pool"}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
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
            const priorityDotColor = PRIORITY_DOT_COLORS[task.priority] || "bg-[var(--color-ink-subtle)]";

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 ring-1 ring-[var(--color-primary)]/10"
                    : "bg-[var(--color-surface)] border-[var(--color-surface-border)] hover:border-[var(--color-surface-border)]/80 hover:shadow-sm"
                } ${isCompleted ? "opacity-70" : ""}`}
              >
                <div className="flex items-start gap-4">
                  
                  {/* Left Indicator: Checkbox or Priority Dot */}
                  <div className="mt-0.5 flex-shrink-0">
                    {isUnassigned ? (
                      <div className={`w-2.5 h-2.5 rounded-full ${priorityDotColor} shadow-sm ring-2 ring-[var(--color-surface)] mt-1`} />
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                        disabled={updatingId === task.id}
                        className="transition-transform active:scale-90"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <Circle size={18} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink-muted)] transition-colors" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Title + Priority Row */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
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

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-2.5 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Meta Row */}
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

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    
                    {/* Pool Tab: Claim / Assign */}
                    {isUnassigned && isAdmin && (
                      <div className="relative" ref={showMenuFor === task.id ? menuRef : undefined}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleClaim(task.id); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all active:scale-95"
                        >
                          <UserPlus size={12} /> Claim
                        </button>
                        
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setShowMenuFor(showMenuFor === task.id ? null : task.id); 
                          }}
                          className="p-1.5 rounded-xl text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {/* Assign Dropdown */}
                        {showMenuFor === task.id && (
                          <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2">
                              <p className="text-[10px] font-bold uppercase text-[var(--color-ink-muted)] px-2 py-1.5 mb-1">Assign To:</p>
                              {staffMembers.map((staff) => (
                                <button
                                  key={staff.id}
                                  onClick={(e) => { e.stopPropagation(); handleAssign(task.id, staff.id); }}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors text-left group/item"
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

                    {/* Pending Tab: Complete Button */}
                    {!isUnassigned && !isCompleted && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                        disabled={updatingId === task.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {updatingId === task.id ? (
                          <Clock size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        Done
                      </button>
                    )}

                    {/* Completed Tab: View Button */}
                    {isCompleted && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                        className="p-2 rounded-xl text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors"
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
