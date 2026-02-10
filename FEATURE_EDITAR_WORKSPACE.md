# Feature: Editar Workspaces

## Implementação Completa

Adicionada a funcionalidade de editar nome e cor dos workspaces em duas páginas:
1. Página de detalhes do workspace (`/workspaces/[id]`)
2. Página de listagem de workspaces (`/workspaces`)

## Arquivos Criados

### 1. Endpoint PUT - `server/api/workspaces/[id].put.ts`
Endpoint para atualizar workspace:
- Valida autenticação do usuário
- Valida UUID do workspace
- Valida nome (obrigatório, máx 100 caracteres)
- Valida cor (formato hexadecimal #RRGGBB)
- Verifica se o workspace pertence ao usuário
- Atualiza nome, cor e updated_at
- Retorna dados atualizados

**Validações:**
- Nome não pode ser vazio
- Cor deve estar no formato #RRGGBB (hexadecimal)
- Apenas o dono do workspace pode editá-lo

### 2. Modal de Edição - `app/components/ui/EditWorkspaceModal.vue`
Modal para editar workspace na página de detalhes:
- Campo de texto para nome
- 8 cores predefinidas (green, blue, purple, amber, red, pink, cyan, lime)
- Seletor de cor customizado (color picker + input hexadecimal)
- Preview em tempo real
- Validação de formulário
- Feedback com toast notifications
- Loading state durante salvamento

### 3. Modal de Edição - `app/components/workspaces/EditWorkspaceModal.vue`
Modal para editar workspace na página de listagem (mesmo código):
- Mesmas funcionalidades do modal acima
- Usado na página de listagem de workspaces

## Modificações em Arquivos Existentes

### 1. `app/pages/workspaces/[id].vue`
**Adicionado:**
- Ref `showEditWorkspaceModal` (já existia)
- Função `handleWorkspaceSuccess()` (já existia)
- Botão de editar (✏️) ao lado do nome do workspace
- Componente `<UiEditWorkspaceModal>` no final do template

**Localização do botão:**
```vue
<h2 class="text-3xl font-bold text-gray-900">{{ workspace?.name }}</h2>
<button
  v-if="workspace"
  @click="showEditWorkspaceModal = true"
  class="ml-2 p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
  title="Editar workspace"
>
  ✏️
</button>
```

### 2. `app/pages/workspaces/index.vue`
**Já tinha:**
- Ref `showEditWorkspaceModal`
- Ref `workspaceToEdit`
- Função `openEditModal(workspace)`
- Função `handleWorkspaceEditSuccess()`
- Botão de editar em cada card de workspace
- Componente `<WorkspacesEditWorkspaceModal>` no template

**Localização do botão:**
Cada card de workspace tem um botão de editar no canto superior direito (ícone de lápis).

## Como Usar

### Na Página de Detalhes do Workspace
1. Acesse qualquer workspace (`/workspaces/[id]`)
2. Clique no ícone ✏️ ao lado do nome do workspace
3. Edite o nome e/ou cor
4. Clique em "Salvar Alterações"
5. O workspace será atualizado e o modal fechará

### Na Página de Listagem de Workspaces
1. Acesse a listagem de workspaces (`/workspaces`)
2. Clique no ícone de lápis (edit) no canto superior direito de qualquer card
3. Edite o nome e/ou cor
4. Clique em "Salvar Alterações"
5. A lista será atualizada automaticamente

## Cores Predefinidas

As seguintes cores estão disponíveis para seleção rápida:
- 🟢 Verde (#10B981) - Padrão
- 🔵 Azul (#3B82F6)
- 🟣 Roxo (#8B5CF6)
- 🟠 Âmbar (#F59E0B)
- 🔴 Vermelho (#EF4444)
- 🩷 Rosa (#EC4899)
- 🔷 Ciano (#06B6D4)
- 🟢 Lima (#84CC16)

Além disso, é possível escolher qualquer cor customizada usando:
- Color picker nativo do navegador
- Input de texto com código hexadecimal

## Feedback ao Usuário

O sistema fornece feedback através de toast notifications:
- ✅ **Sucesso**: "Workspace atualizado com sucesso!"
- ❌ **Erro de validação**: "Nome do workspace é obrigatório" ou "Cor inválida"
- ❌ **Erro de servidor**: Mensagem de erro retornada pela API

## Segurança

- Apenas o dono do workspace pode editá-lo
- Validação de autenticação no servidor
- Validação de UUID para prevenir injeção
- Validação de formato de cor (hexadecimal)
- Sanitização de nome (trim)

## Testes

Para testar a funcionalidade:

1. **Teste básico:**
   - Edite o nome de um workspace
   - Edite a cor de um workspace
   - Verifique se as mudanças aparecem imediatamente

2. **Teste de validação:**
   - Tente salvar com nome vazio (deve mostrar erro)
   - Tente salvar com cor inválida (deve mostrar erro)

3. **Teste de preview:**
   - Mude o nome e veja o preview atualizar
   - Mude a cor e veja o preview atualizar

4. **Teste de persistência:**
   - Edite um workspace
   - Recarregue a página
   - Verifique se as mudanças foram salvas

## Próximas Melhorias (Opcional)

- [ ] Adicionar campo de descrição do workspace
- [ ] Adicionar opção de mudar o tipo (personal/business/investment)
- [ ] Adicionar histórico de alterações
- [ ] Adicionar undo/redo
- [ ] Adicionar atalhos de teclado (Ctrl+S para salvar)
