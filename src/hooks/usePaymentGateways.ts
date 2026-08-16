// src/hooks/usePaymentGateways.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { tenantsApi } from "@/lib/api/tenants";
import type { 
  PaymentGatewayPayload, 
  GatewayType 
} from "@/lib/types";

/**
 * Strips out masked credentials (e.g., "****1234") and empty strings 
 * before sending a payload to the backend.
 * 
 * WHY THIS IS CRITICAL:
 * The backend masks secrets on GET requests. If a user opens the edit modal, 
 * doesn't touch a secret field, and clicks "Save", the UI would normally send 
 * the masked string back, permanently corrupting the real credentials in the DB.
 * This function ensures we ONLY send fields that the user actually modified.
 */
const sanitizePayload = (payload: PaymentGatewayPayload): PaymentGatewayPayload => {
  const sanitized: PaymentGatewayPayload = {};
  
  for (const [key, value] of Object.entries(payload)) {
    // Skip masked credentials
    if (typeof value === "string" && value.startsWith("****")) {
      continue;
    }
    // Skip empty strings (backend usually prefers omitting the key entirely over sending empty strings)
    if (typeof value === "string" && value.trim() === "") {
      continue;
    }
    sanitized[key] = value;
  }
  
  return sanitized;
};

/**
 * @hook usePaymentGateways
 * @description 
 * Manages the full lifecycle of payment gateway configurations for a specific tenant.
 * Works seamlessly for both Super Admins (managing any tenant) and Tenant Admins (self-service).
 */
export function usePaymentGateways(tenantId: number | string) {
  const queryClient = useQueryClient();
  const queryKey = ["payment-gateways", tenantId];

  // ─── FETCH (GET) ───────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey,
    queryFn: () => tenantsApi.getPaymentGateways(tenantId),
    select: (data) => data.gateways, // Flatten the response to just return the array
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    enabled: !!tenantId, // Only run if we have a valid tenantId
  });

  // ─── MUTATIONS (CREATE, UPDATE, DELETE, TEST) ──────────────────────────────

  const createMutation = useMutation({
    mutationFn: ({ gatewayType, payload }: { gatewayType: GatewayType | string; payload: PaymentGatewayPayload }) =>
      tenantsApi.createPaymentGateway(tenantId, gatewayType, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Gateway configured successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to save configuration.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ gatewayType, configId, payload }: { gatewayType: GatewayType | string; configId: number; payload: PaymentGatewayPayload }) =>
      // ✅ CRITICAL: Sanitize the payload to prevent overwriting secrets with masked strings
      tenantsApi.updatePaymentGateway(tenantId, gatewayType, configId, sanitizePayload(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Gateway updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update configuration.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ gatewayType, configId }: { gatewayType: GatewayType | string; configId: number }) =>
      tenantsApi.deletePaymentGateway(tenantId, gatewayType, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Gateway deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to delete gateway.");
    },
  });

  const testMutation = useMutation({
    mutationFn: ({ gatewayType, payload }: { gatewayType: GatewayType | string; payload: PaymentGatewayPayload }) =>
      tenantsApi.testPaymentGateway(tenantId, gatewayType, payload),
    onSuccess: () => {
      toast.success("Connection test successful! Credentials are valid.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Connection failed. Please check your credentials.");
    },
  });

  // ─── RETURN API ────────────────────────────────────────────────────────────
  return {
    // Data
    gateways: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,

    // Actions (using mutateAsync so the UI components can await them and close modals on success)
    createGateway: createMutation.mutateAsync,
    updateGateway: updateMutation.mutateAsync,
    deleteGateway: deleteMutation.mutateAsync,
    testGateway: testMutation.mutateAsync,

    // Loading States for UI buttons
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTesting: testMutation.isPending,
  };
}
