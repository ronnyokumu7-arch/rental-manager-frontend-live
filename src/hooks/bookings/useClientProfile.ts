// src/hooks/bookings/useClientProfile.ts
"use client";

import { useEffect, useState, useMemo } from "react";
import { clientsApi } from "@/lib/api/clients";
import type { Booking, Client } from "@/lib/types";

export function useClientProfile(booking: Booking | null | undefined) {
  const [fetchedClient, setFetchedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  // Extract embedded client or client ID from booking payload
  const embeddedClient = (booking as any)?.client || (booking as any)?.client_details;
  const clientId = booking?.client_id || (booking as any)?.client?.id;

  useEffect(() => {
    // 1. If embedded client already has full details (including full_name/name), skip extra API calls
    if (
      embeddedClient && 
      ((embeddedClient as any).full_name || embeddedClient.name || embeddedClient.first_name)
    ) {
      setFetchedClient(null);
      return;
    }

    // 2. Fetch full client details if missing or only client_id is available
    let isMounted = true;

    if (clientId && !fetchedClient && !loading) {
      setLoading(true);
      clientsApi
        .get(clientId) //
        .then((data) => {
          if (isMounted) setFetchedClient(data);
        })
        .catch((err) => {
          console.error("Failed to fetch client profile details:", err);
          if (isMounted) setFetchedClient(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, embeddedClient]);

  return useMemo(() => {
    // Priority: fetched API client > embedded booking client
    const client: Client | null = fetchedClient || embeddedClient || null;

    if (!client) {
      return {
        client: null,
        hasClient: false,
        loading,
        fullName: "Unassigned Client",
        isVerified: false,
        avatarInitials: "??",
        phone: "Not provided",
        email: "No email linked",
        licenseNumber: "Pending verification",
      };
    }

    // Name Resolution Hierarchy:
    // 1. full_name (matches SQLAlchemy model column)
    // 2. name property
    // 3. first_name + last_name
    // 4. Fallback: email username prefix
    // 5. Fallback: Client ID
    let fullName = (client as any).full_name || client.name || "";

    if (!fullName && (client.first_name || client.last_name)) {
      fullName = `${client.first_name || ""} ${client.last_name || ""}`.trim();
    }

    if (!fullName && client.email) {
      const emailUser = client.email.split("@")[0];
      fullName = emailUser.charAt(0).toUpperCase() + emailUser.slice(1);
    }

    if (!fullName) {
      fullName = `Client #${client.id}`;
    }

    // Generate Avatar Initials (e.g., "John Doe" -> "JD", "Molly" -> "MO")
    const names = fullName.trim().split(/\s+/);
    const avatarInitials = names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : fullName.slice(0, 2).toUpperCase();

    // Verification check (Checking dl_number / driver_license_number or explicit flag)
    const licenseNumber = 
      (client as any).dl_number || 
      client.driver_license_number || 
      (client as any)?.license_number || 
      null;

    const isVerified = Boolean(
      (client as any).is_verified || 
      licenseNumber
    );

    return {
      client,
      hasClient: true,
      loading,
      fullName,
      avatarInitials,
      isVerified,
      phone: client.phone || (client as any)?.phone_number || "Not provided",
      email: client.email || "No email linked",
      licenseNumber: licenseNumber || "Pending verification",
    };
  }, [fetchedClient, embeddedClient, loading]);
}
