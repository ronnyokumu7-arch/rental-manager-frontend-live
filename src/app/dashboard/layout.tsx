// src/app/dashboard/layout.tsx
import DashboardShell from "@/components/layout/DashboardShell";
// ✅ Change 'tenantNavItems' to 'tenantAdminNav' to match your nav-config file
import { tenantAdminNav } from "@/lib/nav-config"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell navItems={tenantAdminNav}>
      {children}
    </DashboardShell>
  );
}
