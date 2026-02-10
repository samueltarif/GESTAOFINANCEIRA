# Correção do Dashboard do Workspace

## Problema Identificado

O dashboard do workspace estava mostrando valores diferentes do dashboard global:
- **Dashboard Global**: Mostrava saldo total + receitas/despesas de TODAS as categorias do usuário
- **Dashboard Workspace**: Mostrava saldo total + receitas/despesas APENAS das categorias daquele workspace específico

Isso causava um cálculo incorreto do **Lucro/Sobra** no workspace, pois:
```
Lucro = Saldo Atual + Receitas - Despesas
```

Se as receitas e despesas consideravam apenas categorias do workspace, mas o saldo era global, o cálculo ficava errado.

## Solução Implementada

Modificado o arquivo `server/api/workspaces/[id]/dashboard.get.ts` para:

### 1. Buscar TODAS as categorias do usuário
```typescript
// Buscar TODOS os workspaces do usuário
const { data: allWorkspaces } = await client
    .from('workspaces')
    .select('id')
    .eq('user_id', userId)

const workspaceIds = (allWorkspaces || []).map(w => w.id)

// Buscar TODAS as categorias de TODOS os workspaces do usuário
const { data: categories } = await client
    .from('categories')
    .select('id, name, color, type')
    .in('workspace_id', workspaceIds)
```

### 2. Calcular receitas e despesas globais
```typescript
// Receitas do mês (TODAS as categorias do usuário)
client
    .from('transactions')
    .select('amount, category_id')
    .ilike('type', 'revenue')
    .in('category_id', allCategoryIds)  // ← TODAS as categorias
    .gte('date', startDate)
    .lt('date', endDate)

// Despesas do mês (TODAS as categorias do usuário)
client
    .from('transactions')
    .select('amount, category_id')
    .ilike('type', 'expense')
    .in('category_id', allCategoryIds)  // ← TODAS as categorias
    .gte('date', startDate)
    .lt('date', endDate)
```

### 3. Manter transações recentes apenas do workspace
```typescript
// Transações recentes (apenas do workspace atual)
client
    .from('transactions')
    .select('id, date, description, category_id, account_id, type, amount')
    .in('category_id', workspaceCategoryIds)  // ← Apenas do workspace
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: false })
    .limit(10)
```

### 4. Evolução mensal com todas as categorias
```typescript
// Buscar transações de TODOS os meses sem filtro de categoria
client
    .from('transactions')
    .select('amount, category_id')
    .ilike('type', 'revenue')
    .gte('date', monthStart)
    .lt('date', monthEnd)

// Depois filtrar apenas categorias do usuário
revenueRes.data?.forEach(tx => {
    if (categoryMap.has(tx.category_id)) {
        rev += tx.amount || 0
    }
})
```

## Resultado

Agora o dashboard do workspace mostra:
- ✅ **Saldo Atual**: Soma de TODAS as contas do usuário (global)
- ✅ **Receitas do Mês**: Soma de TODAS as transações de receita do usuário (global)
- ✅ **Despesas do Mês**: Soma de TODAS as transações de despesa do usuário (global)
- ✅ **Lucro/Sobra**: Cálculo correto = Saldo + Receitas - Despesas
- ✅ **Transações Recentes**: Apenas do workspace atual (para contexto)

## Como Testar

Execute o script de teste:
```bash
node test-dashboard-comparison.js
```

O script irá:
1. Fazer login com as credenciais
2. Buscar o primeiro workspace
3. Comparar os valores do dashboard global vs workspace
4. Mostrar se os valores estão iguais

Resultado esperado:
```
✅ Saldo: IGUAL
✅ Receitas: IGUAL
✅ Despesas: IGUAL
✅ Lucro/Sobra: IGUAL

🎉 SUCESSO! Todos os valores estão iguais!
```

## Arquivos Modificados

- `server/api/workspaces/[id]/dashboard.get.ts` - Lógica de cálculo corrigida
- `test-dashboard-comparison.js` - Script de teste criado

## Observações

- As contas são **globais por usuário** (não por workspace)
- As categorias são **por workspace**
- O dashboard do workspace agora mostra valores **globais** (como o dashboard principal)
- Apenas as **transações recentes** são filtradas por workspace (para contexto)
