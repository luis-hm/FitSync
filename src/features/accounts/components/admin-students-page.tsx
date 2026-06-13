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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminStudentUpdateSchema,
  adminUserCreateSchema,
} from "@/features/accounts/schemas/accounts.schemas";
import { useAdminPersonals } from "@/features/accounts/hooks/use-admin-personals";
import {
  useAdminStudents,
  useUpdateAdminStudent,
} from "@/features/accounts/hooks/use-admin-students";
import { useCreateAdminUser } from "@/features/accounts/hooks/use-admin-users";
import {
  formatDate,
  toAdminStudentUpdatePayload,
  toAdminUserCreatePayload,
} from "@/features/accounts/mappers/accounts.mappers";
import type { AdminStudent } from "@/features/accounts/types/accounts.types";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formBoolean, formText } from "@/lib/form-data";

type StatusFilter = "TODOS" | "ATIVO" | "INATIVO";

export function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [personalFilter, setPersonalFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null);

  const params = useMemo(
    () => ({
      page,
      search: search || undefined,
      ativo: statusFilter === "TODOS" ? undefined : statusFilter === "ATIVO",
      personal_id: personalFilter || undefined,
    }),
    [page, personalFilter, search, statusFilter],
  );

  const studentsQuery = useAdminStudents(params);
  const personalsQuery = useAdminPersonals({ ativo: true });
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminStudent();

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
      tipo: "ALUNO",
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
        toast.success("Aluno criado.");
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingStudent) return;

    const formData = new FormData(event.currentTarget);
    const parsed = adminStudentUpdateSchema.safeParse({
      nome: formText(formData, "nome"),
      email: formText(formData, "email"),
      is_active: formBoolean(formData, "is_active"),
      personal_id: formText(formData, "personal_id"),
      data_nascimento: formText(formData, "data_nascimento"),
      sexo: formText(formData, "sexo"),
      objetivo_principal: formText(formData, "objetivo_principal") || undefined,
      observacoes_medicas: formText(formData, "observacoes_medicas") || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    updateMutation.mutate(
      { id: editingStudent.id, payload: toAdminStudentUpdatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Aluno atualizado.");
          setEditingStudent(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleStatus(student: AdminStudent) {
    const active = student.is_active ?? true;
    updateMutation.mutate(
      { id: student.id, payload: { is_active: !active } },
      {
        onSuccess: () => toast.success(active ? "Aluno desativado." : "Aluno ativado."),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Alunos"
        description="Gestao de perfil estendido e vinculo com personal."
        action={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Novo aluno
          </Button>
        }
      />

      <SummaryChips
        items={[
          { label: "Resultado", value: studentsQuery.data?.count ?? 0 },
          { label: "Personal", value: personalFilter ? "Filtrado" : "Todos" },
        ]}
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
            placeholder="Buscar aluno, e-mail, objetivo ou personal"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:flex">
          <select
            value={personalFilter}
            onChange={(event) => {
              setPersonalFilter(event.target.value);
              setPage(1);
            }}
            className="h-8 rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            aria-label="Personal"
          >
            <option value="">Todos os personais</option>
            {personalOptions.map((personal) => (
              <option key={personal.value} value={personal.value}>
                {personal.label}
              </option>
            ))}
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

      {studentsQuery.isLoading ? <LoadingPanel /> : null}
      {studentsQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(studentsQuery.error, "Nao foi possivel carregar alunos.")} />
      ) : null}
      {studentsQuery.data?.results.length === 0 ? (
        <EmptyPanel icon={Users} title="Nenhum aluno encontrado" description="Ajuste os filtros ou crie um novo aluno." />
      ) : null}

      {studentsQuery.data && studentsQuery.data.results.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Personal</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsQuery.data.results.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{student.nome}</div>
                    <div className="text-xs text-muted-foreground">{student.email}</div>
                  </TableCell>
                  <TableCell>{student.personal_nome}</TableCell>
                  <TableCell>
                    <div>{student.sexo === "M" ? "Masculino" : "Feminino"}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(student.data_nascimento)}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={student.is_active} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingStudent(student)}>
                        <Edit className="size-3.5" aria-hidden="true" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant={student.is_active ? "destructive" : "outline"}
                        size="sm"
                        disabled={updateMutation.isPending}
                        onClick={() => handleStatus(student)}
                      >
                        {student.is_active ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {studentsQuery.data ? (
        <PaginationFooter
          count={studentsQuery.data.count}
          page={page}
          hasPrevious={Boolean(studentsQuery.data.previous)}
          hasNext={Boolean(studentsQuery.data.next)}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo aluno</DialogTitle>
            <DialogDescription>Cria usuario aluno e perfil estendido em uma unica chamada admin.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome" name="nome" required />
              <FormField label="E-mail" name="email" type="email" required />
              <FormField label="Senha temporaria" name="password" type="password" required />
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton isPending={createMutation.isPending}>Criar</SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingStudent)} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar aluno</DialogTitle>
            <DialogDescription>Atualize o perfil estendido e o personal responsavel.</DialogDescription>
          </DialogHeader>
          {editingStudent ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nome" name="nome" defaultValue={editingStudent.nome} required />
                <FormField label="E-mail" name="email" type="email" defaultValue={editingStudent.email} required />
                <NativeSelectField
                  label="Personal responsavel"
                  name="personal_id"
                  defaultValue={editingStudent.personal_id}
                  options={personalOptions}
                  required
                />
                <FormField
                  label="Data de nascimento"
                  name="data_nascimento"
                  type="date"
                  defaultValue={editingStudent.data_nascimento}
                  required
                />
                <NativeSelectField
                  label="Sexo"
                  name="sexo"
                  defaultValue={editingStudent.sexo}
                  options={[
                    { value: "M", label: "Masculino" },
                    { value: "F", label: "Feminino" },
                  ]}
                  required
                />
                <FormField label="Objetivo principal" name="objetivo_principal" defaultValue={editingStudent.objetivo_principal} />
                <div className="flex items-end">
                  <label className="flex h-8 items-center gap-2 text-sm text-foreground">
                    <input name="is_active" type="checkbox" defaultChecked={editingStudent.is_active ?? true} />
                    Conta ativa
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <TextAreaField
                    label="Observacoes medicas"
                    name="observacoes_medicas"
                    defaultValue={editingStudent.observacoes_medicas}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
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
