import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ListBadgeTone = "success" | "warning" | "danger" | "neutral" | "info";

const toneStyles: Record<ListBadgeTone, { badge: string; dot: string }> = {
  success: {
    badge: "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/10",
    dot: "bg-[#22C55E]",
  },
  warning: {
    badge: "border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/10",
    dot: "bg-[#F59E0B]",
  },
  danger: {
    badge: "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/10",
    dot: "bg-destructive",
  },
  neutral: {
    badge: "border-border bg-muted/40 text-muted-foreground hover:bg-muted/40",
    dot: "bg-muted-foreground",
  },
  info: {
    badge: "border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/10",
    dot: "bg-[#38BDF8]",
  },
};

export function ListBadge({
  children,
  className,
  showDot = true,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  showDot?: boolean;
  tone?: ListBadgeTone;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 rounded-full px-2.5 font-medium", toneStyles[tone].badge, className)}
    >
      {showDot ? <span className={cn("size-1.5 rounded-full", toneStyles[tone].dot)} aria-hidden="true" /> : null}
      {children}
    </Badge>
  );
}

const periodicityStatus: Record<string, { label: string; tone: ListBadgeTone }> = {
  EM_DIA: { label: "Em dia", tone: "success" },
  VENCE_EM_BREVE: { label: "Vence em breve", tone: "warning" },
  VENCIDA: { label: "Vencida", tone: "danger" },
  SEM_DATA: { label: "Sem data", tone: "neutral" },
};

export function PeriodicityStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-muted-foreground">-</span>;

  const normalized = status.toUpperCase();
  const config = periodicityStatus[normalized] ?? {
    label: formatStatusLabel(status),
    tone: "info" as const,
  };

  return <ListBadge tone={config.tone}>{config.label}</ListBadge>;
}

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
