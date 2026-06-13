"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "@/features/accounts/api/accounts.api";
import type { PlatformSettingsUpdatePayload } from "@/features/accounts/types/accounts.types";

export const platformSettingsQueryKey = ["core", "platform-settings"] as const;

export function usePlatformSettings() {
  return useQuery({
    queryKey: platformSettingsQueryKey,
    queryFn: getPlatformSettings,
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlatformSettingsUpdatePayload) => updatePlatformSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformSettingsQueryKey });
    },
  });
}
