// src/components/users/UsersHeader.tsx
import { Users, Plus, Mail } from "lucide-react";
import type { CategoryMode } from "@/hooks/users/useUsersList";

interface UsersHeaderProps {
  category: CategoryMode;
  onQuickInvite: () => void;
  onAddMember: () => void;
}

export default function UsersHeader({ category, onQuickInvite, onAddMember }: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            <Users size={20} />
          </div>
          Team Members
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          {category === "executive" 
            ? "Manage your C-suite, directors, and top-level leadership." 
            : "Manage your operational staff, admins, and their access levels."}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={onQuickInvite}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] shadow-sm transition-all"
        >
          <Mail size={16} /> Quick Invite
        </button>
        <button
          onClick={onAddMember}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>
    </div>
  );
}
