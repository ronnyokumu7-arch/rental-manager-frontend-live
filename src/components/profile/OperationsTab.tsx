// src/components/profile/OperationsTab.tsx
import { useOperations } from "@/hooks/profile/useOperations";
import ActionCenterList from "./ActionCenterList";
import SmartProfileViewer from "./SmartProfileViewer";
import { Layers } from "lucide-react";

interface OperationsTabProps {
  userId: number;
  currentUserRole: string;
  isSelfView: boolean;
}

export default function OperationsTab({ userId, currentUserRole, isSelfView }: OperationsTabProps) {
  const {
    tasks, unassignedTasks, staffMembers, selectedTask, setSelectedTask,
    activeTab, setActiveTab, loading, updatingId, isAdmin,
    handleToggleComplete, handleAssignTask
  } = useOperations(userId, currentUserRole, isSelfView);

  return (
    // ✅ Premium Background: Makes the panels pop
    <div className="bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl p-4 lg:p-6 border border-slate-200/50 dark:border-slate-800/50">
      
      {/* Tab Header */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Layers size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Operations Command Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage tasks and execute actions in real-time.</p>
        </div>
      </div>

      {/* The Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        
        {/* ✅ LEFT CONTAINER: The Action Center */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
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

        {/* ✅ RIGHT CONTAINER: The Smart Profile */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {selectedTask ? (
            <SmartProfileViewer task={selectedTask} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                <Layers size={32} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Select a Task</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
                Click on a task from the Action Center to view its context and take action right here.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
