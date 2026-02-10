# ✅ Correção do Filtro de Receitas

## Problema Identificado
O filtro por tipo na página de transações não buscava receitas, apenas despesas.

## Causa Raiz
**Inconsistência entre tipos do banco de dados e código:**
- Banco de dados usa: `'revenue'` e `'expense'`
- Código estava usando: `'income'` e `'expense'`

## Solução Aplicada

### Arquivo: `app/pages/transactions.vue`

Alteradas todas as ocorrências de `'income'` para `'revenue'`:

1. **Interface Transaction** (linha 9)
   ```typescript
   type: 'revenue' | 'expense'  // ✅ Corrigido
   ```

2. **Ref selectedType** (linha 23)
   ```typescript
   const selectedType = ref<'all' | 'revenue' | 'expense'>('all')  // ✅ Corrigido
   ```

3. **Stats computed** (linha 76)
   ```typescript
   const totalIncome = txs.filter((t: Transaction) => t.type === 'revenue')  // ✅ Corrigido
   ```

4. **Função exportToCSV** (linha 109)
   ```typescript
   t.type === 'revenue' ? 'Receita' : 'Despesa'  // ✅ Corrigido
   ```

5. **Select de tipo no template** (linhas 234-236)
   ```html
   <option value="revenue">Receitas</option>  <!-- ✅ Corrigido -->
   ```

6. **Badge de tipo na tabela** (linhas 394-396)
   ```html
   :class="tx.type === 'revenue' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'"
   {{ tx.type === 'revenue' ? 'Receita' : 'Despesa' }}  <!-- ✅ Corrigido -->
   ```

7. **Cor do valor na tabela** (linha 399)
   ```html
   :class="tx.type === 'revenue' ? 'text-green-600' : 'text-red-600'"  <!-- ✅ Corrigido -->
   ```

## Confirmação no Banco de Dados

Verificado em `supabase_migrations/001_core.sql`:

```sql
-- Tabela: Categories
type TEXT NOT NULL CHECK (type IN ('revenue', 'expense'))

-- Tabela: Transactions  
type TEXT NOT NULL CHECK (type IN ('revenue', 'expense'))
```

✅ Banco usa `'revenue'` e `'expense'`

## Resultado

Agora o filtro funciona corretamente:
- **Todos**: Mostra receitas e despesas
- **Receitas**: Mostra apenas transações do tipo `'revenue'`
- **Despesas**: Mostra apenas transações do tipo `'expense'`

## Commits

```bash
git commit -m "fix: Corrige filtro de receitas - altera 'income' para 'revenue' no template"
git push origin master
```

**Commit:** `47ea12b`

## Como Testar

1. Acesse: http://localhost:3002/transactions
2. No filtro "Tipo", selecione:
   - **Todos**: Deve mostrar receitas e despesas
   - **Receitas**: Deve mostrar apenas receitas (badges verdes)
   - **Despesas**: Deve mostrar apenas despesas (badges vermelhos)
3. Verifique as estatísticas no topo da página
4. Exporte para CSV e confirme que os tipos estão corretos

## Status

✅ **CONCLUÍDO** - Filtro de receitas funcionando corretamente
