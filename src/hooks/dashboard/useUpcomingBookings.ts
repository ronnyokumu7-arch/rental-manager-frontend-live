import { useState, useEffect } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

export function useUpcomingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const allBookings = await bookingsApi.list();
        const upcoming = allBookings
          .filter(b => b.status === 'confirmed' || b.status === 'active')
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .slice(0, 5);
        setBookings(upcoming);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return { bookings, loading };
}
