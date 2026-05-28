import { http } from "@/lib/api/http";
import type { ApiOptions } from "@/features/core/types/options.types";

export async function getOptions() {
  const response = await http.get<ApiOptions>("/api/options/");
  return response.data;
}
