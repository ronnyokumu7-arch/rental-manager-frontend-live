import { useState, useMemo, useEffect, useCallback } from "react";
import { tasksApi } from "@/lib/api/tasks";
import { usersApi } from "@/lib/api/users";
import type { Task, User } from "@/lib/types";
import toast from "react-hot-toast";

export type TaskTab = "tasks" | "assigned-to" | "completed";
export type TimeFilter = "" | "today" | "week" | "month";

// Native JS Date Helpers
const getStartOfDay = (date: Date) => { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };
const getStartOfWeek = (date: Date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); d.setDate(diff); d.setHours(0, 0, 0, 0); return d; };
const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export function useTasksList() {
  // --- State: View & Pagination ---
  const [activeTab, setActiveTab] = useState<TaskTab>("tasks");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);
  
  // --- State: Filters ---
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("");

  // --- State: Data & UI ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- State: Dropdown ---
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedTasks: Task[] = [];
      if (activeTab === "completed") {
        fetchedTasks = await tasksApi.getMyTasks({ limit: 200, status: "completed" });
      } else {
        fetchedTasks = await tasksApi.getMyTasks({ limit: 200 });
        // Only filter out completed tasks if we are strictly on the main "Tasks" tab
        if (activeTab === "tasks") {
          fetchedTasks = fetchedTasks.filter(t => t.status !== "completed");
        }
      }
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchUsers = useCallback(async () => {
    try {
      const staff = await usersApi.list();
      setUsers(staff.filter(u => u.is_active && !u.is_suspended));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => { fetchData(); fetchUsers(); }, [fetchData, fetchUsers]);

  // --- Filtering Logic ---
  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => {
      // 1. Tab & User Filtering
      if (activeTab === "assigned-to") {
        if (selectedUserId) {
          if (task.user_id?.toString() !== selectedUserId) return false;
        } else {
          // ✅ NEW: If no user is selected, only show tasks that are actually assigned
          if (!task.user_id || task.status === "unassigned") return false;
        }
      } else if (activeTab === "completed" && selectedUserId) {
        if (task.user_id?.toString() !== selectedUserId) return false;
      }

      // 2. Time Filtering (For Completed Tab)
      if (activeTab === "completed" && timeFilter && task.completed_at) {
        const completedDate = new Date(task.completed_at);
        if (timeFilter === "today" && completedDate < getStartOfDay(now)) return false;
        if (timeFilter === "week" && completedDate < getStartOfWeek(now)) return false;
        if (timeFilter === "month" && completedDate < getStartOfMonth(now)) return false;
      }

      // 3. Standard Filters
      const searchLower = search.toLowerCase();
      const assignee = users.find(u => u.id === task.user_id);
      const assigneeName = assignee ? assignee.full_name.toLowerCase() : "";

      const matchesSearch = !search || 
        task.title.toLowerCase().includes(searchLower) || 
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        assigneeName.includes(searchLower);

      const matchesPriority = activeTab === "completed" || !priorityFilter || task.priority === priorityFilter;
      const matchesCategory = activeTab === "completed" || !categoryFilter || task.category === categoryFilter;

      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [tasks, users, activeTab, selectedUserId, timeFilter, search, priorityFilter, categoryFilter]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
    const now = new Date();
    
    const globalActive = tasks.filter(t => t.status !== "completed").length;
    const globalOverdue = tasks.filter(t => t.status !== "completed" && t.due_date && new Date(t.due_date) < now).length;
    const globalUnassigned = tasks.filter(t => t.status === "unassigned" || t.user_id === null).length;

    let userMetrics = { total: 0, overdue: 0, completed: 0 };
    if (selectedUserId) {
      const userTasks = tasks.filter(t => t.user_id?.toString() === selectedUserId);
      userMetrics.total = userTasks.filter(t => t.status !== "completed").length;
      userMetrics.overdue = userTasks.filter(t => t.status !== "completed" && t.due_date && new Date(t.due_date) < now).length;
      userMetrics.completed = userTasks.filter(t => t.status === "completed").length;
    }

    const completedTasks = tasks.filter(t => t.status === "completed" && t.completed_at);
    const completedToday = completedTasks.filter(t => new Date(t.completed_at!) >= getStartOfDay(now)).length;
    const completedThisWeek = completedTasks.filter(t => new Date(t.completed_at!) >= getStartOfWeek(now)).length;
    const completedThisMonth = completedTasks.filter(t => new Date(t.completed_at!) >= getStartOfMonth(now)).length;

    return {
      totalActive: globalActive,
      overdue: globalOverdue,
      unassigned: globalUnassigned,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      user: userMetrics,
    };
  }, [tasks, selectedUserId]);

  // --- Dropdown Logic ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdownId !== null && !target.closest(`[data-dropdown-id="${openDropdownId}"]`)) {
        setOpenDropdownId(null);
        setDropdownPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  const handleToggleDropdown = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    if (openDropdownId === taskId) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    } else {
      setOpenDropdownId(taskId);
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  };

  // --- Actions ---
  const handleAssign = async (taskId: number, userId: number) => {
    try {
      await tasksApi.assign(taskId, userId);
      toast.success("Task assigned successfully!");
      setOpenDropdownId(null); setDropdownPos(null);
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to assign task"); }
  };

  const handleClaim = async (taskId: number) => {
    try {
      await tasksApi.claim(taskId);
      toast.success("Task claimed successfully!");
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to claim task"); }
  };

  const handleStatusChange = async (taskId: number, newStatus: Task["status"]) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      toast.success(`Task marked as ${newStatus.replace("_", " ")}`);
      setOpenDropdownId(null); setDropdownPos(null);
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to update task"); }
  };

  const handleReopen = async (taskId: number) => {
    try {
      await tasksApi.update(taskId, { status: "pending" });
      toast.success("Task reopened");
      setOpenDropdownId(null); setDropdownPos(null);
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to reopen task"); }
  };

  const handleArchive = async (taskId: number) => {
    if (!confirm("Are you sure you want to archive this task?")) return;
    try {
      await tasksApi.update(taskId, { status: "completed" });
      toast.success("Task archived successfully!");
      setOpenDropdownId(null); setDropdownPos(null);
      await fetchData();
    } catch (error: any) { toast.error(error.response?.data?.detail || "Failed to archive task"); }
  };

  useEffect(() => { setCurrentPage(1); }, [search, priorityFilter, categoryFilter, selectedUserId, timeFilter, activeTab]);

  return {
    activeTab, setActiveTab,
    currentPage, setCurrentPage,
    pageSize, totalPages,
    search, setSearch,
    priorityFilter, setPriorityFilter,
    categoryFilter, setCategoryFilter,
    selectedUserId, setSelectedUserId,
    timeFilter, setTimeFilter,
    loading, users, tasks, filteredTasks, paginatedTasks,
    metrics,
    openDropdownId, dropdownPos, handleToggleDropdown,
    handleAssign, handleClaim, handleStatusChange, handleReopen, handleArchive,
    refetch: fetchData,
  };
}
