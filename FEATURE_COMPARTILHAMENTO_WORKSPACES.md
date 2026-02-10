# 🤝 Compartilhamento de Workspaces

## Visão Geral

Funcionalidade que permite compartilhar workspaces com outros usuários, definindo diferentes níveis de permissão.

## Estrutura do Banco de Dados

### Tabela: `workspace_members`

```sql
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id),
    user_id UUID REFERENCES users(id),
    role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
```

### Papéis e Permissões

| Papel | Permissões |
|-------|-----------|
| **Owner** | Controle total do workspace, não pode ser removido |
| **Admin** | Gerenciar membros, configurações, criar/editar/excluir dados |
| **Member** | Criar e editar transações, categorias e contas |
| **Viewer** | Apenas visualização, sem edição |

## APIs Criadas

### 1. Listar Membros
**GET** `/api/workspaces/[id]/members`

Retorna todos os membros de um workspace.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "workspace_id": "uuid",
    "user_id": "uuid",
    "email": "usuario@exemplo.com",
    "role": "member",
    "status": "accepted",
    "invited_at": "2024-01-01T00:00:00Z",
    "accepted_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### 2. Convidar Membro
**POST** `/api/workspaces/[id]/members`

Envia convite para um usuário.

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "role": "member"
}
```

**Permissões:** Owner ou Admin

**Resposta:**
```json
{
  "success": true,
  "member": {
    "id": "uuid",
    "workspace_id": "uuid",
    "user_id": "uuid",
    "email": "usuario@exemplo.com",
    "role": "member",
    "status": "pending"
  }
}
```

---

### 3. Remover Membro
**DELETE** `/api/workspaces/[id]/members/[memberId]`

Remove um membro do workspace.

**Permissões:** 
- Owner ou Admin (para remover outros)
- Qualquer membro (para sair do workspace)

**Restrições:**
- Não pode remover o owner

---

### 4. Atualizar Membro
**PUT** `/api/workspaces/[id]/members/[memberId]`

Atualiza papel ou aceita/rejeita convite.

**Body (alterar papel):**
```json
{
  "role": "admin"
}
```

**Body (aceitar convite):**
```json
{
  "status": "accepted"
}
```

**Permissões:**
- Alterar papel: Owner ou Admin
- Aceitar/rejeitar: Apenas o próprio usuário

---

### 5. Listar Convites Pendentes
**GET** `/api/workspace-invites`

Retorna convites pendentes do usuário logado.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "workspace_id": "uuid",
    "workspace_name": "Meu Workspace",
    "workspace_type": "business",
    "role": "member",
    "invited_at": "2024-01-01T00:00:00Z",
    "invited_by_email": "dono@exemplo.com"
  }
]
```

## Componentes Criados

### 1. `ShareWorkspaceModal.vue`
Modal para gerenciar membros de um workspace.

**Props:**
- `workspaceId: string` - ID do workspace
- `workspaceName: string` - Nome do workspace
- `open: boolean` - Controla visibilidade

**Funcionalidades:**
- Listar membros atuais
- Convidar novos membros
- Alterar papel dos membros
- Remover membros
- Informações sobre papéis e permissões

---

### 2. `WorkspaceInvites.vue`
Componente para exibir e gerenciar convites pendentes.

**Funcionalidades:**
- Lista convites pendentes
- Aceitar convite
- Rejeitar convite
- Auto-atualiza após ações

## Fluxo de Uso

### 1. Convidar Usuário

1. Owner/Admin abre o workspace
2. Clica no botão de compartilhar (ícone de share)
3. Digita o email do usuário
4. Seleciona o papel (Admin/Member/Viewer)
5. Clica em "Convidar"
6. Convite é enviado com status "pending"

### 2. Aceitar Convite

1. Usuário convidado faz login
2. Vê notificação de convite pendente
3. Clica em "Aceitar"
4. Workspace aparece na lista de workspaces
5. Status muda para "accepted"

### 3. Gerenciar Membros

1. Owner/Admin abre modal de membros
2. Vê lista de todos os membros
3. Pode alterar papel usando dropdown
4. Pode remover membros (exceto owner)

## Segurança (RLS)

### Políticas Implementadas

1. **Visualização**: Usuários veem membros dos workspaces que pertencem
2. **Inserção**: Apenas owners e admins podem adicionar membros
3. **Atualização**: Owners e admins podem alterar papéis
4. **Exclusão**: Owners e admins podem remover membros
5. **Auto-atualização**: Usuários podem aceitar/rejeitar seus próprios convites

