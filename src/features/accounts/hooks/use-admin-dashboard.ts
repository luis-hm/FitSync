"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/features/accounts/api/accounts.api";

export const adminDashboardQueryKey = ["accounts", "admin-dashboard"] as const;

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: getAdminDashboard,
  });
}
