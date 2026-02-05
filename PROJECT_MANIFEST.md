# PROJECT_MANIFEST.md

## Documentação
- [ ] DB_SCHEMA.md
- [ ] PROJECT_MANIFEST.md
- [ ] README.md

## Banco de Dados (Supabase)
- [ ] supabase_migrations/001_core.sql

## Componentes (components/)

### KPI
- [ ] components/kpi/KpiCard.vue
- [ ] components/kpi/KpiIcon.vue
- [ ] components/kpi/GlobalKpiCard.vue
- [ ] components/kpi/WorkspaceKpiCard.vue

### Charts
- [ ] components/charts/PieChart.vue
- [ ] components/charts/BarChart.vue
- [ ] components/charts/GlobalPieExpenses.vue
- [ ] components/charts/GlobalBarMonthly.vue
- [ ] components/charts/WorkspacePieCategories.vue
- [ ] components/charts/WorkspaceBarMonthly.vue

### Tables
- [ ] components/tables/TransactionsTable.vue
- [ ] components/tables/RecentTransactionsTable.vue

### Modals
- [ ] components/modals/CreateTransactionModal.vue
- [ ] components/modals/CreateWorkspaceModal.vue

### Auth
- [ ] components/auth/AuthForm.vue
- [ ] components/auth/AuthInput.vue
- [ ] components/auth/AuthButton.vue

### UI (Shadcn-vue bases)
- [ ] components/ui/Button.vue
- [ ] components/ui/Input.vue
- [ ] components/ui/Card.vue
- [ ] components/ui/Dialog.vue
- [ ] components/ui/Select.vue

### Outros
- [ ] components/GlobalBalanceSummary.vue
- [ ] components/WorkspaceHeader.vue
- [ ] components/WorkspaceCard.vue
- [ ] components/MoneyInput.vue
- [ ] components/CategorySelect.vue
- [ ] components/AccountSelect.vue

## Páginas (pages/)
- [ ] pages/login.vue
- [ ] pages/register.vue
- [ ] pages/dashboard.vue
- [ ] pages/workspaces/index.vue
- [ ] pages/workspaces/[id].vue

## API (server/api/)
- [ ] server/api/workspaces.post.ts
- [ ] server/api/workspaces.get.ts
- [ ] server/api/dashboard/global.get.ts
- [ ] server/api/workspaces/[id]/dashboard.get.ts
- [ ] server/api/transactions.post.ts
- [ ] server/api/transactions.get.ts
