"use client";

import { useQuery } from "@tanstack/react-query";
import { getPersonalDashboard } from "@/features/accounts/api/accounts.api";

export function usePersonalDashboard() {
  return useQuery({
    queryKey: ["accounts", "personal-dashboard"],
    queryFn: getPersonalDashboard,
  });
}
