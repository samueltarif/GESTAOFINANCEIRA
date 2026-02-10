# ⚠️ AÇÃO NECESSÁRIA: Executar Migration

## O Problema

O erro ocorre porque a tabela `workspace_members` não existe no banco de dados.

```
ERROR ❌ Erro na API workspaces: Usuário não autenticado
```

## Solução: Executar a Migration

### Passo 1: Acessar Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **ifftngadjtwgjsadqvep**

### Passo 2: Abrir SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (botão verde no canto superior direito)

### Passo 3: Copiar e Colar o SQL

Copie TODO o conteúdo abaixo e cole no SQL Editor:

```sql
-- Tabela: workspace_members (compartilhamento de workspaces)
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- Índices para performance
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_status ON workspace_members(status);

-- Row Level Security (RLS)
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver membros dos workspaces que pertencem
CREATE POLICY "Users can view workspace members" ON workspace_members
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE user_id = auth.uid()
        ) OR user_id = auth.uid()
    );

-- Política: Owners e admins podem adicionar membros
CREATE POLICY "Owners and admins can add members" ON workspace_members
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'accepted'
        ) OR workspace_id IN (
            SELECT id FROM workspaces WHERE user_id = auth.uid()
        )
    );

-- Política: Owners e admins podem atualizar membros
CREATE POLICY "Owners and admins can update members" ON workspace_members
    FOR UPDATE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'accepted'
        ) OR workspace_id IN (
            SELECT id FROM workspaces WHERE user_id = auth.uid()
        )
    );

-- Política: Owners e admins podem remover membros
CREATE POLICY "Owners and admins can delete members" ON workspace_members
    FOR DELETE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'accepted'
        ) OR workspace_id IN (
            SELECT id FROM workspaces WHERE user_id = auth.uid()
        )
    );

-- Política: Usuários podem aceitar/rejeitar seus próprios convites
CREATE POLICY "Users can update their own invites" ON workspace_members
    FOR UPDATE USING (user_id = auth.uid());

-- Função: Adicionar owner automaticamente ao criar workspace
CREATE OR REPLACE FUNCTION add_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workspace_members (workspace_id, user_id, role, status, accepted_at)
    VALUES (NEW.id, NEW.user_id, 'owner', 'accepted', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Adicionar owner ao criar workspace
CREATE TRIGGER on_workspace_created
    AFTER INSERT ON workspaces
    FOR EACH ROW EXECUTE PROCEDURE add_workspace_owner();

-- Atualizar políticas de workspaces para incluir membros compartilhados
DROP POLICY IF EXISTS "Users can view their own workspaces" ON workspaces;
CREATE POLICY "Users can view their own workspaces" ON workspaces
    FOR SELECT USING (
        user_id = auth.uid() OR 
        id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND status = 'accepted'
        )
    );

-- Comentários para documentação
COMMENT ON TABLE workspace_members IS 'Membros e compartilhamentos de workspaces';
COMMENT ON COLUMN workspace_members.role IS 'Papel do membro: owner (dono), admin (administrador), member (membro), viewer (visualizador)';
COMMENT ON COLUMN workspace_members.status IS 'Status do convite: pending (pendente), accepted (aceito), rejected (rejeitado)';
```

### Passo 4: Executar

1. Clique no botão **Run** (ou pressione Ctrl+Enter)
2. Aguarde a execução (deve levar alguns segundos)
3. Você deve ver mensagens de sucesso

### Passo 5: Verificar

Execute este comando para verificar se a tabela foi criada:

```sql
SELECT * FROM workspace_members LIMIT 5;
```

Se retornar uma tabela vazia (sem erros), está tudo certo!

### Passo 6: Adicionar Owners aos Workspaces Existentes

Como o trigger só funciona para novos workspaces, precisamos adicionar os owners manualmente aos workspaces existentes:

```sql
-- Adicionar owners aos workspaces existentes
INSERT INTO workspace_members (workspace_id, user_id, role, status, accepted_at)
SELECT id, user_id, 'owner', 'accepted', NOW()
FROM workspaces
WHERE NOT EXISTS (
    SELECT 1 FROM workspace_members 
    WHERE workspace_members.workspace_id = workspaces.id 
    AND workspace_members.user_id = workspaces.user_id
);
```

### Passo 7: Recarregar a Página

1. Volte para http://localhost:3002/workspaces
2. Pressione Ctrl+F5 para recarregar completamente
3. O erro deve desaparecer!

## Verificação Final

Execute estes comandos no SQL Editor para confirmar:

```sql
-- 1. Ver quantos membros existem
SELECT COUNT(*) as total_membros FROM workspace_members;

-- 2. Ver seus workspaces e membros
SELECT 
    w.name as workspace,
    wm.role,
    wm.status,
    u.email
FROM workspace_members wm
JOIN workspaces w ON wm.workspace_id = w.id
JOIN users u ON wm.user_id = u.id
ORDER BY w.name, wm.role;

-- 3. Verificar políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'workspace_members';
```

## Se Ainda Houver Erro

1. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
2. **Reinicie o servidor**:
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev -- --port 3002
   ```
3. **Faça logout e login novamente**

## Status

🚧 **AGUARDANDO EXECUÇÃO DA MIGRATION**

Após executar a migration, a funcionalidade de compartilhamento estará 100% funcional!
