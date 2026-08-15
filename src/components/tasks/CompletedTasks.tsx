// src/app/dashboard/tasks/CompletedTasks.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Calendar, Tag, CheckCircle2, RotateCcw, Eye,
  Search, Clock, Users, UserX, Wrench, Building2, Briefcase, DollarSign, Shield, Car
} from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import type { Task, User } from "@/lib/types";
import type { TimeFilter } from "@/hooks/tasks/useTasksList";

interface CompletedTasksTabProps {
  tasks: Task[];
  users: User[];
  loading: boolean;
  metrics: { completedToday: number; completedThisWeek: number; completedThisMonth: number };
  
  // Filters
  search: string;
  setSearch: (val: string) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (val: TimeFilter) => void;
  selectedUserId: string;
  setSelectedUserId: (val: string) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  pageSize: number;
  totalPages: number;
  filteredTasks: Task[];

  // Dropdown & Actions
  openDropdownId: number | null;
  dropdownPos: { top: number; right: number } | null;
  onToggleDropdown: (e: React.MouseEvent, taskId: number) => void;
  onReopen: (taskId: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  compliance: Shield, fleet: Car, finance: DollarSign, booking: Briefcase,
  hr: Users, operations: Building2, maintenance: Wrench, other: Tag,
};

const TIME_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: "", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-blue-500",
  low: "bg-slate-400",
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "No date";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getAssigneeName = (userId: number | null, users: User[]) => {
  if (!userId) return null;
  const user = users.find((u) => u.id === userId);
  return user?.full_name || "Unknown User";
};

const getAssigneeInitials = (userId: number | null, users: User[]) => {
  const name = getAssigneeName(userId, users);
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
};

export default function CompletedTasksTab({
  tasks, users, loading, metrics,
  search, setSearch, timeFilter, setTimeFilter,
  selectedUserId, setSelectedUserId,
  currentPage, setCurrentPage, pageSize, totalPages, filteredTasks,
  openDropdownId: _openDropdownId, // ✅ Not used - handled by reusable components
  dropdownPos: _dropdownPos, // ✅ Not used - handled by reusable components
  onToggleDropdown: _onToggleDropdown, // ✅ Not used - handled by reusable components
  onReopen,
}: CompletedTasksTabProps) {
  const router = useRouter();

  // Calculate total completed (all time)
  const totalCompleted = tasks.length;

  // ✅ Reusable row actions for both table and cards
  const getTaskActions = (task: Task): RowAction<Task>[] => [
    {
      label: "Reopen Task",
      icon: RotateCcw,
      variant: "primary",
      onClick: () => onReopen(task.id),
    },
    {
      label: "View Details",
      icon: Eye,
      variant: "default",
      separator: true,
      onClick: () => router.push(`/dashboard/tasks/${task.id}`),
    },
  ];

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
        <Clock className="w-5 h-5 animate-spin" /> Loading tasks...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ✅ TOOLBAR: Metrics + Search + Filters */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        
        {/* Metrics Counter Panel */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">All</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalCompleted}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Today</span>
            <span className="text-xs font-bold text-emerald-500 tabular-nums">{metrics.completedToday}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">This Week</span>
            <span className="text-xs font-bold text-blue-500 tabular-nums">{metrics.completedThisWeek}</span>
          </div>
        </div>

        {/* Controls: Search + Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-80">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search completed..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>

            {/* ✅ Reusable FilterDropdown - Time */}
            <FilterDropdown
              filterId="completed-time"
              label="Time"
              options={TIME_OPTIONS.filter((opt) => opt.id !== "").map((opt) => ({ label: opt.label, value: opt.id }))}
              value={timeFilter || null}
              onChange={(value) => setTimeFilter((value || "") as TimeFilter)}
              icon={Clock}
            />

            {/* ✅ Reusable FilterDropdown - User (custom options) */}
            <FilterDropdown
              filterId="completed-user"
              label="User"
              options={users.map((user) => ({ label: user.full_name, value: user.id.toString() }))}
              value={selectedUserId || null}
              onChange={(value) => setSelectedUserId(value || "")}
              icon={Users}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <>
        {/* ✅ MOBILE: Reusable CardGrid */}
        <div className="block md:hidden">
          <CardGrid<Task> // ✅ FIXED: Explicitly pass Task generic type
            data={filteredTasks}
            getCardId={(task) => task.id}
            
            // Header: Icon + Title + Priority (completed styling)
            renderCardHeader={({ item }) => {
              const CategoryIcon = CATEGORY_ICONS[item.category] || Tag;
              return (
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <CategoryIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/tasks/${item.id}`);
                      }}
                      className="text-sm font-bold truncate cursor-pointer hover:text-[var(--color-primary)] transition-colors leading-tight line-through decoration-[var(--color-ink-subtle)]/50 text-[var(--color-ink)]"
                    >
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[item.priority] || "bg-slate-400"}`} />
                      <span className="text-xs font-medium text-[var(--color-ink-muted)] capitalize">{item.priority}</span>
                    </div>
                  </div>
                </div>
              );
            }}
            
            // ✅ FIXED: Merged renderCardPreview and renderCardDetails into renderCardBody
            renderCardBody={({ item }) => {
              const assigneeName = getAssigneeName(item.user_id, users);
              
              return (
                <div className="space-y-2.5 text-xs">
                  {/* Assignee */}
                  <div className="flex items-center gap-2">
                    {assigneeName ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          {getAssigneeInitials(item.user_id, users)}
                        </div>
                        <span className="font-medium text-[var(--color-ink)] truncate">{assigneeName}</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                        <UserX size={10} /> Unassigned
                      </span>
                    )}
                  </div>

                  {/* Completed Date */}
                  <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    <span className="font-medium">Completed on {formatDate(item.completed_at)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[var(--color-surface-border)]/60 pt-2 mt-2" />

                  {/* Category */}
                  <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                    <Tag size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="font-medium capitalize">{item.category}</span>
                  </div>
                  
                  {/* Quick Action: Reopen */}
                  <div className="pt-2 border-t border-[var(--color-surface-border)]/40">
                    <button
                      onClick={(e) => { e.stopPropagation(); onReopen(item.id); }}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Reopen Task
                    </button>
                  </div>
                </div>
              );
            }}
            
            // ✅ Row actions (3-dots menu) - correctly targeted
            rowActions={getTaskActions}
            
            // Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTasks.length}
            pageSize={3} // Mobile: 2.5-3 cards visible
            onPageChange={setCurrentPage}
          />
        </div>

        {/* ✅ DESKTOP: Reusable DataTable */}
        <div className="hidden md:block">
          <DataTable
            data={filteredTasks}
            columns={[
              {
                header: "Task",
                accessorKey: "title",
                cell: ({ row }) => {
                  const task = row.original;
                  const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
                  return (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                        <CategoryIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/tasks/${task.id}`);
                          }}
                          className="text-sm font-semibold text-[var(--color-ink)] truncate line-through decoration-[var(--color-ink-subtle)]/50 hover:text-[var(--color-primary)] transition-colors text-left"
                        >
                          {task.title}
                        </button>
                        <p className="text-xs text-[var(--color-ink-muted)] truncate capitalize flex items-center gap-1 mt-0.5">
                          <Tag size={10} /> {task.category}
                        </p>
                      </div>
                    </div>
                  );
                },
              },
              {
                header: "Assigned To",
                accessorKey: "user_id",
                cell: ({ row }) => {
                  const task = row.original;
                  const assigneeName = getAssigneeName(task.user_id, users);
                  
                  return assigneeName ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        {getAssigneeInitials(task.user_id, users)}
                      </div>
                      <span className="font-medium truncate max-w-[120px]">{assigneeName}</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                      <UserX size={10} /> Unassigned
                    </span>
                  );
                },
              },
              {
                header: "Priority",
                accessorKey: "priority",
                cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[row.original.priority] || "bg-slate-400"}`} />
                    <span className="text-xs font-semibold capitalize text-[var(--color-ink)]">{row.original.priority}</span>
                  </div>
                ),
              },
              {
                header: "Due Date",
                accessorKey: "due_date",
                cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-[var(--color-ink-subtle)]" />
                    <span className="text-xs font-medium text-[var(--color-ink)]">
                      {formatDate(row.original.due_date)}
                    </span>
                  </div>
                ),
              },
            ]}
            // ✅ Row actions (3-dots menu) - correctly targeted
            rowActions={getTaskActions}
            getRowId={(task) => task.id}
            onRowClick={(task) => router.push(`/dashboard/tasks/${task.id}`)}
            loading={loading}
            emptyMessage="No completed tasks found"
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTasks.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            viewMode="desktop"
          />
        </div>
      </>
    </div>
  );
}