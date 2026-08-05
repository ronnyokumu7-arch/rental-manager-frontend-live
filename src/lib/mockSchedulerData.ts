import { TeamMember, ScheduledTask } from "@/hooks/scheduler/useTaskSchedulerTimeline";

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 101,
    fullName: "Alex Chen",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Lead Developer",
    department: "Engineering",
    maxCapacityHours: 40,
  },
  {
    id: 102,
    fullName: "Sarah Jenkins",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Senior Full-Stack",
    department: "Engineering",
    maxCapacityHours: 40,
  },
  {
    id: 103,
    fullName: "Marcus Vance",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "UI/UX Designer",
    department: "Product Design",
    maxCapacityHours: 35,
  },
  {
    id: 104,
    fullName: "Elena Rostova",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "QA Specialist",
    department: "Quality Assurance",
    maxCapacityHours: 40,
  },
  {
    id: 105,
    fullName: "David Kim",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Senior Developer",
    department: "Engineering",
    maxCapacityHours: 30,
  },
  {
    id: 106,
    fullName: "Priya Patel",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role: "Project Manager",
    department: "Operations",
    maxCapacityHours: 45,
  },
];

export const MOCK_SCHEDULED_TASKS: ScheduledTask[] = [
  // --- Alex Chen (Lead Developer) ---
  {
    id: 1,
    title: "Next.js App Router Migration",
    description: "Migrate legacy pages router to Next.js App Router and upgrade Server Components.",
    assignedUserId: 101,
    startDate: "2026-07-22",
    dueDate: "2026-07-29",
    status: "in_progress",
    priority: "high",
    progressPercentage: 80,
  },
  {
    id: 2,
    title: "Redis Cache Layer Architecture",
    description: "Implement distributed Redis caching for real-time fleet telematics endpoints.",
    assignedUserId: 101,
    startDate: "2026-07-30",
    dueDate: "2026-08-05",
    status: "todo",
    priority: "urgent",
    progressPercentage: 0,
  },

  // --- Sarah Jenkins (Senior Full-Stack) ---
  {
    id: 3,
    title: "Stripe Webhooks & Invoice Reconciliation",
    description: "Fix edge case in automated recurring client contract invoice webhook handlers.",
    assignedUserId: 102,
    startDate: "2026-07-25",
    dueDate: "2026-07-28",
    status: "in_review",
    priority: "high",
    progressPercentage: 95,
  },
  {
    id: 4,
    title: "Fleet Analytics Aggregation Query",
    description: "Optimize PostgreSQL queries for quarterly revenue breakdown charts.",
    assignedUserId: 102,
    startDate: "2026-07-29",
    dueDate: "2026-08-04",
    status: "todo",
    priority: "medium",
    progressPercentage: 0,
  },

  // --- Marcus Vance (UI/UX Designer) ---
  {
    id: 5,
    title: "Mobile App Design System Tokens",
    description: "Create uniform color, spacing, and typography tokens for iOS/Android dashboard.",
    assignedUserId: 103,
    startDate: "2026-07-20",
    dueDate: "2026-07-31",
    status: "in_progress",
    priority: "medium",
    progressPercentage: 65,
  },
  {
    id: 6,
    title: "Dark Mode Contrast Audit",
    description: "Audit WCAG AA compliance across all light and dark theme matrix components.",
    assignedUserId: 103,
    startDate: "2026-08-01",
    dueDate: "2026-08-06",
    status: "todo",
    priority: "low",
    progressPercentage: 0,
  },

  // --- Elena Rostova (QA Specialist) ---
  {
    id: 7,
    title: "Playwright E2E Scheduler Test Suite",
    description: "Write automated end-to-end tests for task creation, drag selection, and drawer edits.",
    assignedUserId: 104,
    startDate: "2026-07-24",
    dueDate: "2026-08-02",
    status: "blocked",
    priority: "urgent",
    progressPercentage: 35,
  },

  // --- David Kim (Senior Developer) ---
  {
    id: 8,
    title: "Dashboard Widget Refactoring",
    description: "Refactor interactive widget components with clean React hooks and CSS modules.",
    assignedUserId: 105,
    startDate: "2026-07-26",
    dueDate: "2026-08-01",
    status: "in_progress",
    priority: "medium",
    progressPercentage: 50,
  },

  // --- Priya Patel (Project Manager) ---
  {
    id: 9,
    title: "Q3 Sprint Planning & Resource Allocation",
    description: "Finalize client contract milestones and team workload distribution.",
    assignedUserId: 106,
    startDate: "2026-07-27",
    dueDate: "2026-07-31",
    status: "completed",
    priority: "high",
    progressPercentage: 100,
  },
];
