// src/components/profile/OperationsTab.tsx
"use client";

import { useOperations } from "@/hooks/profile/useOperations";
import ActionCenterList from "./ActionCenterList";
import SmartProfileViewer from "./SmartProfileViewer";
import { Layers, MousePointerClick } from "lucide-react";

interface OperationsTabProps {
  userId: number;
  currentUserRole: string;
  isSelfView: boolean;
  hideHeader?: boolean;
}

export default function OperationsTab({ 
  userId, 
  currentUserRole, 
  isSelfView,
  hideHeader = false
}: OperationsTabProps) {
  const {
    tasks, unassignedTasks, staffMembers, selectedTask, setSelectedTask,
    activeTab, setActiveTab, loading, updatingId, isAdmin,
    handleToggleComplete, handleAssignTask
  } = useOperations(userId, currentUserRole, isSelfView);

  return (
    // ✅ FULL HEIGHT LAYOUT: No outer spacing, fits within parent container
    <div className="h-full flex flex-col">
      
      {/* ✅ CONDITIONAL HEADER: Only show if not hidden by parent */}
      {!hideHeader && (
        <div className="flex items-center gap-4 px-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
            <Layers size={22} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Operations Command Center</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Manage tasks, assign actions, and execute workflows in real-time.</p>
          </div>
        </div>
      )}

      {/* ✅ SPLIT LAYOUT: Full height, no overflow */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* LEFT: Action Center List */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          <ActionCenterList
            tasks={tasks}
            unassignedTasks={unassignedTasks}
            staffMembers={staffMembers}
            selectedTask={selectedTask}
            onSelectTask={setSelectedTask}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            loading={loading}
            updatingId={updatingId}
            isAdmin={isAdmin}
            onToggleComplete={handleToggleComplete}
            onAssignTask={handleAssignTask}
          />
        </div>

        {/* RIGHT: Smart Profile Viewer / Empty State */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          {selectedTask ? (
            <SmartProfileViewer task={selectedTask} />
          ) : (
            // ✅ PREMIUM EMPTY STATE: Compact and contextual
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
                <MousePointerClick size={28} className="text-[var(--color-ink-subtle)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1.5">Select a Task</h3>
              <p className="text-xs text-[var(--color-ink-muted)] max-w-[200px] leading-relaxed">
                Click any task to view its context, linked resources, and actions.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
