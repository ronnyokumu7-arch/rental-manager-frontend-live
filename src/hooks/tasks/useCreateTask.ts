import { useState, useEffect, useMemo } from "react";
import { usersApi } from "@/lib/api/users";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { bookingsApi } from "@/lib/api/bookings";
import type { User, Client, Vehicle, Booking } from "@/lib/types";

export type Priority = "low" | "medium" | "high" | "urgent";
export type Category = "compliance" | "finance" | "maintenance" | "hr" | "operations" | "other";
export type EntityType = "user" | "client" | "vehicle" | "booking";
export type TabType = "users" | "clients" | "vehicles" | "bookings";

export interface RelatedEntity {
  type: EntityType | null;
  id: number | null;
  label: string;
}

export function useCreateTask() {
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("operations");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [relatedEntity, setRelatedEntity] = useState<RelatedEntity>({ type: null, id: null, label: "" });
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("users");

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Fetch Data
  useEffect(() => {
    usersApi.list().then(setUsers);
    clientsApi.list().then(setClients);
    vehiclesApi.list().then(setVehicles);
    bookingsApi.list({ status: "active,confirmed" }).then(setBookings);
  }, []);

  // Filtering Logic
  const filteredUsers = useMemo(() => users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ), [users, searchQuery]);

  const filteredClients = useMemo(() => clients.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  ), [clients, searchQuery]);

  const filteredVehicles = useMemo(() => vehicles.filter(v =>
    v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  ), [vehicles, searchQuery]);

  const filteredBookings = useMemo(() => bookings.filter(b =>
    b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toString().includes(searchQuery)
  ), [bookings, searchQuery]);

  // Reset
  const reset = () => {
    setTitle(""); setDescription(""); setPriority("medium"); setCategory("operations");
    setDueDate(""); setAssignedTo(null); setRelatedEntity({ type: null, id: null, label: "" });
    setSearchQuery("");
  };

  return {
    title, setTitle, description, setDescription,
    priority, setPriority, category, setCategory,
    dueDate, setDueDate, assignedTo, setAssignedTo,
    relatedEntity, setRelatedEntity,
    searchQuery, setSearchQuery, activeTab, setActiveTab,
    users: filteredUsers, clients: filteredClients,
    vehicles: filteredVehicles, bookings: filteredBookings,
    reset
  };
}
