// src/hooks/scheduler/useTaskSchedulerTimeline.ts
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  addDays,
  subDays,
  format,
  parseISO,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";

export interface ScheduledTask {
  id: number;
  title: string;
  description?: string;
  assignedUserId: number;
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progressPercentage: number; // 0 - 100
}

export interface TeamMember {
  id: number;
  fullName: string;
  avatarUrl?: string;
  role: string;
  department: string;
  maxCapacityHours: number;
}

interface UseTaskSchedulerTimelineProps {
  tasks: ScheduledTask[];
  teamMembers: TeamMember[];
  onCreateTask?: (payload: {
    assignedUserId: number;
    startDate: string;
    dueDate: string;
  }) => Promise<void> | void;
}

export type SchedulingStep = "idle" | "select-range" | "assign-details";

// ✅ UPDATED: Smooth 1-to-14 day zoom levels for perfect grid alignment
const ZOOM_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function useTaskSchedulerTimeline({
  tasks = [],
  teamMembers = [],
  onCreateTask,
}: UseTaskSchedulerTimelineProps) {
  // --- View Window State ---
  const [viewStartDate, setViewStartDate] = useState<Date>(() => startOfDay(new Date()));
  const [daysToShow, setDaysToShow] = useState<number>(7); // Default to 7 days

  // --- Task Creation State ---
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [schedulingStep, setSchedulingStep] = useState<SchedulingStep>("idle");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);

  // Derive all active date objects within the view window
  const timelineDays = useMemo(() => {
    return Array.from({ length: daysToShow }, (_, i) => addDays(viewStartDate, i));
  }, [viewStartDate, daysToShow]);

  // Derive the end date of the view window
  const viewEndDate = useMemo(() => {
    return addDays(viewStartDate, daysToShow - 1);
  }, [viewStartDate, daysToShow]);

  // --- Zoom Logic: Capped at 14 days for perfect visual alignment ---
  const canZoomIn = daysToShow > 1;
  const canZoomOut = daysToShow < 14; // ✅ Updated max limit

  const handleZoomIn = useCallback(() => {
    setDaysToShow((prev) => {
      const currentIndex = ZOOM_LEVELS.findIndex((level) => level === prev);
      const newIndex = Math.max(0, currentIndex - 1);
      return ZOOM_LEVELS[newIndex];
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setDaysToShow((prev) => {
      const currentIndex = ZOOM_LEVELS.findIndex((level) => level === prev);
      const newIndex = Math.min(ZOOM_LEVELS.length - 1, currentIndex + 1);
      return ZOOM_LEVELS[newIndex];
    });
  }, []);

  // --- Window Navigation Handlers (Page-turn effect based on current zoom) ---
  const shiftWindow = useCallback(
    (direction: "prev" | "next") => {
      setViewStartDate((current) => {
        // Shift by the current view width for a seamless page-turn effect
        const step = Math.max(1, daysToShow); 
        return direction === "next" ? addDays(current, step) : subDays(current, step);
      });
    },
    [daysToShow]
  );

  const jumpToToday = useCallback(() => {
    setViewStartDate(startOfDay(new Date()));
  }, []);

  // --- Task Creation Workflow ---
  const handleToggleCreateMode = useCallback(() => {
    if (isCreateMode) {
      setIsCreateMode(false);
      setSchedulingStep("idle");
      setSelectedUserId(null);
      setSelectedStartDate(null);
      setSelectedEndDate(null);
    } else {
      setIsCreateMode(true);
      setSchedulingStep("select-range");
    }
  }, [isCreateMode]);

  const handleCellClick = useCallback(
    (userId: number, dateStr: string) => {
      if (!isCreateMode) return;

      // If selecting a different user, start fresh
      if (selectedUserId !== null && selectedUserId !== userId) {
        setSelectedUserId(userId);
        setSelectedStartDate(dateStr);
        setSelectedEndDate(null);
        setSchedulingStep("select-range");
        return;
      }

      setSelectedUserId(userId);

      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        // Step 1: Set Start Date
        setSelectedStartDate(dateStr);
        setSelectedEndDate(null);
        setSchedulingStep("select-range");
      } else {
        // Step 2: Set End Date (Ensure chronological order)
        const start = parseISO(selectedStartDate);
        const end = parseISO(dateStr);

        if (isBefore(end, start)) {
          setSelectedStartDate(dateStr);
          setSelectedEndDate(selectedStartDate);
        } else {
          setSelectedEndDate(dateStr);
        }
        setSchedulingStep("assign-details");
      }
    },
    [isCreateMode, selectedUserId, selectedStartDate, selectedEndDate]
  );

  const resetSelection = useCallback(() => {
    setSelectedUserId(null);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSchedulingStep(isCreateMode ? "select-range" : "idle");
  }, [isCreateMode]);

  const handleFinalizeTaskCreation = useCallback(async () => {
    if (!selectedUserId || !selectedStartDate || !selectedEndDate || !onCreateTask) return;

    await onCreateTask({
      assignedUserId: selectedUserId,
      startDate: selectedStartDate,
      dueDate: selectedEndDate,
    });

    handleToggleCreateMode();
  }, [selectedUserId, selectedStartDate, selectedEndDate, onCreateTask, handleToggleCreateMode]);

  // --- Timeline Coordinate Calculations ---
  const calculatePosition = useCallback(
    (startDateStr: string, dueDateStr: string) => {
      const taskStart = startOfDay(parseISO(startDateStr));
      const taskEnd = endOfDay(parseISO(dueDateStr));
      const windowStart = startOfDay(viewStartDate);
      const windowEnd = endOfDay(viewEndDate);

      // Check if task overlaps with the current timeline view
      const isVisible = taskEnd >= windowStart && taskStart <= windowEnd;
      if (!isVisible) return { left: 0, width: 0, visible: false };

      // Clamp dates to the visible window bounds
      const effectiveStart = isBefore(taskStart, windowStart) ? windowStart : taskStart;
      const effectiveEnd = isAfter(taskEnd, windowEnd) ? windowEnd : taskEnd;

      // Calculate relative grid positions
      const startOffsetDays = differenceInCalendarDays(effectiveStart, windowStart);
      const durationDays = differenceInCalendarDays(effectiveEnd, effectiveStart) + 1;

      const left = (startOffsetDays / daysToShow) * 100;
      const width = (durationDays / daysToShow) * 100;

      return {
        left: Math.max(0, left),
        width: Math.min(100 - left, width),
        visible: true,
      };
    },
    [viewStartDate, viewEndDate, daysToShow]
  );

  // --- Cell Selection Highlight Helper ---
  const getCellHighlightClass = useCallback(
    (userId: number, dateStr: string) => {
      if (selectedUserId !== userId || !selectedStartDate) return "";

      const current = parseISO(dateStr);
      const start = parseISO(selectedStartDate);

      if (selectedEndDate) {
        const end = parseISO(selectedEndDate);
        if (
          (isAfter(current, start) || isSameDay(current, start)) &&
          (isBefore(current, end) || isSameDay(current, end))
        ) {
          return "bg-[var(--color-primary)]/20 border-y border-[var(--color-primary)]/40";
        }
      } else if (isSameDay(current, start)) {
        return "bg-[var(--color-primary)]/30 border border-[var(--color-primary)]";
      }

      return "";
    },
    [selectedUserId, selectedStartDate, selectedEndDate]
  );

  return {
    // Window State
    viewStartDate: format(viewStartDate, "yyyy-MM-dd"),
    viewEndDate: format(viewEndDate, "yyyy-MM-dd"),
    daysToShow,
    timelineDays,

    // Zoom Controls
    canZoomIn,
    canZoomOut,
    handleZoomIn,
    handleZoomOut,

    // Task Creation State
    isCreateMode,
    schedulingStep,
    selectedUserId,
    selectedStartDate,
    selectedEndDate,
    setSelectedUserId,

    // Controls
    shiftWindow,
    jumpToToday,
    handleToggleCreateMode,
    handleCellClick,
    resetSelection,
    handleFinalizeTaskCreation,

    // Math & Styling
    calculatePosition,
    getCellHighlightClass,
  };
}
