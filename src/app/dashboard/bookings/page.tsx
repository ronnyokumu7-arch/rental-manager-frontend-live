"use client";

import { LayoutList, CalendarDays } from "lucide-react";
import { useMemo } from "react";

import BookingsList from "@/components/bookings/BookingsList";
import ExtendBookingModal from "@/components/bookings/ExtendBookingModal";
import FleetTimelineCalendar from "@/components/bookings/FleetTimelineCalendar";
import { Booking } from "@/lib/types";
import { useBookingsPage, TabMode } from "@/hooks/bookings/useBookingsPage";

const TABS = [
  { id: "list", label: "Reservations", icon: LayoutList },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
];

export default function BookingsPage() {
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
      ? { title: "Manage Bookings", description: "Create new reservations, manage bookings, and handle extensions.", icon: <LayoutList size={18} className="sm:w-5 sm:h-5" /> }
      : { title: "Fleet Timeline Calendar", description: "Real-time look at vehicle distribution, active reservations, and scheduling blocks.", icon: <CalendarDays size={18} className="sm:w-5 sm:h-5" /> };
  }, [activeTab]);

  const bookingsArray = bookingsData.bookings || [];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* ── HEADER & TAB SWITCHER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
              {currentTabInfo.icon}
            </div>
            <span className="truncate">{currentTabInfo.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1 truncate sm:whitespace-normal">
            {currentTabInfo.description}
          </p>
        </div>

        {/* Segmented Control / Tab Switcher */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm w-full sm:w-auto shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-colors duration-150 touch-manipulation select-none ${
                  isActive 
                    ? "bg-[var(--color-primary)] text-white shadow-sm" 
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="w-full min-w-0 transition-opacity duration-150">
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
            <div className="h-48 sm:h-64 flex items-center justify-center text-xs sm:text-sm text-[var(--color-ink-muted)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)]">
              Loading calendar assets...
            </div>
          ) : (
            <FleetTimelineCalendar
              bookings={bookingsArray as Booking[]}
              vehicleMap={vehicleMap}
              clientMap={clientMap}
              onExtendBooking={openExtendModal}
              onCreateBooking={handleCreateBookingFromCalendar}
            />
          )
        )}
      </div>

      {/* ── MODALS ── */}
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