"use client";

import { Dumbbell, ImageIcon, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { EmptyPanel, ErrorPanel, LoadingPanel, PaginationFooter, SummaryChips } from "@/components/shared/admin-screen";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminExercises, useExerciseCategories } from "@/features/workouts/hooks/use-admin-exercises";
import type { Exercise, ExercisesParams } from "@/features/workouts/types/workouts.types";
import { getApiErrorMessage } from "@/lib/api/errors";

export function PersonalExercisesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const params = useMemo<ExercisesParams>(
    () => ({
      page,
      search: search || undefined,
      categoria_id: categoryFilter || undefined,
      ativo: true,
      status: "APROVADO",
    }),
    [categoryFilter, page, search],
  );

  const exercisesQuery = useAdminExercises(params);
  const categoriesQuery = useExerciseCategories({ ativo: true });
  const categories = categoriesQuery.data?.results ?? [];
  const selectedCategoryLabel = categories.find((category) => category.id === categoryFilter)?.nome ?? "Todas";

  return (
    <div className="space-y-6">
      <PageHeader title="Exercicios" description="Catalogo aprovado para montar templates e fichas de treino." />

      <SummaryChips
        items={[
          { label: "Disponiveis", value: exercisesQuery.data?.count ?? 0 },
          { label: "Uso", value: "Somente leitura" },
          { label: "Categoria", value: selectedCategoryLabel },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={categoryFilter}
          onChange={(event) => {
            setCategoryFilter(event.target.value);
            setPage(1);
          }}
          className="h-9 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm text-foreground sm:w-56"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nome}
            </option>
          ))}
        </select>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
            placeholder="Buscar exercicio"
          />
        </div>
      </div>

      {exercisesQuery.isLoading ? <LoadingPanel /> : null}
      {exercisesQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(exercisesQuery.error, "Nao foi possivel carregar exercicios.")} />
      ) : null}
      {exercisesQuery.data?.results.length === 0 ? (
        <EmptyPanel icon={Dumbbell} title="Nenhum exercicio aprovado" description="A base aprovada pelo admin aparecera aqui." />
      ) : null}

      {exercisesQuery.data && exercisesQuery.data.results.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercicio</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercisesQuery.data.results.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <ExerciseThumb exercise={exercise} />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">{exercise.nome}</div>
                        <div className="max-w-lg truncate text-xs text-muted-foreground">
                          {exercise.instrucoes_gerais || "Sem instrucoes cadastradas"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getExerciseCategoryName(exercise)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{exercise.origem}</Badge>
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
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      ) : null}
    </div>
  );
}

function ExerciseThumb({ exercise }: { exercise: Exercise }) {
  if (!exercise.url_animacao) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
        <ImageIcon className="size-5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <Image
      src={exercise.url_animacao}
      alt={exercise.nome}
      width={44}
      height={44}
      className="size-11 shrink-0 rounded-lg border border-border object-cover"
    />
  );
}

function getExerciseCategoryName(exercise: Exercise) {
  return exercise.categoria_nome || exercise.grupo_muscular || "Sem categoria";
}
