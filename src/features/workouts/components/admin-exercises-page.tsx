"use client";

import { Archive, CheckCircle2, Dumbbell, Edit, ImageIcon, Plus, Search, Tags, XCircle } from "lucide-react";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exerciseCategorySchema, exerciseSchema } from "@/features/workouts/schemas/workouts.schemas";
import {
  useAdminExercises,
  useApproveExercise,
  useApproveExercises,
  useArchiveExerciseCategory,
  useArchiveExercise,
  useCreateExerciseCategory,
  useCreateExercise,
  useExerciseCategories,
  useRejectExercise,
  useRejectExercises,
  useUpdateExerciseCategory,
  useUpdateExercise,
} from "@/features/workouts/hooks/use-admin-exercises";
import {
  toExerciseCategoryPayload,
  toExerciseCategoryUpdatePayload,
  toExercisePayload,
  toExerciseUpdatePayload,
} from "@/features/workouts/mappers/workouts.mappers";
import type { Exercise, ExerciseCategory, ExerciseStatus, ExercisesParams } from "@/features/workouts/types/workouts.types";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formBoolean, formText } from "@/lib/form-data";

type CatalogTab = "PENDENTES" | "APROVADOS" | "REJEITADOS" | "ARQUIVADOS";
type CatalogSection = "EXERCICIOS" | "CATEGORIAS";
type ExerciseQueryParams = NonNullable<ExercisesParams>;

const sectionLabels: Record<CatalogSection, string> = {
  EXERCICIOS: "Exercicios",
  CATEGORIAS: "Categorias",
};

const tabLabels: Record<CatalogTab, string> = {
  PENDENTES: "Pendentes",
  APROVADOS: "Aprovados",
  REJEITADOS: "Rejeitados",
  ARQUIVADOS: "Arquivados",
};

function getTabParams(tab: CatalogTab): Pick<ExerciseQueryParams, "status" | "ativo"> {
  if (tab === "PENDENTES") return { status: "PENDENTE" };
  if (tab === "REJEITADOS") return { status: "REJEITADO" };
  if (tab === "ARQUIVADOS") return { status: "APROVADO", ativo: false };
  return { status: "APROVADO", ativo: true };
}

