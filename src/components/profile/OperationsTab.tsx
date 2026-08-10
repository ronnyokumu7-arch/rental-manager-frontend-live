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
    tasks, selectedTask, setSelectedTask,
    activeTab, setActiveTab, loading, updatingId,
    handleToggleComplete
  } = useOperations(userId, currentUserRole, isSelfView);

  return (
    // ✅ FULL HEIGHT LAYOUT: No outer spacing, fits within parent container
    <div className="h-full flex flex-col">
      
      {/* ✅ CONDITIONAL HEADER: Only show if not hidden by parent
          Mobile: icon hidden, tighter spacing (mb-4 vs mb-6) */}
      {!hideHeader && (
        <div className="flex items-center gap-3 sm:gap-4 px-2 mb-4 sm:mb-6">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 items-center justify-center shrink-0">
            <Layers size={22} className="text-[var(--color-primary)]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-ink)]">Operations Command Center</h2>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">Manage tasks, assign actions, and execute workflows in real-time.</p>
          </div>
        </div>
      )}

      {/* ✅ SPLIT LAYOUT: 
          - Mobile: single column, right panel hidden when nothing selected
          - Desktop (lg+): 12-col grid, both panels always visible */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:min-h-0">
        
        {/* LEFT: Action Center List */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          <ActionCenterList
            tasks={tasks}
            selectedTask={selectedTask}
            onSelectTask={setSelectedTask}
            activeTab={
              activeTab === "completed" ? "done" : "pending"
            }
            onTabChange={(tab) => {
              setActiveTab(
                tab === "done" ? "completed" : "pending"
              );
            }}
            loading={loading}
            updatingId={updatingId}
            onToggleComplete={handleToggleComplete}
          />
        </div>

        {/* RIGHT: Smart Profile Viewer / Empty State
            ✅ Mobile: hidden when no task selected (action center takes full width)
            ✅ Desktop: always visible with empty state or viewer */}
        <div className={`lg:col-span-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col ${!selectedTask ? 'hidden lg:flex' : ''}`}>
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
