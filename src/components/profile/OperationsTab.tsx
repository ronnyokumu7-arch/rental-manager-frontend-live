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
}

export default function OperationsTab({ 
  userId, 
  currentUserRole, 
  isSelfView 
}: OperationsTabProps) {
  const {
    tasks, unassignedTasks, staffMembers, selectedTask, setSelectedTask,
    activeTab, setActiveTab, loading, updatingId, isAdmin,
    handleToggleComplete, handleAssignTask
  } = useOperations(userId, currentUserRole, isSelfView);

  return (
    // ✅ FLUSH LAYOUT: No outer card wrapper, direct integration with page background
    <div className="space-y-6">
      
      {/* Unified Header - Matches Profile Page Aesthetic */}
      <div className="flex items-center gap-4 px-2">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
          <Layers size={22} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Operations Command Center</h2>
          <p className="text-xs text-[var(--color-ink-muted)]">Manage tasks, assign actions, and execute workflows in real-time.</p>
        </div>
      </div>

      {/* Split Layout - Full Height, Flush Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        
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
            // ✅ PREMIUM EMPTY STATE: Semantic guidance, not generic placeholder
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-6">
                <MousePointerClick size={32} className="text-[var(--color-ink-subtle)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Select a Task to Begin</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-[240px] leading-relaxed mb-6">
                Click any task from the Action Center to view its full context, linked resources, and available actions right here.
              </p>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                <MousePointerClick size={14} />
                Select a task above
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
