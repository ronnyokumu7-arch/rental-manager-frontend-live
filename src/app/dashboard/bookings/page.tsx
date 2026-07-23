// src/app/dashboard/bookings/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { LayoutList, CalendarDays } from "lucide-react";
import { useMemo } from "react";

import BookingsList from "@/components/bookings/BookingsList";
import ExtendBookingModal from "@/components/bookings/ExtendBookingModal";
import FleetTimelineCalendar from "@/components/bookings/FleetTimelineCalendar";
import { Booking } from "@/lib/types";
import { useBookingsPage, TabMode } from "@/hooks/bookings/useBookingsPage";

const TABS = [
  { id: "list", label: "Bookings List", icon: LayoutList },
  { id: "calendar", label: "Availability Calendar", icon: CalendarDays },
];

export default function BookingsPage() {
  const router = useRouter();
  
  const {
    activeTab,
    setActiveTab,
    bookingsData,
    clientMap,
    vehicleMap,
    isRefDataLoading,
    isExtendModalOpen,
    selectedBooking,
    isExtending,
    openExtendModal,
    closeExtendModal,
    handleExtend,
    handleCreateBookingFromCalendar,
  } = useBookingsPage();

  const currentTabInfo = useMemo(() => {
    return activeTab === "list" 
      ? { title: "Reservations Management", description: "Oversee operational booking states, manage trip lifecycles, and handle extensions.", icon: <LayoutList size={20} /> }
      : { title: "Fleet Timeline Calendar", description: "Real-time look at vehicle distribution, active reservations, and scheduling blocks.", icon: <CalendarDays size={20} /> };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              {currentTabInfo.icon}
            </div>
            {currentTabInfo.title}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">{currentTabInfo.description}</p>
        </div>

        {/* ✅ REMOVED: "New Booking" button */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === "list" ? (
          <BookingsList 
            bookingsData={bookingsData}
            clientMap={clientMap}
            vehicleMap={vehicleMap}
            isReferenceDataLoading={isRefDataLoading}
            onExtendBooking={openExtendModal}
          />
        ) : (
          isRefDataLoading ? (
            <div className="h-64 flex items-center justify-center text-sm text-[var(--color-ink-muted)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)]">
              Loading calendar assets...
            </div>
          ) : (
            <FleetTimelineCalendar
              bookings={(Array.isArray(bookingsData) ? bookingsData : []) as Booking[]}
              vehicleMap={vehicleMap || {}}
              clientMap={clientMap || {}}
              onExtendBooking={openExtendModal}
              onCreateBooking={handleCreateBookingFromCalendar}
            />
          )
        )}
      </div>

      <ExtendBookingModal
        open={isExtendModalOpen}
        onClose={closeExtendModal}
        booking={selectedBooking}
        onExtend={handleExtend}
        isLoading={isExtending}
      />
    </div>
  );
}
