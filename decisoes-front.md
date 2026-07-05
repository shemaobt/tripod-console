# US-12.2 - Access the console and view scoped content navigation

## Problema

O manager logava no console mas nao via os itens de navegacao de conteudo (Organizations, Projects, Languages, Phases, Map) na sidebar. Alem disso, quando o scoping nao existia no backend, qualquer usuario autenticado via todos os dados do sistema.

## Decisoes

1. **Nenhuma alteracao de codigo no frontend**: A sidebar ja implementa a logica `(isPlatformAdmin || isManager)` para exibir os itens de conteudo (implementado na US-12.1). O `AuthContext` ja expoe `isManager`, `managedOrgIds` e `managedOrgId`. Nenhum arquivo frontend foi modificado.

2. **Scoping delegado ao backend**: As paginas de listagem (`OrganizationsPage`, `LanguagesPage`, `PhasesPage`, `ProjectsPage`, `MapPage`) chamam os endpoints de listagem sem filtros. O backend (US-11.6) aplica o scoping automaticamente baseado no role do usuario. O frontend renderiza o que a API retorna.

3. **Empty states ja existentes**: Todas as paginas de listagem ja possuem tratamento de empty state. Quando o backend retorna arrays vazios (usuario sem organizacoes), o frontend exibe a mensagem adequada sem necessidade de alteracao.

4. **Problema original era de dados, nao de codigo**: O usuario `manager3@test.com` estava cadastrado na organizacao com `role: "member"` ao inves de `role: "manager"`. Apos a promocao via `PATCH /api/organizations/{org_id}/members/{user_id}` (US-11.3), o endpoint `my-managed-orgs` retornou os dados corretos e a sidebar passou a exibir os itens de conteudo.

## Solucao Implementada

### Frontend

Nenhum arquivo modificado. A implementacao existente (US-12.1) ja cobre todos os criterios de aceitacao:

- `src/contexts/AuthContext.tsx`: Expoe `isManager`, `managedOrgIds`, `managedOrgId`.
- `src/components/layout/Sidebar.tsx`: Condicional `(isPlatformAdmin || isManager)` para content nav items. `isPlatformAdmin` para admin nav items.
- `src/App.tsx`: `AdminRoute` wrapper para rotas de Users e Manage Apps.

### Backend

Todo o scoping foi implementado na US-11.6 (ver `decisoes-back.md`).

## Verificacao

| Criterio | Status |
|---|---|
| Managers veem Organizations, Projects, Languages, Phases, Map | PASS |
| Dados sao escopados para as organizacoes gerenciadas | PASS (backend US-11.6) |
| Users e Manage Apps ficam ocultos para managers | PASS |
| Sidebar reflete o role do usuario | PASS |
| Manager sem organizacao ve secoes vazias | PASS |

## Commits

Nenhum commit de frontend necessario para esta US. O scoping e inteiramente resolvido no backend (US-11.6).

A unica alteracao documental foi:

### `docs(us): update US-12.2 with full scoping requirements`

Arquivos:
- `context/US-FRONT-BACK-ENGLISH.md`
