// src/app/dashboard/users/page.tsx
"use client";

import { useState } from "react";
import UsersHeader, { type UserMainTab } from "@/components/users/manage/UsersHeader";
import RosterTab from "@/components/users/manage/RosterTab";
import SchedulerTab from "@/components/users/manage/SchedulerTab";
import RolesTab from "@/components/users/manage/RolesTab";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserMainTab>("roster");

  return (
    <div className="space-y-6">
      {/* Dynamic Header & Tab Switcher */}
      <UsersHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Conditional Segment View Engine */}
      {activeTab === "roster" && <RosterTab />}
      {activeTab === "scheduler" && <SchedulerTab />}
      {activeTab === "roles" && <RolesTab />}
    </div>
  );
}
