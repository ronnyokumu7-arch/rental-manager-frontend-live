// src/components/profile/ActionCenterList.tsx
"use client";

import { useState } from "react";
import { 
  CheckCircle2, Circle, Clock, AlertCircle, 
  Tag, Calendar, Eye, UserPlus, MoreVertical,
  Users, Shield, Briefcase, DollarSign, Car
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

// Category icon mapper
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  compliance: Shield,
  fleet: Car,
  finance: DollarSign,
  booking: Briefcase,
  hr: Users,
  operations: Tag,
};

const PRIORITY_COLORS: Record<string, "default" | "success" | "warning" | "danger" | "accent"> = {
  low: "default",
  medium: "accent",
  high: "warning",
  urgent: "danger",
};

// ✅ NEW: Priority Dot Colors for the Pool Tab
const PRIORITY_DOT_COLORS: Record<string, string> = {
  low: "bg-slate-400 dark:bg-slate-500",
  medium: "bg-indigo-500 dark:bg-indigo-400",
  high: "bg-amber-500 dark:bg-amber-400",
  urgent: "bg-red-500 dark:bg-red-400",
};

export default function ActionCenterList({
  tasks, unassignedTasks, staffMembers, selectedTask, onSelectTask,
  activeTab, onTabChange, loading, updatingId, isAdmin,
  onToggleComplete, onAssignTask
}: ActionCenterListProps) {

  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);

  // Filter tasks by tab
  const displayTasks = activeTab === "pool" 
    ? unassignedTasks 
    : activeTab === "done" 
      ? tasks.filter(t => t.status === "completed")
      : tasks.filter(t => t.status === "pending");

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No due date";
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
    // Claim assigns to current user - you'll need to pass current user ID
    // For now, we'll just use the first staff member or handle it differently
    if (staffMembers.length > 0) {
      onAssignTask(taskId, staffMembers[0].id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Action Center</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {displayTasks.length} Items
          </span>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
          {(["pending", "done", "pool"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab === "pending" ? "Pending" : tab === "done" ? "Done" : "Pool"}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            Loading tasks...
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">All caught up!</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {displayTasks.map((task) => {
              const isCompleted = task.status === "completed";
              const isSelected = selectedTask?.id === task.id;
              const dateInfo = formatDate(task.due_date);
              const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
              const isOverdue = dateInfo.isOverdue && !isCompleted;
              const isUnassigned = activeTab === "pool";
              const priorityDotColor = PRIORITY_DOT_COLORS[task.priority] || "bg-slate-400";

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50"
                      : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600"
                  } ${isCompleted ? "opacity-75" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    
                    {/* ✅ CONDITIONAL LEFT ICON */}
                    {isUnassigned ? (
                      // Pool Tab: Priority Dot
                      <div className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${priorityDotColor} shadow-sm ring-2 ring-white dark:ring-slate-800`} />
                    ) : (
                      // Pending/Done Tab: Interactive Checkbox
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                        disabled={updatingId === task.id}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <Circle size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500" />
                        )}
                      </button>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title Row */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm font-semibold leading-tight ${
                          isCompleted 
                            ? "text-slate-400 dark:text-slate-500 line-through" 
                            : "text-slate-900 dark:text-slate-100"
                        }`}>
                          {task.title}
                        </p>
                        <Badge variant={PRIORITY_COLORS[task.priority] || "default"} size="sm">
                          {task.priority}
                        </Badge>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Meta Row */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <CategoryIcon size={11} />
                          <span className="capitalize">{task.category}</span>
                        </span>
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500 dark:text-red-400 font-semibold" : ""}`}>
                          <Calendar size={11} />
                          {dateInfo.text}
                          {isOverdue && <span className="ml-1">(OVERDUE)</span>}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Pool Tab: Claim/Assign Buttons */}
                      {isUnassigned && isAdmin && (
                        <div className="relative">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleClaim(task.id); 
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors"
                          >
                            <UserPlus size={12} /> Claim
                          </button>
                          
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setShowMenuFor(showMenuFor === task.id ? null : task.id); 
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <MoreVertical size={14} />
                          </button>
                          
                          {/* Assign Dropdown */}
                          {showMenuFor === task.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                              <div className="p-2">
                                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 px-2 py-1 mb-1">Assign to:</p>
                                {staffMembers.map((staff) => (
                                  <button
                                    key={staff.id}
                                    onClick={(e) => { e.stopPropagation(); handleAssign(task.id, staff.id); }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                      {staff.full_name?.[0] || "U"}
                                    </div>
                                    <span className="truncate">{staff.full_name}</span>
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
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 transition-colors disabled:opacity-50"
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
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
