"use client";

import { useQuery } from "@tanstack/react-query";
import { getOptions } from "@/features/core/api/options.api";

export const optionsQueryKey = ["core", "options"] as const;

export function useOptions() {
  return useQuery({
    queryKey: optionsQueryKey,
    queryFn: getOptions,
    staleTime: 5 * 60_000,
  });
}
