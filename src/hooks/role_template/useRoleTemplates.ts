import { useState } from 'react';

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export function useRoleTemplates() {
  const [roles, setRoles] = useState<RoleTemplate[]>([
    { id: '1', name: 'Admin', description: 'Full system access', permissions: ['all'] },
    { id: '2', name: 'Dispatcher', description: 'Fleet management access', permissions: ['view_fleet', 'create_booking'] },
  ]);

  const updateRole = (id: string, updatedRole: Partial<RoleTemplate>) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updatedRole } : r));
  };

  return { roles, updateRole };
}
