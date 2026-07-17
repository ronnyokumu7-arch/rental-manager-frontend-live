import apiClient from "@/lib/api-client";
import type { User } from "@/lib/types";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
}

export const userPreferencesApi = {
  get: async (): Promise<UserPreferences> => {
    return apiClient.get<UserPreferences>("/user/preferences/").then((r) => r.data);
  },
  update: async (payload: Partial<UserPreferences>): Promise<User> => {
    return apiClient.patch<User>("/user/preferences/", null, { params: payload }).then((r) => r.data);
  },
};
