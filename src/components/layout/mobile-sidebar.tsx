"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AuthUser, UserRole } from "@/features/auth/types/auth.types";
import { Sidebar } from "./sidebar";

type MobileSidebarProps = {
  user: AuthUser | null;
  role: UserRole;
  onLogout: () => void;
};

export function MobileSidebar({ user, role, onLogout }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 max-w-[calc(100vw-2rem)] border-[#2A2A2A] bg-[#141414] p-0">
        <SheetTitle className="sr-only">Menu principal</SheetTitle>
        <Sidebar
          user={user}
          role={role}
          onLogout={onLogout}
          onNavigate={() => setOpen(false)}
          className="h-full w-full border-r-0"
        />
      </SheetContent>
    </Sheet>
  );
}
