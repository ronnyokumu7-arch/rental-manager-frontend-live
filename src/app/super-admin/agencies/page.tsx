"use client";

import { useTenantsList } from "@/hooks/tenants/useTenantsList";
import { TenantsTable } from "@/components/tenants/TenantsTable";

export default function SuperAdminTenantsPage() {
  const listProps = useTenantsList();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-6">Tenant Directory</h1>
      <TenantsTable {...listProps} />
    </div>
  );
}
