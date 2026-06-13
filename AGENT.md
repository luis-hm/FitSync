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

Regra operacional:

- Nao iniciar `npm run dev` automaticamente ao finalizar tarefas. So subir dev server quando o usuario pedir explicitamente.
- Se precisar validar interface, primeiro perguntar ao usuario se quer que o servidor seja iniciado.
- Se um dev server tiver sido iniciado pelo agente, encerrar o processo antes de finalizar a resposta, salvo pedido explicito para deixa-lo rodando.

## Ambientes

Frontend local:

```text
preferencia: http://localhost:3001
se o Next ja estiver ativo neste repo, usar a porta informada no terminal
```

API local:

```text
http://localhost:8000
```

Variavel esperada no front:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

A porta `3000` pode estar ocupada pelo Mobi Escola. Quando o usuario pedir explicitamente para iniciar o frontend, preferir `3001` se `3000` estiver ocupada, mas nao derrubar um servidor ativo sem pedido do usuario.

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

Padrao de API inspirado no Mobi, adaptado ao FitSync:

- `src/lib/api/http.ts` e a camada central tipo `apiService`: baseURL, cookies, token bearer, refresh e interceptors.
- `src/features/*/api`: metodos de dominio, um arquivo por modulo.
- `src/features/*/hooks`: React Query para cache, loading, erro, invalidacao e mutations.
- `src/features/*/types`: aliases dos DTOs gerados em `src/types/generated/api.d.ts`.
- `src/features/*/schemas`: validacao Zod dos formularios.
- `src/features/*/mappers`: conversao form/UI -> payload e DTO -> exibicao quando necessario.
- Paginas e componentes de tela nao chamam HTTP direto.

## UI

Usar:

- `src/components/ui`: componentes shadcn/ui.
- `src/components/layout`: shell, sidebar, header, layout protegido.
- `src/components/shared`: componentes reutilizaveis do produto, como `PageHeader`, `StatCard`, `EmptyState`, `ModulePage`.

## Design System FitSync

O padrao visual operacional atual e dark, denso e orientado a dashboard:

```text
background: #0E0E0E
sidebar:    #141414
cards:      #1A1A1A
inputs:     #1E1E1E
borders:    #2A2A2A
text:       #F5F5F5
muted text: #888888
accent:     #B8FF57
success:    #22C55E
danger:     #FF4D4D
```

Regras de tela operacional:

- Sidebar compacta, logo com `Dumbbell`, fundo `#141414`, borda `#2A2A2A`.
- Item ativo da navegacao usa fundo `#1E1E1E`, texto claro e barra lateral lime.
- Topbar tem `h-20`, fundo escuro, avatar, role e toggle de tema.
- Telas de listagem devem ter busca, filtros, paginacao, loading, erro, vazio, toast e acoes reais.
- Dados mockados so podem entrar como placeholder explicito; nunca usar mock como metrica real.
- Nao adicionar itens de menu sem dominio/API correspondente.

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
GET/PATCH /api/settings/
GET /api/health/
```

Accounts:

```text
GET /api/accounts/admin/dashboard/
GET /api/accounts/admin/usuarios/
POST /api/accounts/admin/usuarios/
PATCH /api/accounts/admin/usuarios/{id}/
POST /api/accounts/admin/usuarios/{id}/ativar/
POST /api/accounts/admin/usuarios/{id}/desativar/
GET /api/accounts/admin/personais/
GET/PATCH /api/accounts/admin/personais/{id}/
GET /api/accounts/admin/alunos/
GET/PATCH /api/accounts/admin/alunos/{id}/
GET /api/accounts/personal/alunos/
GET /api/accounts/aluno/me/
```

Workouts:

```text
GET /api/workouts/exercicios/
POST /api/workouts/exercicios/
PATCH /api/workouts/exercicios/{id}/
POST /api/workouts/exercicios/{id}/arquivar/
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
- Usar `zod` para validar formularios; usar `react-hook-form` quando o formulario crescer em complexidade ou precisar de estado fino por campo.
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
