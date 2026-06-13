"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/query/query-client";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
