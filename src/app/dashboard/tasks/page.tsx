// src/app/dashboard/tasks/page.tsx
"use client";

import { useState } from "react";
import { ListChecks, Users, CheckCircle2 } from "lucide-react";
import { useTasksList } from "@/hooks/tasks/useTasksList";
import type { Task } from "@/lib/types";
import TaskProfileModal from "@/components/tasks/TaskProfileModal";
import TasksTab from "@/components/tasks/TasksTab";
import AssignedToTab from "@/components/tasks/AssignedTo";
import CompletedTasksTab from "@/components/tasks/CompletedTasks";

const TABS = [
  { id: "tasks" as const, label: "Tasks", icon: ListChecks },
  { id: "assigned-to" as const, label: "Assigned To", icon: Users },
  { id: "completed" as const, label: "Completed", icon: CheckCircle2 },
];

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    loading,
    activeTab, setActiveTab,
    search, setSearch,
    priorityFilter, setPriorityFilter,
    categoryFilter, setCategoryFilter,
    selectedUserId, setSelectedUserId,
    timeFilter, setTimeFilter,
    currentPage, setCurrentPage,
    pageSize,
    filteredTasks,
    paginatedTasks,
    totalPages,
    metrics,
    users,
    openDropdownId,
    dropdownPos,
    handleToggleDropdown,
    handleAssign,
    handleClaim,
    handleStatusChange,
    handleReopen,
    handleArchive,
    refetch,
  } = useTasksList();

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <ListChecks size={20} />
            </div>
            Task Management
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Track, assign, and monitor operational tasks across your team.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Card - Matches Fleet/Clients/Bookings pattern */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
        
        {activeTab === "tasks" && (
          <TasksTab
            tasks={paginatedTasks}
            users={users}
            loading={loading}
            metrics={metrics}
            search={search}
            setSearch={setSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            filteredTasks={filteredTasks}
            openDropdownId={openDropdownId}
            dropdownPos={dropdownPos}
            onToggleDropdown={handleToggleDropdown}
            onAssign={handleAssign}
            onClaim={handleClaim}
            onStatusChange={handleStatusChange}
            onArchive={handleArchive}
            onOpenCreateModal={handleOpenNewTask}
            onEdit={handleEditTask}
          />
        )}

        {activeTab === "assigned-to" && (
          <AssignedToTab
            tasks={paginatedTasks}
            users={users}
            loading={loading}
            metrics={metrics}
            search={search}
            setSearch={setSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            filteredTasks={filteredTasks}
            openDropdownId={openDropdownId}
            dropdownPos={dropdownPos}
            onToggleDropdown={handleToggleDropdown}
            onStatusChange={handleStatusChange}
            onArchive={handleArchive}
          />
        )}

        {activeTab === "completed" && (
          <CompletedTasksTab
            tasks={paginatedTasks}
            users={users}
            loading={loading}
            metrics={metrics}
            search={search}
            setSearch={setSearch}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            filteredTasks={filteredTasks}
            openDropdownId={openDropdownId}
            dropdownPos={dropdownPos}
            onToggleDropdown={handleToggleDropdown}
            onReopen={handleReopen}
          />
        )}
      </div>

      {/* Task Profile Modal */}
      <TaskProfileModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingTask={editingTask} 
        onSaveSuccess={refetch} 
      />
    </div>
  );
}
