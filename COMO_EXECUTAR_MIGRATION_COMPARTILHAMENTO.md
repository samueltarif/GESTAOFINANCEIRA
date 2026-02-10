# 📋 Como Executar a Migration de Compartilhamento

## Passo a Passo

### 1. Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione seu projeto: **ifftngadjtwgjsadqvep**

### 2. Abrir o SQL Editor

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query** (ou use Ctrl+Enter)

### 3. Copiar e Executar a Migration

1. Abra o arquivo: `supabase_migrations/003_workspace_sharing.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### 4. Verificar Sucesso

Você deve ver a mensagem: **Success. No rows returned**

### 5. Verificar Tabela Criada

Execute este comando para verificar:

```sql
SELECT * FROM workspace_shares;
```

Deve retornar uma tabela vazia (sem erros).

### 6. Verificar Políticas RLS

Execute este comando:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'workspace_shares';
```

Deve retornar 4 políticas:
- Users can view shares of their workspaces or shared with them (SELECT)
- Workspace owners can create shares (INSERT)
- Workspace owners can delete shares (DELETE)
- Workspace owners can update shares (UPDATE)

---

## Conteúdo da Migration

A migration cria:

1. **Tabela `workspace_shares`**:
   - Armazena compartilhamentos de workspaces
   - Campos: id, workspace_id, shared_with_user_id, shared_by_user_id, role, created_at

2. **Índices**:
   - `idx_workspace_shares_workspace_id` - Performance
   - `idx_workspace_shares_shared_with_user_id` - Performance

3. **Row Level Security (RLS)**:
   - 4 políticas para controlar acesso
   - Apenas donos podem gerenciar compartilhamentos
   - Usuários veem apenas seus compartilhamentos

4. **Atualização de Política de Workspaces**:
   - Permite ver workspaces compartilhados
   - Mantém segurança de dados

---

## Testar Funcionalidade

### 1. Reiniciar Servidor Local

```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev -- --port 3002
```

### 2. Acessar Sistema

1. Acesse: http://localhost:3002
2. Faça login
3. Vá para a página de Workspaces

### 3. Testar Compartilhamento

1. Clique no ícone de compartilhar (🔗) em um workspace
2. Digite um email de outro usuário cadastrado
3. Selecione a permissão (viewer/editor/admin)
4. Clique em "Compartilhar"

### 4. Verificar no Banco

```sql
SELECT 
  ws.*,
  u1.email as shared_with_email,
  u2.email as shared_by_email
FROM workspace_shares ws
JOIN users u1 ON ws.shared_with_user_id = u1.id
JOIN users u2 ON ws.shared_by_user_id = u2.id;
```

---

## Troubleshooting

### Erro: "relation workspace_shares already exists"

A tabela já foi criada. Você pode:
1. Pular a migration (já está aplicada)
2. Ou deletar e recriar:

```sql
DROP TABLE IF EXISTS workspace_shares CASCADE;
-- Depois execute a migration novamente
```

### Erro: "column does not exist"

Verifique se a tabela `users` existe:

```sql
SELECT * FROM users LIMIT 1;
```

Se não existir, execute primeiro a migration `001_core.sql`.

### Erro: "permission denied"

Verifique se você está usando o usuário correto do Supabase (com permissões de admin).

---

## Próximos Passos

Após executar a migration:

1. ✅ Testar compartilhamento na interface
2. ✅ Criar segundo usuário para testar
3. ✅ Verificar permissões (viewer/editor/admin)
4. ✅ Testar remoção de compartilhamento
5. ✅ Testar atualização de permissão

---

## Status

✅ Migration criada e pronta para execução
✅ APIs implementadas
✅ Interface implementada
⏳ Aguardando execução no Supabase
