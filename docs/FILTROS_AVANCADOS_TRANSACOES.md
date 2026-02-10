# Filtros Avançados de Transações

## Visão Geral

Sistema completo de busca e filtros avançados para transações, permitindo aos usuários encontrar rapidamente transações específicas usando múltiplos critérios.

## Funcionalidades Implementadas

### 1. Componente de Filtros (`TransactionFilters.vue`)

Componente reutilizável que fornece interface de filtros com:

#### Filtros Básicos (sempre visíveis):
- **Busca por texto**: Pesquisa na descrição da transação
- **Tipo**: Filtrar por receitas ou despesas
- **Categoria**: Filtrar por categoria específica
- **Conta**: Filtrar por conta específica

#### Filtros Avançados (expansível):
- **Data Inicial**: Filtrar transações a partir de uma data
- **Data Final**: Filtrar transações até uma data
- **Valor Mínimo**: Filtrar por valor mínimo (R$)
- **Valor Máximo**: Filtrar por valor máximo (R$)

#### Recursos:
- Contador de filtros ativos
- Botão para limpar todos os filtros
- Botão para aplicar filtros
- Interface responsiva e intuitiva

### 2. API Endpoint Atualizado (`/api/transactions`)

O endpoint foi atualizado para suportar todos os filtros:

#### Query Parameters Suportados:
```typescript
{
  // Filtros de busca
  search?: string              // Busca na descrição (case-insensitive)
  type?: 'revenue' | 'expense' | 'income' | 'all'  // Tipo de transação
  category_id?: string         // ID da categoria
  account_id?: string          // ID da conta
  workspace_id?: string        // ID do workspace
  
  // Filtros de data
  start_date?: string          // Data inicial (YYYY-MM-DD)
  end_date?: string            // Data final (YYYY-MM-DD)
  date_from?: string           // Alias para start_date
  date_to?: string             // Alias para end_date
  
  // Filtros de valor
  min_amount?: number          // Valor mínimo
  max_amount?: number          // Valor máximo
  amount_min?: number          // Alias para min_amount
  amount_max?: number          // Alias para max_amount
  
  // Ordenação
  sort_by?: 'date' | 'amount' | 'description'  // Campo de ordenação
  sort_order?: 'asc' | 'desc'  // Ordem (crescente/decrescente)
  
  // Paginação
  page?: number                // Página atual (padrão: 1)
  limit?: number               // Itens por página (padrão: 20)
}
```

#### Resposta:
```typescript
{
  transactions: Array<{
    id: string
    date: string
    description: string
    amount: number
    type: 'revenue' | 'expense'
    category_id: string
    account_id: string
    category_name: string      // Nome da categoria (join)
    account_name: string       // Nome da conta (join)
  }>
  total: number                // Total de transações (para paginação)
}
```

### 3. Página de Transações (`/transactions`)

Página dedicada com:

#### Estatísticas em Tempo Real:
- Total de transações encontradas
- Soma de receitas
- Soma de despesas
- Saldo (receitas - despesas)

#### Interface de Filtros:
- Todos os filtros disponíveis
- Ordenação por data, valor ou descrição
- Paginação para grandes volumes de dados
- Exportação para CSV

#### Tabela de Resultados:
- Exibição clara de todas as transações
- Formatação de valores em R$
- Formatação de datas em pt-BR
- Badges coloridos para tipo (receita/despesa)
- Ações de edição por transação

## Como Usar

### 1. Acessar a Página de Transações

Navegue para `/transactions` ou clique no link "Transações" no menu.

### 2. Aplicar Filtros

1. Preencha os campos de filtro desejados
2. Clique em "Aplicar Filtros" ou pressione Enter no campo de busca
3. Os resultados serão atualizados automaticamente

### 3. Limpar Filtros

Clique no botão "Limpar Filtros" para resetar todos os filtros e ver todas as transações.

### 4. Exportar Dados

Clique no botão "📥 Exportar CSV" para baixar as transações filtradas em formato CSV.

## Exemplos de Uso

### Buscar Transações de Supermercado

```
Busca: "supermercado"
Tipo: Despesas
```

### Encontrar Receitas Acima de R$ 1000

```
Tipo: Receitas
Valor Mínimo: 1000
```

### Transações de Janeiro de 2026

```
Data Início: 2026-01-01
Data Fim: 2026-01-31
```

### Despesas em Categoria Específica

```
Tipo: Despesas
Categoria: Alimentação
Ordenar por: Valor (Decrescente)
```

## Integração com Outras Páginas

O componente `TransactionFilters.vue` pode ser facilmente integrado em outras páginas:

```vue
<template>
  <UiTransactionFilters
    :workspace-id="workspaceId"  <!-- Opcional -->
    @filter="handleFilter"
    @reset="handleReset"
  />
</template>

<script setup>
const handleFilter = (filters) => {
  // Aplicar filtros
  console.log('Filtros ativos:', filters)
}

const handleReset = () => {
  // Resetar filtros
  console.log('Filtros resetados')
}
</script>
```

## Performance

- **Paginação**: Limite de 20-100 transações por página para performance
- **Índices no Banco**: Queries otimizadas com joins eficientes
- **Lazy Loading**: Dados carregados apenas quando necessário
- **Debounce**: Busca por texto com debounce para evitar requisições excessivas

## Segurança

- ✅ Autenticação obrigatória
- ✅ Filtro automático por usuário (user_id)
- ✅ Validação de permissões no backend
- ✅ Sanitização de inputs
- ✅ Proteção contra SQL injection (Supabase)

## Melhorias Futuras

- [ ] Salvar filtros favoritos
- [ ] Filtros por tags/labels
- [ ] Busca por múltiplas categorias
- [ ] Filtros por período (últimos 7 dias, último mês, etc.)
- [ ] Gráficos baseados nos filtros aplicados
- [ ] Exportação em outros formatos (PDF, Excel)

## Arquivos Modificados

1. **Novo**: `app/components/ui/TransactionFilters.vue` - Componente de filtros
2. **Atualizado**: `server/api/transactions.get.ts` - Endpoint com suporte a filtros
3. **Atualizado**: `app/pages/transactions.vue` - Página completa de transações

## Testes Recomendados

1. ✅ Testar cada filtro individualmente
2. ✅ Testar combinação de múltiplos filtros
3. ✅ Testar ordenação por diferentes campos
4. ✅ Testar paginação com grandes volumes
5. ✅ Testar exportação CSV
6. ✅ Testar responsividade em mobile
7. ✅ Testar performance com muitas transações

## Conclusão

O sistema de filtros avançados está completo e funcional, proporcionando uma experiência rica para os usuários encontrarem e analisarem suas transações financeiras de forma eficiente.
