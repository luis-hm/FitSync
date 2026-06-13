"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";
import { getNavigationItems, isNavItemActive } from "./navigation";

type NavigationListProps = {
  role: UserRole;
  onNavigate?: () => void;
};

export function NavigationList({ role, onNavigate }: NavigationListProps) {
  const pathname = usePathname();
  const visibleItems = getNavigationItems(role);

  return (
    <nav className="flex flex-col gap-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = isNavItemActive(pathname, item);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex h-11 items-center gap-3 rounded-lg border-l-2 border-transparent px-3 text-sm font-medium text-[#888888] transition-colors hover:bg-[#1A1A1A] hover:text-[#F5F5F5]",
              isActive && "border-[#B8FF57] bg-[#1E1E1E] text-[#F5F5F5] hover:bg-[#1E1E1E] hover:text-[#F5F5F5]",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
