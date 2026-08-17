// src/hooks/usePlatformSettings.ts
import { useState, useEffect, useCallback } from "react";
import {
  platformSettingsAdminApi,
  PlatformSettings,
  PlatformSettingsUpdatePayload,
} from "@/lib/api/commission";

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await platformSettingsAdminApi.get();
      setSettings(res.data);
    } catch (err) {
      console.error("[usePlatformSettings] Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Throws on error so the component can toast the backend detail. */
  const save = async (payload: PlatformSettingsUpdatePayload) => {
    setSaving(true);
    try {
      const res = await platformSettingsAdminApi.update(payload);
      setSettings(res.data);
      return res.data;
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, refresh, save };
}
