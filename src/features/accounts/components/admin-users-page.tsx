"use client";

import { Edit, Plus, Search, Users } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  EmptyPanel,
  ErrorPanel,
  FormField,
  LoadingPanel,
  NativeSelectField,
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
} from "@/features/accounts/schemas/accounts.schemas";
import {
  useAdminPersonals,
} from "@/features/accounts/hooks/use-admin-personals";
import {
  useAdminUsers,
  useCreateAdminUser,
  useSetAdminUserStatus,
  useUpdateAdminUser,
} from "@/features/accounts/hooks/use-admin-users";
import {
  formatDate,
  formatRole,
  toAdminUserCreatePayload,
  toAdminUserUpdatePayload,
} from "@/features/accounts/mappers/accounts.mappers";
import type { AdminUser } from "@/features/accounts/types/accounts.types";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formBoolean, formText } from "@/lib/form-data";

type StatusFilter = "TODOS" | "ATIVO" | "INATIVO";
type TypeFilter = "TODOS" | "PERSONAL" | "ALUNO";

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("TODOS");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"PERSONAL" | "ALUNO">("PERSONAL");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const params = useMemo(
    () => ({
      page,
      search: search || undefined,
      tipo: typeFilter === "TODOS" ? undefined : typeFilter,
      ativo: statusFilter === "TODOS" ? undefined : statusFilter === "ATIVO",
    }),
    [page, search, statusFilter, typeFilter],
  );

  const usersQuery = useAdminUsers(params);
  const personalsQuery = useAdminPersonals({ ativo: true });
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();
  const statusMutation = useSetAdminUserStatus();

  const personalOptions =
    personalsQuery.data?.results.map((personal) => ({
      value: personal.id,
      label: personal.nome,
    })) ?? [];

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = adminUserCreateSchema.safeParse({
      nome: formText(formData, "nome"),
      email: formText(formData, "email"),
      tipo: formText(formData, "tipo"),
      password: formText(formData, "password"),
      personal_id: formText(formData, "personal_id") || undefined,
      data_nascimento: formText(formData, "data_nascimento") || undefined,
      sexo: formText(formData, "sexo") || undefined,
      objetivo_principal: formText(formData, "objetivo_principal") || undefined,
      observacoes_medicas: formText(formData, "observacoes_medicas") || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    createMutation.mutate(toAdminUserCreatePayload(parsed.data), {
      onSuccess: () => {
        toast.success("Usuario criado.");
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(event.currentTarget);
    const parsed = adminUserUpdateSchema.safeParse({
      nome: formText(formData, "nome"),
      email: formText(formData, "email"),
      is_active: formBoolean(formData, "is_active"),
      password: formText(formData, "password") || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    updateMutation.mutate(
      { id: editingUser.id, payload: toAdminUserUpdatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Usuario atualizado.");
          setEditingUser(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleStatus(user: AdminUser) {
    const active = user.is_active ?? true;
    statusMutation.mutate(
      { id: user.id, action: active ? "desativar" : "ativar" },
      {
        onSuccess: () => toast.success(active ? "Usuario desativado." : "Usuario ativado."),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Usuarios"
        description="Gestao de contas de personais e alunos."
        action={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Novo usuario
          </Button>
        }
      />

      <SummaryChips
        items={[
          { label: "Resultado", value: usersQuery.data?.count ?? 0 },
          { label: "Filtro", value: statusFilter === "TODOS" ? "Todos" : statusFilter.toLowerCase() },
        ]}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
            placeholder="Buscar por nome ou e-mail"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as TypeFilter);
              setPage(1);
            }}
            className="h-8 rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            aria-label="Tipo"
          >
            <option value="TODOS">Todos os tipos</option>
            <option value="PERSONAL">Personais</option>
            <option value="ALUNO">Alunos</option>
          </select>
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
      </div>

      {usersQuery.isLoading ? <LoadingPanel /> : null}
      {usersQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(usersQuery.error, "Nao foi possivel carregar usuarios.")} />
      ) : null}
      {usersQuery.data?.results.length === 0 ? (
        <EmptyPanel icon={Users} title="Nenhum usuario encontrado" description="Ajuste os filtros ou crie um novo usuario." />
      ) : null}

      {usersQuery.data && usersQuery.data.results.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criacao</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.data.results.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{user.nome}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>{formatRole(user.tipo)}</TableCell>
                  <TableCell>
                    <StatusBadge active={user.is_active} />
                  </TableCell>
                  <TableCell>{formatDate(user.data_criacao)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                        <Edit className="size-3.5" aria-hidden="true" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant={user.is_active ? "destructive" : "outline"}
                        size="sm"
                        disabled={statusMutation.isPending}
                        onClick={() => handleStatus(user)}
                      >
                        {user.is_active ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {usersQuery.data ? (
        <PaginationFooter
          count={usersQuery.data.count}
          page={page}
          hasPrevious={Boolean(usersQuery.data.previous)}
          hasNext={Boolean(usersQuery.data.next)}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo usuario</DialogTitle>
            <DialogDescription>Crie uma conta operacional alinhada aos tipos da API.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome" name="nome" required />
              <FormField label="E-mail" name="email" type="email" required />
              <div className="space-y-2">
                <Label htmlFor="create-user-tipo">Tipo</Label>
                <select
                  id="create-user-tipo"
                  name="tipo"
                  value={createType}
                  onChange={(event) => setCreateType(event.target.value as "PERSONAL" | "ALUNO")}
                  className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
                  required
                >
                  <option value="PERSONAL">Personal</option>
                  <option value="ALUNO">Aluno</option>
                </select>
              </div>
              <FormField label="Senha temporaria" name="password" type="password" required />
            </div>
            {createType === "ALUNO" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <NativeSelectField label="Personal responsavel" name="personal_id" options={personalOptions} required />
                <FormField label="Data de nascimento" name="data_nascimento" type="date" required />
                <NativeSelectField
                  label="Sexo"
                  name="sexo"
                  options={[
                    { value: "M", label: "Masculino" },
                    { value: "F", label: "Feminino" },
                  ]}
                  required
                />
                <FormField label="Objetivo principal" name="objetivo_principal" />
                <div className="sm:col-span-2">
                  <TextAreaField label="Observacoes medicas" name="observacoes_medicas" />
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton isPending={createMutation.isPending}>Criar</SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Atualize dados basicos e status da conta.</DialogDescription>
          </DialogHeader>
          {editingUser ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nome" name="nome" defaultValue={editingUser.nome} required />
                <FormField label="E-mail" name="email" type="email" defaultValue={editingUser.email} required />
                <FormField label="Nova senha" name="password" type="password" />
                <div className="flex items-end">
                  <label className="flex h-8 items-center gap-2 text-sm text-foreground">
                    <input name="is_active" type="checkbox" defaultChecked={editingUser.is_active ?? true} />
                    Conta ativa
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
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
