// src/hooks/bookings/useBookingsList.ts
"use client";

import { useState, useEffect, useMemo } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

export type ViewMode = "active" | "vault";

export function useBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // ✅ Call the correct endpoint based on the active/vault view
      const data = view === "vault" 
        ? await bookingsApi.listArchived() 
        : await bookingsApi.list();
        
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [view]);

  // ✅ Calculate counts from the RAW data before search/status filtering.
  // This ensures the toolbar badges always show the correct totals.
  const activeCount = useMemo(() => bookings.filter(b => !b.is_archived).length, [bookings]);
  const vaultCount = useMemo(() => bookings.filter(b => b.is_archived).length, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings;

    // Safety filter in case API returns mixed data
    if (view === "active") {
      result = result.filter(b => !b.is_archived);
    } else {
      result = result.filter(b => b.is_archived);
    }

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((b) => 
        b.booking_number?.toLowerCase().includes(lowerSearch) || 
        b.id.toString().includes(lowerSearch) || 
        b.destination?.toLowerCase().includes(lowerSearch) ||
        b.pickup_location?.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [bookings, view, statusFilter, search]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  return {
    loading, 
    view, 
    setView, 
    search, 
    setSearch, 
    statusFilter, 
    setStatusFilter,
    currentPage, 
    setCurrentPage, 
    filteredBookings, 
    paginatedBookings, 
    totalPages,
    activeCount, // ✅ Added for TableToolbar
    vaultCount,  // ✅ Added for TableToolbar
    refetch: fetchBookings
  };
}
