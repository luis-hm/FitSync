import type { LucideIcon } from "lucide-react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-normal text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

type SummaryChip = {
  label: string;
  value: string | number;
};

export function SummaryChips({ items }: { items: SummaryChip[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm"
        >
          <span className="text-muted-foreground">{item.label}:</span>
          <span className="font-semibold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ active }: { active?: boolean }) {
  return active ? (
    <Badge className="bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/10">Ativo</Badge>
  ) : (
    <Badge variant="secondary" className="bg-[#4B5563]/20 text-muted-foreground">
      Inativo
    </Badge>
  );
}

export function LoadingPanel({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="border border-border">
      <CardContent className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export function ErrorPanel({ title = "Nao foi possivel carregar", description }: { title?: string; description: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-lg border border-border bg-muted">
        <Icon className="size-5 text-primary" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function PaginationFooter({
  count,
  page,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  count: number;
  page: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        Pagina {page} de {Math.max(1, Math.ceil(count / 10))} · {count} registros
      </span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onPrevious} disabled={!hasPrevious}>
          Anterior
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
          Proxima
        </Button>
      </div>
    </div>
  );
}

export function FormField({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} />
    </div>
  );
}

export function NativeSelectField({
  label,
  name,
  defaultValue,
  options,
  placeholder = "Selecione",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className={cn(
          "h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm text-foreground outline-none transition-colors",
          "focus:border-ring focus:ring-3 focus:ring-ring/50",
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SubmitButton({
  children,
  isPending,
}: {
  children: ReactNode;
  isPending?: boolean;
}) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
