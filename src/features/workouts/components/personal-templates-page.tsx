"use client";

import { Archive, ClipboardList, Edit, Play, Plus, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
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
import { PageHeader } from "@/components/shared/page-header";
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
import { usePersonalStudents } from "@/features/accounts/hooks/use-personal-students";
import type { PersonalStudent } from "@/features/accounts/types/accounts.types";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import { formBoolean, formText } from "@/lib/form-data";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  applyTemplateSchema,
  workoutTemplateSchema,
  type WorkoutItemForm,
} from "@/features/workouts/schemas/workouts.schemas";
import {
  toApplyTemplatePayload,
  toWorkoutTemplatePayload,
  toWorkoutTemplateUpdatePayload,
} from "@/features/workouts/mappers/workouts.mappers";
import {
  useAdminExercises,
  useApplyWorkoutTemplate,
  useArchiveWorkoutTemplate,
  useCreateWorkoutTemplate,
  useExerciseCategories,
  useUpdateWorkoutTemplate,
  useWorkoutTemplates,
} from "@/features/workouts/hooks/use-admin-exercises";
import type { Exercise, ExerciseCategory, WorkoutTemplate, WorkoutTemplatesParams } from "@/features/workouts/types/workouts.types";
import { createEmptyWorkoutItem, WorkoutItemsEditor } from "@/features/workouts/components/workout-items-editor";

const dayOptions = [
  { value: "", label: "Sem dia fixo" },
  { value: "SEGUNDA", label: "Segunda-feira" },
  { value: "TERCA", label: "Terca-feira" },
  { value: "QUARTA", label: "Quarta-feira" },
  { value: "QUINTA", label: "Quinta-feira" },
  { value: "SEXTA", label: "Sexta-feira" },
  { value: "SABADO", label: "Sabado" },
  { value: "DOMINGO", label: "Domingo" },
];

