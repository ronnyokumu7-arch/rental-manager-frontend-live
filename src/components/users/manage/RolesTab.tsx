import RoleTemplateList from "@/components/role_template/RoleTemplateList";

export default function RolesTab() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-[var(--color-surface-hover)]/20 rounded-xl border border-[var(--color-surface-border)]">
        <p className="text-xs text-[var(--color-ink-muted)]">
          Manage permission sets and role templates that can be assigned to staff members.
        </p>
      </div>
      <RoleTemplateList />
    </div>
  );
}
