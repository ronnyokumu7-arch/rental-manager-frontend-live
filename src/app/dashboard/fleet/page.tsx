// src/app/dashboard/fleet/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Car, Plus, BarChart3, Wrench, Archive } from "lucide-react";
import { useState, useMemo } from "react";
import { useFleetList } from "@/hooks/fleet/useFleetList";
import FleetList from "@/components/fleet/FleetList";
import QuickGarageModal from "@/components/ui/QuickGarageModal";

type TabMode = "fleet" | "performance" | "garage";

const TABS = [
  { id: "fleet", label: "Vehicles", icon: Car },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "garage", label: "Garage", icon: Wrench },
];

export default function FleetPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabMode>("fleet");

  const fleetData = useFleetList();

  // ✅ DYNAMIC HEADER INFO: Reacts to both the active tab AND the Active/Vault view state
  const currentTabInfo = useMemo(() => {
    if (activeTab === "fleet") {
      return {
        title: fleetData.view === "active" ? "Fleet Management" : "Fleet Vault",
        description: fleetData.view === "active" 
          ? "Oversee your active vehicles, track performance, and manage garage operations." 
          : "Archived and retired vehicle records.",
        icon: fleetData.view === "active" ? <Car size={20} /> : <Archive size={20} />,
      };
    }
    if (activeTab === "performance") {
      return {
        title: "Performance Analytics",
        description: "Deep insights into your fleet's performance, utilization, and profitability.",
        icon: <BarChart3 size={20} />,
      };
    }
    return {
      title: "Garage Operations",
      description: "Onboard new vehicles, manage maintenance, and track service schedules.",
      icon: <Wrench size={20} />,
    };
  }, [activeTab, fleetData.view]);

  return (
    <div className="space-y-6">
      
      {/* Premium Header with Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              {currentTabInfo.icon}
            </div>
            {currentTabInfo.title}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "fleet" ? (
        <FleetList {...fleetData} />
      ) : activeTab === "performance" ? (
        <div className="p-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] animate-in fade-in duration-300">
          <BarChart3 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Performance Analytics</h3>
          <p className="text-sm text-[var(--color-ink-muted)]">Advanced fleet performance metrics and ROI tracking coming soon.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Garage Hub Content */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Garage Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-warning-bg)] flex items-center justify-center text-[var(--color-warning-text)] mb-4">
                <Wrench size={24} />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Quick Garage</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                Update mileage and service status for vehicles awaiting inspection.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary-text)]">
                <span>{fleetData.filteredVehicles.filter(v => v.status === "awaiting_mileage").length} vehicles pending</span>
                <span>→</span>
              </div>
            </div>

            {/* Maintenance Queue Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-danger-bg)] flex items-center justify-center text-[var(--color-danger-text)] mb-4">
                <Car size={24} />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Maintenance Queue</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                Track vehicles currently in service and their repair status.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary-text)]">
                <span>{fleetData.filteredVehicles.filter(v => v.status === "maintenance").length} in maintenance</span>
                <span>→</span>
              </div>
            </div>

            {/* Service Due Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-muted)] flex items-center justify-center text-[var(--color-primary-text)] mb-4">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Service Due Soon</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                Vehicles approaching their next scheduled service interval.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary-text)]">
                <span>View schedule</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-warning-bg)] flex items-center justify-center mb-4">
              <Wrench size={32} className="text-[var(--color-warning-text)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">
              Multi-Billion-Dollar Garage Hub
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              Comprehensive maintenance scheduling, parts inventory, mechanic assignments, and automated service reminders. Building the future of fleet management.
            </p>
          </div>
        </div>
      )}

      {/* Quick Garage Modal */}
      <QuickGarageModal
        vehicle={fleetData.garageVehicle}
        open={fleetData.garageModalOpen}
        onClose={() => {
          fleetData.setGarageModalOpen(false);
          fleetData.setGarageVehicle(null);
        }}
        onSave={fleetData.handleGarageSave}
      />

      {/* PREMIUM FLOATING ACTION BUTTON - Bottom Right (Garage Tab Only) */}
      {activeTab === "garage" && (
        <button
          onClick={() => router.push("/dashboard/fleet/new")}
          className="fixed bottom-8 right-8 z-50 group flex items-center justify-center w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 ease-out"
          title="Add New Vehicle"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-ink)] text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[var(--color-surface-border)]">
            Add Vehicle
          </span>
        </button>
      )}
    </div>
  );
}
