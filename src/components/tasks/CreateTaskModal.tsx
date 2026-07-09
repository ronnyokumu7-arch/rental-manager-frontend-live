// src/components/tasks/CreateTaskModal.tsx
"use client";
import { useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import DatePicker from "@/components/forms/DatePicker";
import { useCreateTask } from "@/hooks/tasks/useCreateTask";
import PriorityCategoryPicker from "./PriorityCategoryPicker";
import EntitySelector from "./EntitySelector";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (taskData: any) => Promise<void>;
}

export default function CreateTaskModal({ open, onClose, onCreate }: CreateTaskModalProps) {
  const logic = useCreateTask();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logic.title || !logic.assignedTo) return;
    setLoading(true);
    try {
      await onCreate({
        title: logic.title,
        description: logic.description,
        priority: logic.priority,
        category: logic.category,
        due_date: logic.dueDate || null,
        assigned_to: logic.assignedTo,
        target_type: logic.relatedEntity.type,
        target_id: logic.relatedEntity.id,
      });
      logic.reset();
      onClose();
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ A5 Size: "xl" is 36rem (576px). Perfect compact size.
    <Modal open={open} onClose={onClose} title="Create New Task" subtitle="Assign work and track progress" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Left/Top: Core Details */}
        <div className="space-y-3">
          <FormGroup label="Task Title" required>
            <Input value={logic.title} onChange={(e) => logic.setTitle(e.target.value)} placeholder="e.g., Verify client docs..." className="text-sm" />
          </FormGroup>
          
          <FormGroup label="Description">
            <textarea
              value={logic.description}
              onChange={(e) => logic.setDescription(e.target.value)}
              placeholder="Add details..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </FormGroup>

          {/* Compact Pickers */}
          <PriorityCategoryPicker 
            priority={logic.priority} setPriority={logic.setPriority}
            category={logic.category} setCategory={logic.setCategory}
          />

          <FormGroup label="Due Date">
            <DatePicker value={logic.dueDate} onChange={logic.setDueDate} placeholder="Optional" />
          </FormGroup>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 my-4" />

        {/* Right/Bottom: Assignment & Relations */}
        <div className="h-[350px]">
          <EntitySelector
            searchQuery={logic.searchQuery} setSearchQuery={logic.setSearchQuery}
            activeTab={logic.activeTab} setActiveTab={logic.setActiveTab}
            users={logic.users} clients={logic.clients}
            vehicles={logic.vehicles} bookings={logic.bookings}
            assignedTo={logic.assignedTo} setAssignedTo={logic.setAssignedTo}
            relatedEntity={logic.relatedEntity} setRelatedEntity={logic.setRelatedEntity}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
          <button type="submit" disabled={loading || !logic.title || !logic.assignedTo} className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
