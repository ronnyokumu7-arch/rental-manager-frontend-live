// src/app/dashboard/bookings/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Plus, LayoutList } from "lucide-react";
import { useState } from "react";
import { useBookingsList } from "@/hooks/bookings/useBookingsList";
import { useBookingsReferenceData } from "@/hooks/bookings/useBookingsReferenceData";
import { useExtendBooking } from "@/hooks/bookings/useExtendBooking";
import BookingsList from "@/components/bookings/BookingsList";
import ExtendBookingModal from "@/components/bookings/ExtendBookingModal";
import FleetCalendar from "@/components/calendar/FleetCalendar";

type TabMode = "list" | "calendar";

const TAB_INFO = {
  list: {
    title: "Reservations",
    description: "Manage quotations, rentals, and trip lifecycles.",
  },
  calendar: {
    title: "Booking Calendar",
    description: "Visualize fleet availability and upcoming trips at a glance.",
  },
};

export default function BookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabMode>("list");

  // 1. Core Logic Hooks
  const bookingsData = useBookingsList();
  const { clientMap, vehicleMap, isLoading: isRefDataLoading } = useBookingsReferenceData();
  
  // 2. Extend Booking Logic
  const {
    isOpen: isExtendModalOpen,
    selectedBooking,
    isLoading: isExtending,
    openModal: openExtendModal,
    closeModal: closeExtendModal,
    handleExtend,
  } = useExtendBooking(bookingsData.refetch || (() => {}));

  const currentTabInfo = TAB_INFO[activeTab];

  return (
    <div className="space-y-6">
      {/* Premium Header with Dynamic Content */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              {activeTab === "list" ? <LayoutList size={20} /> : <CalendarDays size={20} />}
            </div>
            {currentTabInfo.title}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "list" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <LayoutList size={14} /> Bookings
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "calendar" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <CalendarDays size={14} /> Calendar
          </button>
        </div>
      </div>

      {/* Tab Content Assembly */}
      {activeTab === "list" ? (
        <BookingsList 
          bookingsData={bookingsData}
          clientMap={clientMap}
          vehicleMap={vehicleMap}
          isReferenceDataLoading={isRefDataLoading}
          onExtendBooking={openExtendModal}
        />
      ) : (
        <div className="animate-in fade-in duration-300 relative">
          <FleetCalendar />
        </div>
      )}

      {/* Extend Booking Modal Assembly */}
      <ExtendBookingModal
        open={isExtendModalOpen}
        onClose={closeExtendModal}
        booking={selectedBooking}
        onExtend={handleExtend}
        isLoading={isExtending}
      />

      {/* PREMIUM FLOATING ACTION BUTTON - Only on Calendar Tab */}
      {activeTab === "calendar" && (
        <button
          onClick={() => router.push("/dashboard/bookings/new")}
          className="fixed bottom-8 right-8 z-50 group flex items-center justify-center w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 ease-out"
          title="New Booking"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-ink)] text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[var(--color-surface-border)]">
            New Booking
          </span>
        </button>
      )}
    </div>
  );
}
