"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useUserProfile } from "@/hooks/useUserProfile";

// ✅ Only keep the essential, non-redundant cards
import UserPersonalInfoCard from "@/components/profile/UserPersonalInfoCard";
import UserStatusCard from "@/components/profile/UserStatusCard";
import UserNotificationsCard from "@/components/profile/UserNotificationsCard"; // ✅ NEW
import UserTasksCard from "@/components/profile/UserTasksCard";

export default function UserProfilePage() {
  const router = useRouter();
  const {
    user, logs, loading,
    handleUpdateUser, handleStatusAction
  } = useUserProfile();

  // TODO: Replace with actual auth context check
  const currentUserId = 1; // Placeholder
  const isSelfView = user?.id === currentUserId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900">User not found</h2>
        <button onClick={() => router.push("/dashboard/users")} className="mt-4 text-blue-600 hover:underline">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <PageHeader
        title="User Profile"
        subtitle="Manage account settings, security preferences, and team permissions."
        icon={Users}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users", href: "/dashboard/users" },
          { label: user.full_name },
        ]}
        actions={[
          {
            label: "Back to Users",
            icon: ArrowLeft,
            variant: "secondary",
            onClick: () => router.push("/dashboard/users"),
          },
        ]}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <UserPersonalInfoCard 
            user={user} 
            onSave={handleUpdateUser} 
            isSelfView={isSelfView} 
          />
          <UserTasksCard 
  userId={user.id} 
  currentUserRole={user.role} // ✅ Pass role to enable Admin features
  isSelfView={isSelfView} 
/>
        </div>

        {/* Right Column: Sidebar (1/3 width) */}
        <div className="space-y-6">
          <UserStatusCard 
            user={user} 
            onStatusAction={handleStatusAction} 
            isSelfView={isSelfView} 
          />
          {/* ✅ NEW: Notifications Card placed below Status */}
          <UserNotificationsCard user={user} />
        </div>
      </div>
    </div>
  );
}