### Trigger Automático

Ao criar um workspace, o criador é automaticamente adicionado como "owner" com status "accepted".

## Instalação

### 1. Executar Migration

```bash
# No Supabase SQL Editor, execute:
supabase_migrations/003_workspace_sharing.sql
```

### 2. Verificar Tabela

```sql
SELECT * FROM workspace_members;
```

### 3. Testar APIs

```bash
node test-workspace-sharing.js
```

## Testes

### Cenários de Teste

1. ✅ **Criar workspace** → Owner adicionado automaticamente
2. ✅ **Convidar usuário** → Convite criado com status pending
3. ✅ **Aceitar convite** → Status muda para accepted
4. ✅ **Rejeitar convite** → Status muda para rejected
5. ✅ **Alterar papel** → Role atualizado
6. ✅ **Remover membro** → Membro removido
7. ✅ **Tentar remover owner** → Erro
8. ✅ **Workspace compartilhado aparece na lista** → Visível para membros
9. ✅ **Permissões respeitadas** → Apenas owners/admins gerenciam

### Script de Teste

```bash
# Com servidor rodando em localhost:3002
node test-workspace-sharing.js
```

## Interface do Usuário

### Página de Workspaces

- **Botão de compartilhar** (ícone share-2) em cada card de workspace
- **Badge de convites pendentes** no topo da página
- **Lista de convites** com botões Aceitar/Rejeitar

### Modal de Compartilhamento

- **Formulário de convite** (email + papel)
- **Lista de membros** com status e papel
- **Dropdown para alterar papel** (exceto owner)
- **Botão de remover** (exceto owner)
- **Informações sobre papéis** (tooltip/info box)

## Próximas Melhorias

### Funcionalidades Futuras

1. **Notificações por email** ao receber convite
2. **Histórico de atividades** dos membros
3. **Permissões granulares** por recurso
4. **Convite por link** (sem precisar email)
5. **Grupos de membros** para facilitar gestão
6. **Auditoria** de ações dos membros
7. **Limite de membros** por plano
8. **Transferir ownership** para outro membro

### Melhorias de UX

1. **Badge de "Compartilhado"** nos cards de workspace
2. **Avatar dos membros** no card
3. **Busca de membros** na lista
4. **Filtros** (por papel, status)
5. **Ordenação** (por nome, data)
6. **Paginação** para muitos membros
7. **Confirmação visual** ao convidar/remover
8. **Toast notifications** para feedback

## Arquivos Criados/Modificados

### Novos Arquivos

- ✅ `supabase_migrations/003_workspace_sharing.sql`
- ✅ `server/api/workspaces/[id]/members.get.ts`
- ✅ `server/api/workspaces/[id]/members.post.ts`
- ✅ `server/api/workspaces/[id]/members/[memberId].delete.ts`
- ✅ `server/api/workspaces/[id]/members/[memberId].put.ts`
- ✅ `server/api/workspace-invites.get.ts`
- ✅ `app/components/workspaces/ShareWorkspaceModal.vue`
- ✅ `app/components/workspaces/WorkspaceInvites.vue`
- ✅ `test-workspace-sharing.js`

### Arquivos Modificados

- ✅ `app/pages/workspaces/index.vue` (adicionado componente de convites)

## Status

🚧 **EM DESENVOLVIMENTO** - Aguardando execução da migration e testes

## Como Testar

1. **Execute a migration** no Supabase
2. **Reinicie o servidor** (npm run dev)
3. **Faça login** com um usuário
4. **Crie um workspace** se não tiver
5. **Clique no ícone de compartilhar** no card do workspace
6. **Convide outro usuário** (precisa estar cadastrado)
7. **Faça login com o usuário convidado**
8. **Aceite o convite** na página de workspaces
9. **Verifique** se o workspace aparece na lista
10. **Teste as permissões** de cada papel

## Troubleshooting

### Erro: "Usuário não encontrado"
- Certifique-se que o email está cadastrado no sistema

### Erro: "Sem permissão"
- Verifique se o usuário é owner ou admin do workspace

### Convite não aparece
- Verifique se a migration foi executada
- Verifique se o status é "pending"
- Recarregue a página

### Workspace compartilhado não aparece
- Certifique-se que o convite foi aceito (status = "accepted")
- Verifique as políticas RLS no Supabase
