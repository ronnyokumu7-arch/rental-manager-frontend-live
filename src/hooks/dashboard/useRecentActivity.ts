import { useState, useEffect } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

export interface ActivityItem {
  id: string;
  type: 'booking' | 'client' | 'vehicle';
  title: string;
  time: string;
  icon: 'Calendar' | 'User' | 'Car';
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const recentBookings = await bookingsApi.list();
        const mapped: ActivityItem[] = recentBookings.slice(0, 5).map((b: Booking, i: number) => ({
          id: `act-${b.id}`,
          type: 'booking',
          title: `Booking #${b.booking_number || b.id} ${b.status}`,
          time: `${i + 1}h ago`,
          icon: 'Calendar'
        }));
        setActivities(mapped);
      } catch (error) {
        console.error("Failed to fetch activity", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return { activities, loading };
}
