"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client"; // ✅ Added direct API client
import { clientsApi } from "@/lib/api/clients";
import { bookingsApi } from "@/lib/api/bookings";
import type { Client, Booking } from "@/lib/types";
import ClientProfileHeader from "@/components/client-profile/ClientProfileHeader";
import ClientInfoPanel from "@/components/client-profile/ClientInfoPanel";
import ClientBookingsPanel from "@/components/client-profile/ClientInvoicesPanel";

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = parseInt(params.id as string);
  
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientData, bookingsData] = await Promise.all([
        clientsApi.get(clientId),
        bookingsApi.list(),
      ]);
      setClient(clientData);
      const clientBookings = bookingsData.filter(b => b.client_id === clientId);
      setBookings(clientBookings);
    } catch (error) {
      console.error("Failed to load client data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  // ✅ NEW: Handle Status Changes using dedicated endpoints
  const handleStatusChange = async () => {
    if (!client) return;
    setActionLoading(true);
    
    try {
      // Determine which dedicated endpoint to call based on current status
      const endpoint = client.status === "active" ? "suspend" : "reactivate";
      
      // Call the dedicated POST endpoint (bypasses the PATCH restriction)
      await apiClient.post(`/clients/${client.id}/${endpoint}`);
      
      toast.success(`Client successfully ${endpoint === "suspend" ? "suspended" : "reactivated/verified"}`);
      
      // Refresh client data to show new status
      const updatedClient = await clientsApi.get(clientId);
      setClient(updatedClient);
    } catch (error) {
      toast.error("Failed to update client status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent-dark border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-4">
      {/* Top Bar: Back Button & New Booking */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Clients
        </button>
        <button
          onClick={() => router.push(`/dashboard/bookings/new?client_id=${client.id}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-dark text-slate text-sm font-semibold hover:bg-accent-darker transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Booking
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN - 4/12 width */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* ✅ Pass the new handler to the header */}
          <ClientProfileHeader 
            client={client} 
            onStatusAction={handleStatusChange}
            actionLoading={actionLoading}
          />
          <ClientInfoPanel client={client} />
        </div>

        {/* RIGHT COLUMN - 8/12 width */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <ClientBookingsPanel client={client} bookings={bookings} />
        </div>
      </div>
    </div>
  );
}
