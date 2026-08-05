import { useState, useEffect, useMemo } from "react";
import { tasksApi } from "@/lib/api/tasks";
import { usersApi } from "@/lib/api/users";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { bookingsApi } from "@/lib/api/bookings";
import type { Task, TaskCreate, TaskUpdate } from "@/lib/types";
import toast from "react-hot-toast";

export type RelationType = "client" | "vehicle" | "booking" | "contract" | "invoice" | null;

export interface RelationOption {
  id: number;
  label: string;
  subLabel?: string;
}

const CATEGORY_RELATION_MAP: Record<string, RelationType> = {
  fleet: "vehicle",
  clients: "client",
  bookings: "booking",
  other: null,
};

export function useTaskForm(editingTask: Task | null = null) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [department, setDepartment] = useState<string>("");

  const [targetType, setTargetType] = useState<RelationType>(null);
  const [targetId, setTargetId] = useState<number | null>(null);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [relationOptions, setRelationOptions] = useState<RelationOption[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Initialize Form
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setStartDate(editingTask.start_date ? editingTask.start_date.split("T")[0] : "");
      setDueDate(editingTask.due_date ? editingTask.due_date.split("T")[0] : "");
      setUserId(editingTask.user_id);
      setDepartment(editingTask.department || "");
      setTargetType(editingTask.target_type as RelationType);
      setTargetId(editingTask.target_id);
    } else {
      setTitle("");
      setDescription("");
      setCategory(null);
      setPriority("medium");
      setStartDate("");
      setDueDate("");
      setUserId(null);
      setDepartment("");
      setTargetType(null);
      setTargetId(null);
    }
  }, [editingTask]);

  // 2. Auto-map Category to Relation Type
  useEffect(() => {
    if (category) {
      const mappedType = CATEGORY_RELATION_MAP[category] || null;
      setTargetType(mappedType);
      setTargetId(null);
    } else {
      setTargetType(null);
      setTargetId(null);
    }
  }, [category]);

  // 3. Fetch All Users (Once)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.list();
        setAllUsers(data.filter((u: any) => u.is_active && !u.is_suspended));
      } catch (error) {
        console.error("Failed to fetch users for task form", error);
        setAllUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // 4. Dynamically Extract Unique Departments from Backend Data
  const availableDepartments = useMemo(() => {
    const depts = allUsers.map((u: any) => u.department).filter(Boolean);
    return [...new Set(depts)].sort() as string[];
  }, [allUsers]);

  // 5. Filter Users based on selected Department
  const users = useMemo(() => {
    if (!department) return allUsers;
    return allUsers.filter((u: any) => u.department === department);
  }, [allUsers, department]);

  // 6. Fetch Dynamic Relation Options
  useEffect(() => {
    if (!targetType) {
      setRelationOptions([]);
      return;
    }

    const fetchOptions = async () => {
      setLoadingRelations(true);
      try {
        let options: RelationOption[] = [];
        if (targetType === "client") {
          const data = await clientsApi.list();
          options = data.map((c: any) => ({ id: c.id, label: c.full_name, subLabel: c.phone || c.email }));
        } else if (targetType === "vehicle") {
          const data = await vehiclesApi.list();
          options = data.map((v: any) => ({ id: v.id, label: `${v.make} ${v.model} (${v.plate_number})`, subLabel: v.status }));
        } else if (targetType === "booking") {
          const data = await bookingsApi.list({ limit: 50 });
          options = data.map((b: any) => ({ id: b.id, label: `Booking #${b.booking_number || b.id}`, subLabel: b.client_name || b.start_date }));
        } 
        setRelationOptions(options);
      } catch (error) {
        console.error(`Failed to fetch ${targetType} options`, error);
        setRelationOptions([]);
      } finally {
        setLoadingRelations(false);
      }
    };

    fetchOptions();
  }, [targetType]);

  // 7. Validation
  const isValid = useMemo(() => {
    return title.trim().length > 0 && category !== null;
  }, [title, category]);

  // 8. Submit Handler
  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Task title and category are required.");
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        priority,
        start_date: startDate || null,
        due_date: dueDate || null,
        user_id: userId,
        department: department || null,
        target_type: targetType,
        target_id: targetId,
      };

      if (editingTask) {
        await tasksApi.update(editingTask.id, payload as TaskUpdate);
        toast.success("Task updated successfully!");
      } else {
        await tasksApi.create(payload as TaskCreate);
        toast.success("Task created successfully!");
      }
      return true;
    } catch (error: any) {
      // ✅ FIX: Safely parse FastAPI/Zod validation errors to prevent React crash
      let errorMessage = "Failed to save task";
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Extract the 'msg' string from each validation error object
          errorMessage = error.response.data.detail.map((e: any) => e.msg).join(", ");
        } else if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        }
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title, setTitle,
    description, setDescription,
    category, setCategory,
    priority, setPriority,
    startDate, setStartDate,
    dueDate, setDueDate,
    userId, setUserId,
    department, setDepartment,
    targetType,
    targetId, setTargetId,
    relationOptions,
    loadingRelations,
    users,
    availableDepartments,
    isValid,
    isSubmitting,
    handleSubmit,
  };
}
