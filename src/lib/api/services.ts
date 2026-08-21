import apiClient from "@/lib/api-client";
import type { ServicesResponse } from "@/lib/types";

export const servicesApi = {
  // ✅ Trailing slash — matches backend route + other API modules
  list: () =>
    apiClient.get<ServicesResponse>("/services/").then((r) => r.data),
};
