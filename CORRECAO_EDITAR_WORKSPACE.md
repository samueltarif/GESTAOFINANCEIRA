# Correção: Editar Workspace

## Problemas Identificados

### 1. Erro no Backend
**Erro:** `Could not find the 'updated_at' column of 'workspaces' in the schema cache`

**Causa:** O endpoint estava tentando atualizar a coluna `updated_at` que não existe na tabela `workspaces` do banco de dados.

**Solução:** Removida a tentativa de atualizar `updated_at` do endpoint PUT.

### 2. Erro no Frontend
**Erro:** `Cannot read properties of null (reading 'toUpperCase')`

**Causa:** O código estava tentando chamar `color.toUpperCase()` quando `color` poderia ser `null` ou `undefined`.

**Solução:** 
- Adicionado optional chaining: `color?.toUpperCase()`
- Adicionado valor padrão ao carregar workspace: `color.value = newWorkspace.color || '#10B981'`

## Arquivos Modificados

### 1. `server/api/workspaces/[id].put.ts`

**Antes:**
```typescript
.update({
    name: name.trim(),
    color: color.toUpperCase(),
    updated_at: new Date().toISOString()  // ❌ Coluna não existe
})
```

**Depois:**
```typescript
.update({
    name: name.trim(),
    color: color.toUpperCase()  // ✅ Removido updated_at
})
```

### 2. `app/components/ui/EditWorkspaceModal.vue`

**Mudança 1 - Optional Chaining:**
```vue
<!-- Antes -->
:class="color.toUpperCase() === presetColor.toUpperCase() ? ..."

<!-- Depois -->
:class="color?.toUpperCase() === presetColor.toUpperCase() ? ..."
```

**Mudança 2 - Valor Padrão:**
```typescript
// Antes
watch(() => props.workspace, (newWorkspace) => {
  if (newWorkspace) {
    name.value = newWorkspace.name
    color.value = newWorkspace.color  // ❌ Pode ser null
  }
}, { immediate: true })

// Depois
watch(() => props.workspace, (newWorkspace) => {
  if (newWorkspace) {
    name.value = newWorkspace.name || ''
    color.value = newWorkspace.color || '#10B981'  // ✅ Valor padrão
  }
}, { immediate: true })
```

### 3. `app/components/workspaces/EditWorkspaceModal.vue`
Mesmas correções aplicadas.

## Resultado

Agora a funcionalidade de editar workspace funciona corretamente:
- ✅ Não tenta atualizar coluna inexistente no banco
- ✅ Não quebra quando cor é null/undefined
- ✅ Sempre tem um valor padrão para cor (#10B981 - verde)
- ✅ Modal abre e fecha corretamente
- ✅ Salvamento funciona sem erros
- ✅ Toast de sucesso é exibido

## Como Testar

1. Abra qualquer workspace
2. Clique no botão de editar (✏️)
3. Altere o nome e/ou cor
4. Clique em "Salvar Alterações"
5. ✅ Deve salvar sem erros
6. ✅ Deve mostrar toast de sucesso
7. ✅ Deve atualizar a interface imediatamente

## Observação sobre updated_at

A tabela `workspaces` no Supabase não possui a coluna `updated_at`. Se você quiser adicionar essa funcionalidade no futuro, será necessário:

1. Criar uma migration para adicionar a coluna:
```sql
ALTER TABLE workspaces 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

2. Adicionar um trigger para atualizar automaticamente:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workspaces_updated_at 
BEFORE UPDATE ON workspaces 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

Por enquanto, a funcionalidade funciona perfeitamente sem essa coluna.