export function PersonalTemplatesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState<WorkoutTemplate | null>(null);
  const [items, setItems] = useState<WorkoutItemForm[]>([createEmptyWorkoutItem()]);

  const params = useMemo<WorkoutTemplatesParams>(
    () => ({
      page,
      search: search || undefined,
      ativo: true,
    }),
    [page, search],
  );

  const templatesQuery = useWorkoutTemplates(params);
  const exercisesQuery = useAdminExercises({ ativo: true, status: "APROVADO" });
  const categoriesQuery = useExerciseCategories({ ativo: true });
  const studentsQuery = usePersonalStudents();
  const createMutation = useCreateWorkoutTemplate();
  const updateMutation = useUpdateWorkoutTemplate();
  const archiveMutation = useArchiveWorkoutTemplate();
  const applyMutation = useApplyWorkoutTemplate();
  const exercises = exercisesQuery.data?.results ?? [];
  const categories = categoriesQuery.data?.results ?? [];
  const students = studentsQuery.data?.results ?? [];

  function openCreateDialog() {
    setItems([createEmptyWorkoutItem()]);
    setCreateOpen(true);
  }

  function openEditDialog(template: WorkoutTemplate) {
    setItems(
      template.itens?.map((item) => ({
        exercicio_id: item.exercicio.id,
        series: item.series,
        repeticoes: item.repeticoes,
        descanso_segundos: item.descanso_segundos,
        ordem_execucao: item.ordem_execucao,
      })) ?? [createEmptyWorkoutItem()],
    );
    setEditingTemplate(template);
  }

  function parseTemplateForm(formData: FormData) {
    return workoutTemplateSchema.safeParse({
      titulo: formText(formData, "titulo"),
      descricao: formText(formData, "descricao") || undefined,
      ativo: formBoolean(formData, "ativo"),
      itens: items,
    });
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseTemplateForm(new FormData(event.currentTarget));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    createMutation.mutate(toWorkoutTemplatePayload(parsed.data), {
      onSuccess: () => {
        toast.success("Template criado.");
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTemplate) return;
    const parsed = parseTemplateForm(new FormData(event.currentTarget));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    updateMutation.mutate(
      { id: editingTemplate.id, payload: toWorkoutTemplateUpdatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Template atualizado.");
          setEditingTemplate(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleArchive(template: WorkoutTemplate) {
    archiveMutation.mutate(template.id, {
      onSuccess: () => toast.success("Template arquivado."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!applyingTemplate) return;
    const formData = new FormData(event.currentTarget);
    const parsed = applyTemplateSchema.safeParse({
      aluno_id: formText(formData, "aluno_id"),
      titulo: formText(formData, "titulo") || undefined,
      dia_da_semana: formText(formData, "dia_da_semana") || undefined,
      data_inicio: formText(formData, "data_inicio") || undefined,
      data_vencimento: formText(formData, "data_vencimento") || undefined,
      ativo: formBoolean(formData, "ativo"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    applyMutation.mutate(
      { id: applyingTemplate.id, payload: toApplyTemplatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Template aplicado ao aluno.");
          setApplyingTemplate(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Modelos reutilizaveis para aplicar fichas com agilidade."
        action={
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="size-4" aria-hidden="true" />
            Novo template
          </Button>
        }
      />

      <SummaryChips
        items={[
          { label: "Templates", value: templatesQuery.data?.count ?? 0 },
          { label: "Exercicios", value: exercisesQuery.data?.count ?? 0 },
          { label: "Categorias", value: categoriesQuery.data?.count ?? 0 },
        ]}
      />

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="pl-9"
          placeholder="Buscar template"
        />
      </div>

      {templatesQuery.isLoading ? <LoadingPanel /> : null}
      {templatesQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(templatesQuery.error, "Nao foi possivel carregar templates.")} />
      ) : null}
      {templatesQuery.data?.results.length === 0 ? (
        <EmptyPanel icon={ClipboardList} title="Nenhum template ativo" description="Crie modelos para aplicar treinos mais rapido." />
      ) : null}

      {templatesQuery.data && templatesQuery.data.results.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criacao</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templatesQuery.data.results.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{template.titulo}</div>
                    <div className="max-w-lg truncate text-xs text-muted-foreground">
                      {template.descricao || "Sem descricao"}
                    </div>
                  </TableCell>
                  <TableCell>{template.itens?.length ?? 0}</TableCell>
                  <TableCell>
                    <StatusBadge active={template.ativo} />
                  </TableCell>
                  <TableCell>{formatDate(template.data_criacao)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setApplyingTemplate(template)}>
                        <Play className="size-3.5" aria-hidden="true" />
                        Aplicar
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                        <Edit className="size-3.5" aria-hidden="true" />
                        Editar
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleArchive(template)}>
                        <Archive className="size-3.5" aria-hidden="true" />
                        Arquivar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {templatesQuery.data ? (
        <PaginationFooter
          count={templatesQuery.data.count}
          page={page}
          hasPrevious={Boolean(templatesQuery.data.previous)}
          hasNext={Boolean(templatesQuery.data.next)}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      ) : null}

      <TemplateDialog
        open={createOpen}
        title="Novo template"
        description="Monte a sequencia de exercicios do modelo."
        items={items}
        exercises={exercises}
        categories={categories}
        isPending={createMutation.isPending}
        onItemsChange={setItems}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <TemplateDialog
        open={Boolean(editingTemplate)}
        title="Editar template"
        description="Atualize a prescricao do modelo."
        template={editingTemplate}
        items={items}
        exercises={exercises}
        categories={categories}
        isPending={updateMutation.isPending}
        onItemsChange={setItems}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        onSubmit={handleEdit}
      />

      <ApplyTemplateDialog
        open={Boolean(applyingTemplate)}
        template={applyingTemplate}
        students={students}
        isPending={applyMutation.isPending}
        onOpenChange={(open) => !open && setApplyingTemplate(null)}
        onSubmit={handleApply}
      />
    </div>
  );
}

function TemplateDialog({
  open,
  title,
  description,
  template,
  items,
  exercises,
  categories,
  isPending,
  onItemsChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  template?: WorkoutTemplate | null;
  items: WorkoutItemForm[];
  exercises: Exercise[];
  categories: ExerciseCategory[];
  isPending?: boolean;
  onItemsChange: (items: WorkoutItemForm[]) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <FormField label="Titulo" name="titulo" defaultValue={template?.titulo} required />
            <div className="flex items-end">
              <label className="flex h-8 items-center gap-2 text-sm text-foreground">
                <input name="ativo" type="checkbox" defaultChecked={template?.ativo ?? true} />
                Template ativo
              </label>
            </div>
            <div className="sm:col-span-2">
              <TextAreaField label="Descricao" name="descricao" defaultValue={template?.descricao} />
            </div>
          </div>

          <WorkoutItemsEditor items={items} exercises={exercises} categories={categories} onChange={onItemsChange} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <SubmitButton isPending={isPending}>Salvar</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ApplyTemplateDialog({
  open,
  template,
  students,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  template?: WorkoutTemplate | null;
  students: PersonalStudent[];
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aplicar template</DialogTitle>
          <DialogDescription>{template?.titulo ?? "Selecione aluno e periodo da ficha."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Aluno</span>
              <select name="aluno_id" required className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm">
                <option value="">Selecione</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.usuario.nome}
                  </option>
                ))}
              </select>
            </label>
            <FormField label="Titulo da ficha" name="titulo" defaultValue={template?.titulo} />
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Dia da semana</span>
              <select name="dia_da_semana" className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm">
                {dayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <FormField label="Inicio" name="data_inicio" type="date" />
            <FormField label="Vencimento" name="data_vencimento" type="date" />
            <div className="flex items-end">
              <label className="flex h-8 items-center gap-2 text-sm text-foreground">
                <input name="ativo" type="checkbox" defaultChecked />
                Ativar ficha
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <SubmitButton isPending={isPending}>Aplicar</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
