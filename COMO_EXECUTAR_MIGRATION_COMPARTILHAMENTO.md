# 🚀 Como Executar a Migration de Compartilhamento

## Passo a Passo

### 1. Acessar o Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: **ifftngadjtwgjsadqvep**

### 2. Abrir SQL Editor

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### 3. Copiar e Executar a Migration

1. Abra o arquivo: `supabase_migrations/003_workspace_sharing.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### 4. Verificar Execução

Você deve ver mensagens de sucesso como:

```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
ALTER TABLE
CREATE POLICY
CREATE POLICY
...
```

### 5. Verificar Tabela Criada

Execute este comando para verificar:

```sql
SELECT * FROM workspace_members LIMIT 5;
```

Deve retornar uma tabela vazia (sem erros).

### 6. Verificar Trigger

Execute este comando:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_workspace_created';
```

Deve retornar 1 linha mostrando que o trigger foi criado.

## Testando a Funcionalidade

### 1. Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev -- --port 3002
```

### 2. Testar via Script

```bash
node test-workspace-sharing.js
```

### 3. Testar via Interface

1. Acesse: http://localhost:3002/workspaces
2. Clique no ícone de compartilhar (share-2) em um workspace
3. Digite um email de usuário cadastrado
4. Selecione um papel (Admin/Member/Viewer)
5. Clique em "Convidar"
6. Faça login com o usuário convidado
7. Aceite o convite na página de workspaces
8. Verifique se o workspace aparece na lista

## Troubleshooting

### Erro: "relation workspace_members does not exist"
- A migration não foi executada
- Execute novamente o SQL no Supabase

### Erro: "permission denied for table workspace_members"
- As políticas RLS não foram criadas
- Execute novamente o SQL completo

### Erro: "function add_workspace_owner() does not exist"
- O trigger não foi criado
- Execute novamente o SQL completo

### Workspace não aparece após aceitar convite
- Verifique se o status é "accepted":
```sql
SELECT * FROM workspace_members WHERE user_id = 'SEU_USER_ID';
```
- Recarregue a página
- Limpe o cache do navegador

## Verificação Final

Execute estes comandos para verificar tudo:

```sql
-- 1. Verificar tabela
SELECT COUNT(*) FROM workspace_members;

-- 2. Verificar políticas RLS
SELECT tablename, policyname FROM pg_policies 
WHERE tablename = 'workspace_members';

-- 3. Verificar trigger
SELECT tgname FROM pg_trigger 
WHERE tgrelid = 'workspaces'::regclass;

-- 4. Testar inserção manual (opcional)
INSERT INTO workspace_members (
  workspace_id, 
  user_id, 
  role, 
  status
) VALUES (
  'SEU_WORKSPACE_ID',
  'SEU_USER_ID',
  'member',
  'pending'
);
```

## Rollback (Se Necessário)

Se precisar desfazer a migration:

```sql
-- Remover trigger
DROP TRIGGER IF EXISTS on_workspace_created ON workspaces;
DROP FUNCTION IF EXISTS add_workspace_owner();

-- Remover políticas
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON workspace_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON workspace_members;
DROP POLICY IF EXISTS "Owners and admins can delete members" ON workspace_members;
DROP POLICY IF EXISTS "Users can update their own invites" ON workspace_members;

-- Remover tabela
DROP TABLE IF EXISTS workspace_members CASCADE;

-- Restaurar política antiga de workspaces
DROP POLICY IF EXISTS "Users can view their own workspaces" ON workspaces;
CREATE POLICY "Users can view their own workspaces" ON workspaces
    FOR SELECT USING (user_id = auth.uid());
```

## Status

✅ Migration criada
✅ APIs implementadas
✅ Componentes criados
🚧 Aguardando execução da migration no Supabase

## Próximos Passos

Após executar a migration:

1. ✅ Testar convite de usuário
2. ✅ Testar aceitação de convite
3. ✅ Testar alteração de papel
4. ✅ Testar remoção de membro
5. ✅ Verificar permissões por papel
6. ✅ Testar workspace compartilhado na lista
