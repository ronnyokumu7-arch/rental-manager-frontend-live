// src/hooks/bookings/useTripTimeline.ts
"use client";

import { useMemo } from "react";
import type { Booking } from "@/lib/types";

export interface TimelineNode {
  type: "pickup" | "dropoff";
  title: string;
  dateString: string;
  timeString: string;
  rawDate: string;
  isCompleted: boolean;
}

export function useTripTimeline(booking: Booking | null | undefined) {
  return useMemo(() => {
    if (!booking) {
      return {
        nodes: [] as TimelineNode[],
        totalDays: 0,
        tripProgress: 0, // Percentage of trip elapsed
        isOverdue: false,
      };
    }

    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const now = new Date();

    // Calculate total duration in days
    const totalMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));

    // Calculate real-time trip progress tracking percentage
    let tripProgress = 0;
    let isOverdue = false;

    if (booking.status === "active") {
      if (now > end) {
        tripProgress = 100;
        isOverdue = true;
      } else if (now >= start) {
        const elapsedMs = now.getTime() - start.getTime();
        tripProgress = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
      }
    } else if (["completed", "archived"].includes(booking.status)) {
      tripProgress = 100;
    }

    // Map out timeline tracking nodes matching backend states
    const nodes: TimelineNode[] = [
      {
        type: "pickup",
        title: "Pick-up / Dispatch",
        dateString: start.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        timeString: start.toLocaleDateString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: booking.start_date,
        isCompleted: ["confirmed", "active", "completed"].includes(booking.status),
      },
      {
        type: "dropoff",
        title: "Drop-off / Return",
        dateString: end.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        timeString: end.toLocaleDateString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: booking.end_date,
        isCompleted: booking.status === "completed",
      },
    ];

    return {
      nodes,
      totalDays,
      tripProgress,
      isOverdue,
    };
  }, [booking]);
}
