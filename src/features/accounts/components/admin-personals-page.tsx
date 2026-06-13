"use client";

import { Edit, Plus, Search, UserRoundCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  EmptyPanel,
  ErrorPanel,
  FormField,
  LoadingPanel,
  PaginationFooter,
  StatusBadge,
  SubmitButton,
  SummaryChips,
  TextAreaField,
} from "@/components/shared/admin-screen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  adminPersonalUpdateSchema,
  adminUserCreateSchema,
} from "@/features/accounts/schemas/accounts.schemas";
import {
  useAdminPersonals,
  useUpdateAdminPersonal,
} from "@/features/accounts/hooks/use-admin-personals";
import {
  useCreateAdminUser,
  useSetAdminUserStatus,
} from "@/features/accounts/hooks/use-admin-users";
import {
  formatDateTime,
  getInitials,
  toAdminPersonalUpdatePayload,
  toAdminUserCreatePayload,
} from "@/features/accounts/mappers/accounts.mappers";
import type { AdminPersonal } from "@/features/accounts/types/accounts.types";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formBoolean, formText } from "@/lib/form-data";

type StatusFilter = "TODOS" | "ATIVO" | "INATIVO";

export function AdminPersonalsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState<AdminPersonal | null>(null);

  const params = useMemo(
    () => ({
      page,
      search: search || undefined,
      ativo: statusFilter === "TODOS" ? undefined : statusFilter === "ATIVO",
    }),
    [page, search, statusFilter],
  );

  const personalsQuery = useAdminPersonals(params);
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminPersonal();
  const statusMutation = useSetAdminUserStatus();

  const activeCount = personalsQuery.data?.results.filter((personal) => personal.is_active).length ?? 0;
  const inactiveCount = personalsQuery.data ? personalsQuery.data.results.length - activeCount : 0;

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = adminUserCreateSchema.safeParse({
      nome: formText(formData, "nome"),
      email: formText(formData, "email"),
      tipo: "PERSONAL",
      password: formText(formData, "password"),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    createMutation.mutate(toAdminUserCreatePayload(parsed.data), {
      onSuccess: () => {
        toast.success("Personal criado.");
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPersonal) return;

    const formData = new FormData(event.currentTarget);
    const parsed = adminPersonalUpdateSchema.safeParse({
      nome: formText(formData, "nome"),
      email: formText(formData, "email"),
      is_active: formBoolean(formData, "is_active"),
      password: formText(formData, "password") || undefined,
      especialidade: formText(formData, "especialidade") || undefined,
      bio: formText(formData, "bio") || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    updateMutation.mutate(
      { id: editingPersonal.id, payload: toAdminPersonalUpdatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Personal atualizado.");
          setEditingPersonal(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleStatus(personal: AdminPersonal) {
    const active = personal.is_active ?? true;
    statusMutation.mutate(
      { id: personal.id, action: active ? "desativar" : "ativar" },
      {
        onSuccess: () => toast.success(active ? "Personal desativado." : "Personal ativado."),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Personais"
        description="Listagem com metricas reais de alunos, treinos e avaliacoes."
        action={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Novo personal
          </Button>
        }
      />

      <SummaryChips
        items={[
          { label: "Total", value: personalsQuery.data?.count ?? 0 },
          { label: "Ativos nesta pagina", value: activeCount },
          { label: "Inativos nesta pagina", value: inactiveCount },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
            placeholder="Buscar personal"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as StatusFilter);
            setPage(1);
          }}
          className="h-8 rounded-lg border border-input bg-input/30 px-2.5 text-sm"
          aria-label="Status"
        >
          <option value="TODOS">Todos os status</option>
          <option value="ATIVO">Ativos</option>
          <option value="INATIVO">Inativos</option>
        </select>
      </div>

      {personalsQuery.isLoading ? <LoadingPanel rows={6} /> : null}
      {personalsQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(personalsQuery.error, "Nao foi possivel carregar personais.")} />
      ) : null}
      {personalsQuery.data?.results.length === 0 ? (
        <EmptyPanel icon={UserRoundCheck} title="Nenhum personal encontrado" description="Crie um personal ou ajuste os filtros." />
      ) : null}

      {personalsQuery.data && personalsQuery.data.results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {personalsQuery.data.results.map((personal) => (
            <div
              key={personal.id}
              className="flex min-h-56 flex-col gap-5 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {getInitials(personal.nome)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-foreground">{personal.nome}</div>
                    <div className="truncate text-sm text-muted-foreground">{personal.email}</div>
                  </div>
                </div>
                <StatusBadge active={personal.is_active} />
              </div>

              <div className="flex items-center">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {personal.especialidade || "Sem especialidade"}
                </span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-border text-sm">
                <Metric label="Alunos" value={personal.alunos_count} />
                <Metric label="Treinos" value={personal.treinos_count} />
                <Metric label="Aval. 30d" value={personal.avaliacoes_30d_count} />
              </div>

              <div className="mt-auto flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Ultimo acesso: {formatDateTime(personal.last_login)}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingPersonal(personal)}>
                    <Edit className="size-3.5" aria-hidden="true" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant={personal.is_active ? "destructive" : "outline"}
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => handleStatus(personal)}
                  >
                    {personal.is_active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {personalsQuery.data ? (
        <PaginationFooter
          count={personalsQuery.data.count}
          page={page}
          hasPrevious={Boolean(personalsQuery.data.previous)}
          hasNext={Boolean(personalsQuery.data.next)}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Novo personal</DialogTitle>
            <DialogDescription>Cria a conta base do personal. O perfil estendido pode ser editado em seguida.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome" name="nome" required />
              <FormField label="E-mail" name="email" type="email" required />
              <FormField label="Senha temporaria" name="password" type="password" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton isPending={createMutation.isPending}>Criar</SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingPersonal)} onOpenChange={(open) => !open && setEditingPersonal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar personal</DialogTitle>
            <DialogDescription>Atualize dados da conta e perfil profissional.</DialogDescription>
          </DialogHeader>
          {editingPersonal ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nome" name="nome" defaultValue={editingPersonal.nome} required />
                <FormField label="E-mail" name="email" type="email" defaultValue={editingPersonal.email} required />
                <FormField label="Especialidade" name="especialidade" defaultValue={editingPersonal.especialidade} />
                <FormField label="Nova senha" name="password" type="password" />
                <div className="flex items-end">
                  <label className="flex h-8 items-center gap-2 text-sm text-foreground">
                    <input name="is_active" type="checkbox" defaultChecked={editingPersonal.is_active ?? true} />
                    Conta ativa
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <TextAreaField label="Bio" name="bio" defaultValue={editingPersonal.bio} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingPersonal(null)}>
                  Cancelar
                </Button>
                <SubmitButton isPending={updateMutation.isPending}>Salvar</SubmitButton>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-bold text-foreground">{value}</div>
    </div>
  );
}
