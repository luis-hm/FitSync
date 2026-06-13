"use client";

import type { FormEvent } from "react";
import { Edit, FileText, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  EmptyPanel,
  ErrorPanel,
  FormField,
  LoadingPanel,
  NativeSelectField,
  PaginationFooter,
  SubmitButton,
  SummaryChips,
  TextAreaField,
} from "@/components/shared/admin-screen";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useCreatePersonalStudent,
  usePersonalStudents,
  useUpdatePersonalStudent,
} from "@/features/accounts/hooks/use-personal-students";
import {
  personalStudentCreateSchema,
  personalStudentUpdateSchema,
} from "@/features/accounts/schemas/accounts.schemas";
import {
  formatDate,
  toPersonalStudentCreatePayload,
  toPersonalStudentUpdatePayload,
} from "@/features/accounts/mappers/accounts.mappers";
import type { PersonalStudent } from "@/features/accounts/types/accounts.types";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formText } from "@/lib/form-data";

export function PersonalStudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<PersonalStudent | null>(null);
  const params = useMemo(() => ({ page, search: search || undefined }), [page, search]);
  const studentsQuery = usePersonalStudents(params);
  const createMutation = useCreatePersonalStudent();
  const updateMutation = useUpdatePersonalStudent();

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = personalStudentCreateSchema.safeParse({
      nome: formText(formData, "nome"),
      email: formText(formData, "email"),
      password: formText(formData, "password"),
      data_nascimento: formText(formData, "data_nascimento"),
      sexo: formText(formData, "sexo"),
      objetivo_principal: formText(formData, "objetivo_principal") || undefined,
      observacoes_medicas: formText(formData, "observacoes_medicas") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    createMutation.mutate(toPersonalStudentCreatePayload(parsed.data), {
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
    const parsed = personalStudentUpdateSchema.safeParse({
      nome: formText(formData, "nome"),
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
      { id: editingStudent.id, payload: toPersonalStudentUpdatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Aluno atualizado.");
          setEditingStudent(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description="Carteira de alunos vinculados ao seu acompanhamento."
        action={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Novo aluno
          </Button>
        }
      />

      <SummaryChips items={[{ label: "Alunos", value: studentsQuery.data?.count ?? 0 }]} />

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="pl-9"
          placeholder="Buscar aluno, e-mail ou objetivo"
        />
      </div>

      {studentsQuery.isLoading ? <LoadingPanel /> : null}
      {studentsQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(studentsQuery.error, "Nao foi possivel carregar alunos.")} />
      ) : null}
      {studentsQuery.data?.results.length === 0 ? (
        <EmptyPanel icon={Users} title="Nenhum aluno vinculado" description="Cadastre um aluno para criar treinos e registrar avaliacoes." />
      ) : null}

      {studentsQuery.data && studentsQuery.data.results.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsQuery.data.results.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{student.usuario.nome}</div>
                    <div className="text-xs text-muted-foreground">{student.usuario.email}</div>
                  </TableCell>
                  <TableCell>
                    <div>{student.sexo === "M" ? "Masculino" : "Feminino"}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(student.data_nascimento)}</div>
                  </TableCell>
                  <TableCell>{student.objetivo_principal || "Sem objetivo informado"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/personal/alunos/${student.id}`}>
                          <FileText className="size-3.5" aria-hidden="true" />
                          Dossie
                        </Link>
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingStudent(student)}>
                        <Edit className="size-3.5" aria-hidden="true" />
                        Editar
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

      <StudentFormDialog open={createOpen} title="Novo aluno" onOpenChange={setCreateOpen} onSubmit={handleCreate} isPending={createMutation.isPending} />
      <StudentFormDialog
        open={Boolean(editingStudent)}
        title="Editar aluno"
        student={editingStudent}
        onOpenChange={(open) => !open && setEditingStudent(null)}
        onSubmit={handleEdit}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}

function StudentFormDialog({
  open,
  title,
  student,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  title: string;
  student?: PersonalStudent | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isPending?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome" name="nome" defaultValue={student?.usuario.nome} required />
            {!student ? <FormField label="E-mail" name="email" type="email" required /> : null}
            {!student ? <FormField label="Senha temporaria" name="password" type="password" required /> : null}
            <FormField label="Data de nascimento" name="data_nascimento" type="date" defaultValue={student?.data_nascimento} required />
            <NativeSelectField
              label="Sexo"
              name="sexo"
              defaultValue={student?.sexo}
              options={[
                { value: "M", label: "Masculino" },
                { value: "F", label: "Feminino" },
              ]}
              required
            />
          </div>
          <FormField label="Objetivo principal" name="objetivo_principal" defaultValue={student?.objetivo_principal} />
          <TextAreaField label="Observacoes medicas" name="observacoes_medicas" defaultValue={student?.observacoes_medicas} />
          <DialogFooter>
            <SubmitButton isPending={isPending}>Salvar</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