export function AdminExercisesPage() {
  const [section, setSection] = useState<CatalogSection>("EXERCICIOS");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<CatalogTab>("PENDENTES");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExerciseCategory | null>(null);

  const params = useMemo<ExercisesParams>(
    () => ({
      page,
      search: search || undefined,
      categoria_id: categoryFilter || undefined,
      ...getTabParams(tab),
    }),
    [categoryFilter, page, search, tab],
  );

  const categoryParams = useMemo(
    () => ({
      page: categoryPage,
      search: categorySearch || undefined,
    }),
    [categoryPage, categorySearch],
  );

  const exercisesQuery = useAdminExercises(params);
  const categoriesQuery = useExerciseCategories(categoryParams);
  const categoryOptionsQuery = useExerciseCategories({ ativo: true });
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const archiveMutation = useArchiveExercise();
  const approveMutation = useApproveExercise();
  const rejectMutation = useRejectExercise();
  const approveBulkMutation = useApproveExercises();
  const rejectBulkMutation = useRejectExercises();
  const createCategoryMutation = useCreateExerciseCategory();
  const updateCategoryMutation = useUpdateExerciseCategory();
  const archiveCategoryMutation = useArchiveExerciseCategory();
  const visibleExercises = exercisesQuery.data?.results ?? [];
  const categories = useMemo(() => categoriesQuery.data?.results ?? [], [categoriesQuery.data?.results]);
  const categoryOptions = useMemo(() => categoryOptionsQuery.data?.results ?? [], [categoryOptionsQuery.data?.results]);
  const exerciseCategoryOptions = useMemo(
    () =>
      categoryOptions
        .filter((category) => category.ativo || category.id === editingExercise?.categoria_id)
        .map((category) => ({
          value: category.id,
          label: category.ativo ? category.nome : `${category.nome} (inativa)`,
        })),
    [categoryOptions, editingExercise?.categoria_id],
  );
  const selectedCategoryLabel = categoryOptions.find((category) => category.id === categoryFilter)?.nome ?? "Todas";
  const allVisibleSelected = visibleExercises.length > 0 && visibleExercises.every((exercise) => selectedIds.includes(exercise.id));
  const isMutating =
    archiveMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    approveBulkMutation.isPending ||
    rejectBulkMutation.isPending ||
    updateMutation.isPending;
  const isCategoryMutating =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    archiveCategoryMutation.isPending;

  function parseExerciseForm(formData: FormData) {
    return exerciseSchema.safeParse({
      nome: formText(formData, "nome"),
      categoria_id: formText(formData, "categoria_id"),
      instrucoes_gerais: formText(formData, "instrucoes_gerais") || undefined,
      ativo: formBoolean(formData, "ativo"),
    });
  }

  function parseCategoryForm(formData: FormData) {
    return exerciseCategorySchema.safeParse({
      nome: formText(formData, "nome"),
      ordem: formText(formData, "ordem") || 0,
      ativo: formBoolean(formData, "ativo"),
    });
  }

  function resetSelection() {
    setSelectedIds([]);
  }

  function handleTabChange(value: string) {
    setTab(value as CatalogTab);
    setPage(1);
    resetSelection();
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseExerciseForm(new FormData(event.currentTarget));

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    createMutation.mutate(toExercisePayload(parsed.data), {
      onSuccess: () => {
        toast.success("Exercicio criado.");
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingExercise) return;

    const parsed = parseExerciseForm(new FormData(event.currentTarget));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    updateMutation.mutate(
      { id: editingExercise.id, payload: toExerciseUpdatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Exercicio atualizado.");
          setEditingExercise(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function toggleExercise(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  }

  function toggleVisible() {
    setSelectedIds(allVisibleSelected ? [] : visibleExercises.map((exercise) => exercise.id));
  }

  function handleApprove(exercise: Exercise) {
    approveMutation.mutate(exercise.id, {
      onSuccess: () => toast.success("Exercicio aprovado."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleReject(exercise: Exercise) {
    rejectMutation.mutate(exercise.id, {
      onSuccess: () => toast.success("Exercicio rejeitado."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleArchive(exercise: Exercise) {
    archiveMutation.mutate(exercise.id, {
      onSuccess: () => toast.success("Exercicio arquivado."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleBulk(action: "approve" | "reject") {
    const mutation = action === "approve" ? approveBulkMutation : rejectBulkMutation;
    mutation.mutate(
      { ids: selectedIds },
      {
        onSuccess: (result) => {
          toast.success(`${result.updated} exercicio(s) atualizados.`);
          resetSelection();
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseCategoryForm(new FormData(event.currentTarget));

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    createCategoryMutation.mutate(toExerciseCategoryPayload(parsed.data), {
      onSuccess: () => {
        toast.success("Categoria criada.");
        setCreateCategoryOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleEditCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCategory) return;

    const parsed = parseCategoryForm(new FormData(event.currentTarget));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    updateCategoryMutation.mutate(
      { id: editingCategory.id, payload: toExerciseCategoryUpdatePayload(parsed.data) },
      {
        onSuccess: () => {
          toast.success("Categoria atualizada.");
          setEditingCategory(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleArchiveCategory(category: ExerciseCategory) {
    archiveCategoryMutation.mutate(category.id, {
      onSuccess: () => toast.success("Categoria arquivada."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Exercicios"
        description="Curadoria da base global usada por personais e alunos."
        action={
          section === "EXERCICIOS" ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Novo exercicio
            </Button>
          ) : (
            <Button type="button" onClick={() => setCreateCategoryOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Nova categoria
            </Button>
          )
        }
      />

      <Tabs value={section} onValueChange={(value) => setSection(value as CatalogSection)}>
        <TabsList className="flex-wrap">
          {(Object.keys(sectionLabels) as CatalogSection[]).map((sectionKey) => (
            <TabsTrigger key={sectionKey} value={sectionKey}>
              {sectionLabels[sectionKey]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SummaryChips
        items={
          section === "EXERCICIOS"
            ? [
                { label: "Resultado", value: exercisesQuery.data?.count ?? 0 },
                { label: "Visao", value: tabLabels[tab] },
                { label: "Categoria", value: selectedCategoryLabel },
                { label: "Selecionados", value: selectedIds.length },
              ]
            : [
                { label: "Categorias", value: categoriesQuery.data?.count ?? 0 },
                { label: "Filtro", value: categorySearch || "Todas" },
              ]
        }
      />

      {section === "EXERCICIOS" ? (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="flex-wrap">
            {(Object.keys(tabLabels) as CatalogTab[]).map((tabKey) => (
              <TabsTrigger key={tabKey} value={tabKey}>
                {tabLabels[tabKey]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setPage(1);
              resetSelection();
            }}
            className="h-9 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm text-foreground sm:w-56"
          >
            <option value="">Todas as categorias</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nome}
              </option>
            ))}
          </select>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                resetSelection();
              }}
              className="pl-9"
              placeholder="Buscar exercicio"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0 || isMutating}
              onClick={() => handleBulk("approve")}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Aprovar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0 || isMutating}
              onClick={() => handleBulk("reject")}
            >
              <XCircle className="size-4" aria-hidden="true" />
              Rejeitar
            </Button>
          </div>
        </div>
        </div>
      ) : (
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={categorySearch}
            onChange={(event) => {
              setCategorySearch(event.target.value);
              setCategoryPage(1);
            }}
            className="pl-9"
            placeholder="Buscar categoria"
          />
        </div>
      )}

      {section === "EXERCICIOS" ? (
        <>
          {exercisesQuery.isLoading ? <LoadingPanel /> : null}
          {exercisesQuery.isError ? (
            <ErrorPanel description={getApiErrorMessage(exercisesQuery.error, "Nao foi possivel carregar exercicios.")} />
          ) : null}
          {exercisesQuery.data?.results.length === 0 ? (
            <EmptyPanel
              icon={Dumbbell}
              title="Nenhum exercicio encontrado"
              description="Importe exercicios do wger ou ajuste a busca para revisar a base."
            />
          ) : null}

          {visibleExercises.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleVisible}
                        aria-label="Selecionar exercicios visiveis"
                      />
                    </TableHead>
                    <TableHead>Exercicio</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Criacao</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleExercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(exercise.id)}
                          onChange={() => toggleExercise(exercise.id)}
                          aria-label={`Selecionar ${exercise.nome}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <ExerciseMedia exercise={exercise} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">{exercise.nome}</div>
                            <div className="max-w-md truncate text-xs text-muted-foreground">
                              {exercise.instrucoes_gerais || "Sem instrucoes"}
                            </div>
                            <SourceLine exercise={exercise} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getExerciseCategoryName(exercise)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <CatalogStatusBadge status={exercise.status} />
                          <StatusBadge active={exercise.ativo} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{exercise.origem}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(exercise.data_criacao)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditingExercise(exercise)}>
                            <Edit className="size-3.5" aria-hidden="true" />
                            Editar
                          </Button>
                          {exercise.status !== "APROVADO" || !exercise.ativo ? (
                            <Button type="button" variant="outline" size="sm" disabled={isMutating} onClick={() => handleApprove(exercise)}>
                              <CheckCircle2 className="size-3.5" aria-hidden="true" />
                              Aprovar
                            </Button>
                          ) : null}
                          {exercise.status !== "REJEITADO" ? (
                            <Button type="button" variant="outline" size="sm" disabled={isMutating} onClick={() => handleReject(exercise)}>
                              <XCircle className="size-3.5" aria-hidden="true" />
                              Rejeitar
                            </Button>
                          ) : null}
                          {exercise.ativo ? (
                            <Button type="button" variant="destructive" size="sm" disabled={isMutating} onClick={() => handleArchive(exercise)}>
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

          {exercisesQuery.data ? (
            <PaginationFooter
              count={exercisesQuery.data.count}
              page={page}
              hasPrevious={Boolean(exercisesQuery.data.previous)}
              hasNext={Boolean(exercisesQuery.data.next)}
              onPrevious={() => {
                setPage((current) => Math.max(1, current - 1));
                resetSelection();
              }}
              onNext={() => {
                setPage((current) => current + 1);
                resetSelection();
              }}
            />
          ) : null}
        </>
      ) : (
        <>
          {categoriesQuery.isLoading ? <LoadingPanel /> : null}
          {categoriesQuery.isError ? (
            <ErrorPanel description={getApiErrorMessage(categoriesQuery.error, "Nao foi possivel carregar categorias.")} />
          ) : null}
          {categoriesQuery.data?.results.length === 0 ? (
            <EmptyPanel
              icon={Tags}
              title="Nenhuma categoria encontrada"
              description="Crie categorias para organizar os exercicios importados e manuais."
            />
          ) : null}

          {categories.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criacao</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{category.nome}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>{category.ordem ?? 0}</TableCell>
                      <TableCell>
                        <StatusBadge active={category.ativo} />
                      </TableCell>
                      <TableCell>{formatDate(category.data_criacao)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                            <Edit className="size-3.5" aria-hidden="true" />
                            Editar
                          </Button>
                          {category.ativo ? (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={isCategoryMutating}
                              onClick={() => handleArchiveCategory(category)}
                            >
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

          {categoriesQuery.data ? (
            <PaginationFooter
              count={categoriesQuery.data.count}
              page={categoryPage}
              hasPrevious={Boolean(categoriesQuery.data.previous)}
              hasNext={Boolean(categoriesQuery.data.next)}
              onPrevious={() => setCategoryPage((current) => Math.max(1, current - 1))}
              onNext={() => setCategoryPage((current) => current + 1)}
            />
          ) : null}
        </>
      )}

      <ExerciseDialog
        open={createOpen}
        title="Novo exercicio"
        description="Cadastre um exercicio manual sem midia externa."
        categoryOptions={exerciseCategoryOptions}
        isPending={createMutation.isPending}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <ExerciseDialog
        open={Boolean(editingExercise)}
        title="Editar exercicio"
        description="Atualize os dados revisados do exercicio."
        exercise={editingExercise}
        categoryOptions={exerciseCategoryOptions}
        isPending={updateMutation.isPending}
        onOpenChange={(open) => !open && setEditingExercise(null)}
        onSubmit={handleEdit}
      />

      <CategoryDialog
        open={createCategoryOpen}
        title="Nova categoria"
        description="Organize exercicios por grupo muscular para melhorar filtros e montagem de treinos."
        isPending={createCategoryMutation.isPending}
        onOpenChange={setCreateCategoryOpen}
        onSubmit={handleCreateCategory}
      />

      <CategoryDialog
        open={Boolean(editingCategory)}
        title="Editar categoria"
        description="Ajuste nome, ordem e disponibilidade da categoria."
        category={editingCategory}
        isPending={updateCategoryMutation.isPending}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSubmit={handleEditCategory}
      />
    </div>
  );
}

function ExerciseMedia({ exercise }: { exercise: Exercise }) {
  if (!exercise.url_animacao) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
        <ImageIcon className="size-5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <Image
      src={exercise.url_animacao}
      alt={exercise.nome}
      width={48}
      height={48}
      className="size-12 shrink-0 rounded-lg border border-border object-cover"
    />
  );
}

function SourceLine({ exercise }: { exercise: Exercise }) {
  if (exercise.origem !== "WGER") {
    return <div className="text-xs text-muted-foreground">Manual</div>;
  }

  return (
    <div className="truncate text-xs text-muted-foreground">
      {exercise.licenca_nome || "wger"} {exercise.licenca_autor ? `· ${exercise.licenca_autor}` : ""}
    </div>
  );
}

function CatalogStatusBadge({ status }: { status?: ExerciseStatus }) {
  if (status === "PENDENTE") {
    return <Badge className="w-fit bg-[#F59E0B]/10 text-[#B45309] hover:bg-[#F59E0B]/10">Pendente</Badge>;
  }
  if (status === "REJEITADO") {
    return <Badge className="w-fit bg-destructive/10 text-destructive hover:bg-destructive/10">Rejeitado</Badge>;
  }
  return <Badge className="w-fit bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/10">Aprovado</Badge>;
}

function getExerciseCategoryName(exercise: Exercise) {
  return exercise.categoria_nome || exercise.grupo_muscular || "Sem categoria";
}

function ExerciseDialog({
  open,
  title,
  description,
  exercise,
  categoryOptions,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  exercise?: Exercise | null;
  categoryOptions: { value: string; label: string }[];
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome" name="nome" defaultValue={exercise?.nome} required />
            <NativeSelectField
              label="Categoria"
              name="categoria_id"
              defaultValue={exercise?.categoria_id}
              options={categoryOptions}
              required
            />
            <div className="flex items-end">
              <label className="flex h-8 items-center gap-2 text-sm text-foreground">
                <input name="ativo" type="checkbox" defaultChecked={exercise?.ativo ?? true} />
                Exercicio ativo
              </label>
            </div>
            {exercise?.url_animacao ? (
              <div className="flex items-end text-xs text-muted-foreground">Midia importada somente leitura.</div>
            ) : null}
            <div className="sm:col-span-2">
              <TextAreaField label="Instrucoes gerais" name="instrucoes_gerais" defaultValue={exercise?.instrucoes_gerais} />
            </div>
          </div>
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

function CategoryDialog({
  open,
  title,
  description,
  category,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  category?: ExerciseCategory | null;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <FormField label="Nome" name="nome" defaultValue={category?.nome} required />
            <FormField label="Ordem" name="ordem" type="number" defaultValue={category?.ordem ?? 0} required />
            <div className="flex items-end sm:col-span-2">
              <label className="flex h-8 items-center gap-2 text-sm text-foreground">
                <input name="ativo" type="checkbox" defaultChecked={category?.ativo ?? true} />
                Categoria ativa
              </label>
            </div>
          </div>
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
