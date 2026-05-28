# AGENT.md - Guia Operacional Do Frontend FitSync

## Visao Geral

O FitSync frontend fica em `/home/dev/fitsync` e consome a API Django em `/home/dev/fitsync-api`.

A aplicacao e um dashboard para:

- `ADMIN`: gestao geral da plataforma.
- `PERSONAL`: gestao de alunos, treinos, avaliacoes e evolucao.
- `ALUNO`: visualizacao de treino, avaliacoes e progresso.

Nao criar landing page. A primeira experiencia real deve ser login ou dashboard autenticado.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Lucide React
- Recharts
- OpenAPI TypeScript

Comandos principais:

```bash
npm run dev
npm run gen:api
npm run lint
npm run type-check
npm run build
npm run validate
```

## Ambientes

Frontend local:

```text
http://localhost:3001
```

API local:

```text
http://localhost:8000
```

Variavel esperada no front:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

A porta `3000` pode estar ocupada pelo Mobi Escola. Neste ambiente, o FitSync foi deixado em `3001`.

## Estrutura Principal

```text
src/app
src/app/(auth)
src/app/(dashboard)

src/components/ui
src/components/layout
src/components/shared

src/features/auth
src/features/accounts
src/features/workouts
src/features/assessments
src/features/core

src/lib/api
src/lib/auth
src/lib/query

src/stores
src/types/generated
src/utils/mappers
src/utils/formatters
```

## Rotas

Rotas publicas:

```text
/login
/register
/forgot-password
/reset-password
```

Rotas autenticadas:

```text
/admin
/admin/usuarios
/admin/personais
/admin/alunos
/admin/exercicios
/admin/configuracoes

/personal
/personal/alunos
/personal/exercicios
/personal/templates
/personal/treinos
/personal/avaliacoes
/personal/evolucao
/personal/ranking

/aluno
/aluno/perfil
/aluno/treino
/aluno/avaliacoes
/aluno/evolucao
```

## Auth

Arquivos importantes:

```text
src/lib/api/http.ts
src/stores/auth-store.ts
src/features/auth/api/auth.api.ts
src/features/auth/components/login-form.tsx
src/components/layout/protected-layout.tsx
src/components/layout/app-shell.tsx
```

Fluxo:

- Login chama `POST /api/auth/login/`.
- Backend retorna `access` no JSON.
- Backend salva refresh token em cookie HttpOnly.
- Front guarda somente `accessToken` e `user` no Zustand.
- Nunca salvar refresh token em `localStorage`.
- Requests autenticadas enviam `Authorization: Bearer <access>`.
- Axios usa `withCredentials: true`.
- Em `401`, o client tenta `POST /api/auth/refresh/`.
- Se refresh falhar, limpar sessao e redirecionar para `/login`.

Redirecionamento por perfil:

```text
ADMIN -> /admin
PERSONAL -> /personal
ALUNO -> /aluno
```

## Padrao De Implementacao

Ao criar uma feature, manter a separacao:

```text
src/features/<modulo>/api
src/features/<modulo>/components
src/features/<modulo>/hooks
src/features/<modulo>/schemas
src/features/<modulo>/types
```

Evitar criar um `apiClient.ts` gigante. Cada modulo deve ter seu proprio arquivo de API.

Exemplos:

```text
src/features/accounts/api/accounts.api.ts
src/features/workouts/api/workouts.api.ts
src/features/assessments/api/assessments.api.ts
src/features/core/api/options.api.ts
```

## UI

Usar:

- `src/components/ui`: componentes shadcn/ui.
- `src/components/layout`: shell, sidebar, header, layout protegido.
- `src/components/shared`: componentes reutilizaveis do produto, como `PageHeader`, `StatCard`, `EmptyState`, `ModulePage`.

Toda tela de dados deve tratar:

- loading;
- erro;
- estado vazio;
- feedback de sucesso/erro via toast;
- paginacao quando consumir endpoints listados da API.

## API E Tipos

A API expoe documentacao em:

```text
/api/docs/
/api/redoc/
/api/schema/
```

Gerar tipos com:

```bash
npm run gen:api
```

Arquivo gerado:

```text
src/types/generated/api.d.ts
```

Usar esse arquivo como fonte de verdade para contratos quando implementar novas telas.

## Endpoints Importantes

Auth:

```text
POST /api/auth/login/
POST /api/auth/refresh/
POST /api/auth/logout/
GET  /api/auth/me/
PATCH /api/auth/me/
POST /api/auth/register/
POST /api/auth/password-reset/
POST /api/auth/password-reset/confirm/
```

Core:

```text
GET /api/options/
GET /api/health/
```

Accounts:

```text
GET /api/accounts/admin/usuarios/
GET /api/accounts/admin/personais/
GET /api/accounts/admin/alunos/
GET /api/accounts/personal/alunos/
GET /api/accounts/aluno/me/
```

Workouts:

```text
GET /api/workouts/exercicios/
GET /api/workouts/templates/
GET /api/workouts/treinos/
```

Assessments:

```text
GET /api/assessments/avaliacoes/
GET /api/assessments/alunos/{id}/evolucao/
GET /api/assessments/personal/ranking/
```

## Regras Para Agentes

- Antes de implementar, verificar a estrutura existente.
- Usar os padroes ja criados em `features`, `components/shared`, `lib/api` e `stores`.
- Nao duplicar client HTTP.
- Nao guardar refresh token no frontend.
- Nao criar chamadas HTTP soltas dentro de paginas.
- Preferir API por feature + hooks quando houver estado de loading/cache.
- Usar `react-hook-form` + `zod` para formularios.
- Usar componentes `shadcn/ui` ja instalados.
- Rodar validacoes antes de finalizar.

Validacao obrigatoria:

```bash
npm run gen:api
npm run lint
npm run type-check
npm run build
```

## Backend

O backend fica em:

```text
/home/dev/fitsync-api
```

Comandos uteis:

```bash
make db
make migrate
make run
```

A API deve estar rodando para gerar tipos OpenAPI e testar login.
