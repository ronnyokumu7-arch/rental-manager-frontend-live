import { Search, Filter, Zap, Archive } from "lucide-react";
import type { UseTenantsListReturn } from "@/hooks/tenants/useTenantsList"; // Assuming you export the return type

interface TenantsToolbarProps extends ReturnType<typeof useTenantsList> {}

// Alternative if you don't export the hook return type:
// interface TenantsToolbarProps {
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
//   statusFilter: string;
//   setStatusFilter: (status: string) => void;
//   subFilter: string;
//   setSubFilter: (sub: string) => void;
//   showArchived: boolean;
//   setShowArchived: (show: boolean) => void;
// }

export function TenantsToolbar({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  subFilter, setSubFilter,
  showArchived, setShowArchived
}: TenantsToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-surface-border)] shadow-sm">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" size={18} />
        <input
          type="text"
          placeholder="Search by name, email or KRA PIN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Vault Toggle Button */}
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`p-2.5 rounded-xl border transition-all ${
            showArchived
              ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
          }`}
          title="Toggle Vault View"
        >
          <Archive size={18} />
        </button>

        {/* Account Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-[var(--color-ink-subtle)]" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none"
          >
            <option value="ALL">All Accounts</option>
            <option value="ACTIVE">Acc: Active</option>
            <option value="SUSPENDED">Acc: Suspended</option>
          </select>
        </div>

        {/* Subscription Status Filter */}
        <div className="flex items-center gap-2">
          <Zap className="text-[var(--color-ink-subtle)]" size={16} />
          <select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none"
          >
            <option value="ALL">All Subs</option>
            <option value="ACTIVE">Sub: Active</option>
            <option value="INACTIVE">Sub: Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}
