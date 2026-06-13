"use client";

import { Archive, CheckCircle2, Dumbbell, Edit, Plus, Send } from "lucide-react";
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
import { getApiErrorMessage } from "@/lib/api/errors";
import { formBoolean, formText } from "@/lib/form-data";
import {
  applyTemplateSchema,
  workoutSchema,
  type WorkoutItemForm,
} from "@/features/workouts/schemas/workouts.schemas";
import {
  toApplyTemplatePayload,
  toWorkoutPayload,
  toWorkoutUpdatePayload,
} from "@/features/workouts/mappers/workouts.mappers";
import {
  useActivateWorkout,
  useAdminExercises,
  useApplyWorkoutTemplate,
  useArchiveWorkout,
  useCreateWorkout,
  useExerciseCategories,
  useUpdateWorkout,
  useWorkouts,
  useWorkoutTemplates,
} from "@/features/workouts/hooks/use-admin-exercises";
import type { Exercise, ExerciseCategory, Workout, WorkoutsParams, WorkoutTemplate } from "@/features/workouts/types/workouts.types";
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

type ActiveFilter = "ATIVOS" | "ARQUIVADOS" | "TODOS";

export function PersonalWorkoutsPage() {
  const [page, setPage] = useState(1);
  const [studentFilter, setStudentFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ATIVOS");
  const [createOpen, setCreateOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [items, setItems] = useState<WorkoutItemForm[]>([createEmptyWorkoutItem()]);

  const params = useMemo<WorkoutsParams>(
    () => ({
      page,
      aluno_id: studentFilter || undefined,
      ativo: activeFilter === "TODOS" ? undefined : activeFilter === "ATIVOS",
    }),
    [page, studentFilter, activeFilter],
  );

  const workoutsQuery = useWorkouts(params);
  const exercisesQuery = useAdminExercises({ ativo: true, status: "APROVADO" });
  const categoriesQuery = useExerciseCategories({ ativo: true });
  const studentsQuery = usePersonalStudents();
  const templatesQuery = useWorkoutTemplates({ ativo: true });
  const createMutation = useCreateWorkout();
  const updateMutation = useUpdateWorkout();
  const archiveMutation = useArchiveWorkout();
  const activateMutation = useActivateWorkout();
  const applyMutation = useApplyWorkoutTemplate();
  const exercises = exercisesQuery.data?.results ?? [];
  const categories = categoriesQuery.data?.results ?? [];
  const students = studentsQuery.data?.results ?? [];
  const templates = templatesQuery.data?.results ?? [];

  function openCreateDialog() {
    setItems([createEmptyWorkoutItem()]);
    setCreateOpen(true);
  }

  function openEditDialog(workout: Workout) {
    setItems(
      workout.itens?.map((item) => ({
        exercicio_id: item.exercicio.id,
        series: item.series,
        repeticoes: item.repeticoes,
        descanso_segundos: item.descanso_segundos,
        ordem_execucao: item.ordem_execucao,
      })) ?? [createEmptyWorkoutItem()],
    );
    setEditingWorkout(workout);
  }

  function parseWorkoutForm(formData: FormData, fallbackStudentId?: string) {
    return workoutSchema.safeParse({
      aluno_id: formText(formData, "aluno_id") || fallbackStudentId || "",
      titulo: formText(formData, "titulo"),
      dia_da_semana: formText(formData, "dia_da_semana") || undefined,
      data_inicio: formText(formData, "data_inicio"),
      data_vencimento: formText(formData, "data_vencimento") || undefined,
      ativo: formBoolean(formData, "ativo"),
      itens: items,
    });
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseWorkoutForm(new FormData(event.currentTarget));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    createMutation.mutate(toWorkoutPayload(parsed.data), {
      onSuccess: () => {
        toast.success("Treino criado.");
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingWorkout) return;
    const parsed = parseWorkoutForm(new FormData(event.currentTarget), editingWorkout.aluno_id);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    updateMutation.mutate(
      { id: editingWorkout.id, payload: toWorkoutUpdatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Treino atualizado.");
          setEditingWorkout(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleActivate(workout: Workout) {
    activateMutation.mutate(workout.id, {
      onSuccess: () => toast.success("Treino ativado."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleArchive(workout: Workout) {
    archiveMutation.mutate(workout.id, {
      onSuccess: () => toast.success("Treino arquivado."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleApplyTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const templateId = formText(formData, "template_id");
    const parsed = applyTemplateSchema.safeParse({
      aluno_id: formText(formData, "aluno_id"),
      titulo: formText(formData, "titulo") || undefined,
      dia_da_semana: formText(formData, "dia_da_semana") || undefined,
      data_inicio: formText(formData, "data_inicio") || undefined,
      data_vencimento: formText(formData, "data_vencimento") || undefined,
      ativo: formBoolean(formData, "ativo"),
    });
    if (!templateId) {
      toast.error("Selecione um template.");
      return;
    }
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    applyMutation.mutate(
      { id: templateId, payload: toApplyTemplatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Template aplicado.");
          setApplyOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treinos"
        description="Fichas aplicadas aos seus alunos, com controle de vigencia e ativacao."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setApplyOpen(true)}>
              <Send className="size-4" aria-hidden="true" />
              Aplicar template
            </Button>
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="size-4" aria-hidden="true" />
              Novo treino
            </Button>
          </div>
        }
      />

      <SummaryChips
        items={[
          { label: "Treinos", value: workoutsQuery.data?.count ?? 0 },
          { label: "Alunos", value: studentsQuery.data?.count ?? 0 },
          { label: "Categorias", value: categoriesQuery.data?.count ?? 0 },
        ]}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Aluno</span>
          <select
            value={studentFilter}
            onChange={(event) => {
              setStudentFilter(event.target.value);
              setPage(1);
            }}
            className="h-8 w-full min-w-64 rounded-lg border border-input bg-input/30 px-2.5 text-sm"
          >
            <option value="">Todos os alunos</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.usuario.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Status</span>
          <select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value as ActiveFilter);
              setPage(1);
            }}
            className="h-8 w-full min-w-44 rounded-lg border border-input bg-input/30 px-2.5 text-sm"
          >
            <option value="ATIVOS">Ativos</option>
            <option value="ARQUIVADOS">Arquivados</option>
            <option value="TODOS">Todos</option>
          </select>
        </label>
      </div>

      {workoutsQuery.isLoading ? <LoadingPanel /> : null}
      {workoutsQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(workoutsQuery.error, "Nao foi possivel carregar treinos.")} />
      ) : null}
      {workoutsQuery.data?.results.length === 0 ? (
        <EmptyPanel icon={Dumbbell} title="Nenhum treino encontrado" description="Crie uma ficha ou aplique um template para um aluno." />
      ) : null}

      {workoutsQuery.data && workoutsQuery.data.results.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treino</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workoutsQuery.data.results.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{workout.titulo}</div>
                    <div className="text-xs text-muted-foreground">{formatDay(workout.dia_da_semana)}</div>
                  </TableCell>
                  <TableCell>{workout.aluno_nome}</TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(workout.data_inicio)}</div>
                    <div className="text-xs text-muted-foreground">{workout.data_vencimento ? formatDate(workout.data_vencimento) : "Sem vencimento"}</div>
                  </TableCell>
                  <TableCell>{workout.itens?.length ?? 0}</TableCell>
                  <TableCell>
                    <StatusBadge active={workout.ativo} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(workout)}>
                        <Edit className="size-3.5" aria-hidden="true" />
                        Editar
                      </Button>
                      {!workout.ativo ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => handleActivate(workout)}>
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          Ativar
                        </Button>
                      ) : null}
                      {workout.ativo ? (
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleArchive(workout)}>
                          <Archive className="size-3.5" aria-hidden="true" />
                          Arquivar
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {workoutsQuery.data ? (
        <PaginationFooter
          count={workoutsQuery.data.count}
          page={page}
          hasPrevious={Boolean(workoutsQuery.data.previous)}
          hasNext={Boolean(workoutsQuery.data.next)}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      ) : null}

      <WorkoutDialog
        open={createOpen}
        title="Novo treino"
        description="Crie uma ficha do zero para um aluno."
        students={students}
        exercises={exercises}
        categories={categories}
        items={items}
        isPending={createMutation.isPending}
        onItemsChange={setItems}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <WorkoutDialog
        open={Boolean(editingWorkout)}
        title="Editar treino"
        description="Atualize os parametros da ficha."
        workout={editingWorkout}
        students={students}
        exercises={exercises}
        categories={categories}
        items={items}
        isPending={updateMutation.isPending}
        onItemsChange={setItems}
        onOpenChange={(open) => !open && setEditingWorkout(null)}
        onSubmit={handleEdit}
      />

      <ApplyTemplateDialog
        open={applyOpen}
        templates={templates}
        students={students}
        isPending={applyMutation.isPending}
        onOpenChange={setApplyOpen}
        onSubmit={handleApplyTemplate}
      />
    </div>
  );
}

function WorkoutDialog({
  open,
  title,
  description,
  workout,
  students,
  exercises,
  categories,
  items,
  isPending,
  onItemsChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  workout?: Workout | null;
  students: PersonalStudent[];
  exercises: Exercise[];
  categories: ExerciseCategory[];
  items: WorkoutItemForm[];
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Aluno</span>
              <select
                name="aluno_id"
                defaultValue={workout?.aluno_id ?? ""}
                disabled={Boolean(workout)}
                required={!workout}
                className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
              >
                <option value="">Selecione</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.usuario.nome}
                  </option>
                ))}
              </select>
            </label>
            <FormField label="Titulo" name="titulo" defaultValue={workout?.titulo} required />
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Dia da semana</span>
              <select
                name="dia_da_semana"
                defaultValue={workout?.dia_da_semana ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
              >
                {dayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <FormField label="Inicio" name="data_inicio" type="date" defaultValue={workout?.data_inicio} required />
            <FormField label="Vencimento" name="data_vencimento" type="date" defaultValue={workout?.data_vencimento} />
            <div className="flex items-end">
              <label className="flex h-8 items-center gap-2 text-sm text-foreground">
                <input name="ativo" type="checkbox" defaultChecked={workout?.ativo ?? true} />
                Treino ativo
              </label>
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
  templates,
  students,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  templates: WorkoutTemplate[];
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
          <DialogDescription>Copie um modelo para criar uma ficha real do aluno.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Template</span>
              <select name="template_id" required className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm">
                <option value="">Selecione</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.titulo}
                  </option>
                ))}
              </select>
            </label>
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
            <FormField label="Titulo da ficha" name="titulo" />
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

function formatDay(value?: string) {
  return dayOptions.find((option) => option.value === value)?.label ?? "Sem dia fixo";
}
