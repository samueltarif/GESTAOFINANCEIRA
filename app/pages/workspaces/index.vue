<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface WorkspacePreview {
  id: string
  name: string
  type: 'personal' | 'business' | 'investment'
  color: string
  created_at: string
  preview: {
    balance: number
    totalRevenue: number
    totalExpenses: number
    accountCount: number
    transactionCount: number
    categoryCount: number
    hasData: boolean
  }
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function handleLogout() {
  try {
    await supabase.auth.signOut()
    await navigateTo('/login')
  } catch (error) {
    console.error('Erro durante logout:', error)
  }
}

const { data: workspaces, pending, refresh } = useLazyFetch<WorkspacePreview[]>('/api/workspaces/preview', {
  server: false
})

const isModalOpen = ref(false)
const selectedWorkspaces = ref<Set<string>>(new Set())
const showDeleteConfirm = ref(false)
const deleteMode = ref<'single' | 'multiple' | 'all'>('single')
const workspaceToDelete = ref<string | null>(null)
const isDeleting = ref(false)

function toggleWorkspaceSelection(id: string) {
  if (selectedWorkspaces.value.has(id)) {
    selectedWorkspaces.value.delete(id)
  } else {
    selectedWorkspaces.value.add(id)
  }
}

function selectAll() {
  if (workspaces.value) {
    workspaces.value.forEach(w => selectedWorkspaces.value.add(w.id))
  }
}

function deselectAll() {
  selectedWorkspaces.value.clear()
}

function confirmDeleteSingle(id: string) {
  workspaceToDelete.value = id
  deleteMode.value = 'single'
  showDeleteConfirm.value = true
}

function confirmDeleteMultiple() {
  if (selectedWorkspaces.value.size === 0) return
  deleteMode.value = 'multiple'
  showDeleteConfirm.value = true
}

function confirmDeleteAll() {
  deleteMode.value = 'all'
  showDeleteConfirm.value = true
}

async function executeDelete() {
  isDeleting.value = true
  try {
    if (deleteMode.value === 'single' && workspaceToDelete.value) {
      await $fetch(`/api/workspaces/${workspaceToDelete.value}`, { method: 'DELETE' })
    } else if (deleteMode.value === 'multiple') {
      await $fetch('/api/workspaces/delete-multiple', {
        method: 'POST',
        body: { workspaceIds: Array.from(selectedWorkspaces.value) }
      })
      selectedWorkspaces.value.clear()
    } else if (deleteMode.value === 'all' && workspaces.value) {
      const allIds = workspaces.value.map(w => w.id)
      await $fetch('/api/workspaces/delete-multiple', {
        method: 'POST',
        body: { workspaceIds: allIds }
      })
      selectedWorkspaces.value.clear()
    }
    
    await refresh()
    showDeleteConfirm.value = false
    workspaceToDelete.value = null
  } catch (error) {
    console.error('Erro ao excluir workspace(s):', error)
    alert('Erro ao excluir workspace(s). Tente novamente.')
  } finally {
    isDeleting.value = false
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
  workspaceToDelete.value = null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const getDeleteMessage = computed(() => {
  if (deleteMode.value === 'single') {
    const workspace = workspaces.value?.find(w => w.id === workspaceToDelete.value)
    return `Tem certeza que deseja excluir o workspace "${workspace?.name}"? Todas as categorias e transações vinculadas serão removidas permanentemente.`
  } else if (deleteMode.value === 'multiple') {
    return `Tem certeza que deseja excluir ${selectedWorkspaces.value.size} workspace(s) selecionado(s)? Todas as categorias e transações vinculadas serão removidas permanentemente.`
  } else {
    return `Tem certeza que deseja excluir TODOS os ${workspaces.value?.length || 0} workspaces? Esta ação é irreversível e todos os dados serão perdidos permanentemente.`
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div class="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl">💰</span>
          <h1 class="text-xl font-bold text-gray-900">Controle Financeiro</h1>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <span class="text-sm font-medium text-green-700">
                {{ user?.email?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="text-sm text-gray-600 hidden sm:inline">{{ user?.email }}</span>
          </div>
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-gray-900">Meus Workspaces</h2>
          <p class="text-gray-600">Gerencie seus espaços financeiros isolados</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <NuxtLink to="/dashboard">
            <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              ← Voltar ao Dashboard
            </button>
          </NuxtLink>
          <button
            @click="isModalOpen = true"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors"
          >
            + Novo Workspace
          </button>
        </div>
      </div>

      <!-- Ações em Massa -->
      <div v-if="workspaces && workspaces.length > 0" class="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">
            {{ selectedWorkspaces.size }} de {{ workspaces.length }} selecionado(s)
          </span>
          <button
            v-if="selectedWorkspaces.size < workspaces.length"
            @click="selectAll"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Selecionar todos
          </button>
          <button
            v-if="selectedWorkspaces.size > 0"
            @click="deselectAll"
            class="text-sm text-gray-600 hover:text-gray-700 font-medium"
          >
            Desmarcar todos
          </button>
        </div>
        <div class="flex gap-2">
          <button
            v-if="selectedWorkspaces.size > 0"
            @click="confirmDeleteMultiple"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            🗑️ Excluir Selecionados ({{ selectedWorkspaces.size }})
          </button>
          <button
            @click="confirmDeleteAll"
            class="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 transition-colors"
          >
            🗑️ Excluir Todos
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-48 rounded-xl border border-gray-200 bg-white animate-pulse"></div>
      </div>

      <!-- Content -->
      <div v-else-if="workspaces && workspaces.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="relative rounded-xl border bg-white shadow-sm transition-all"
          :class="selectedWorkspaces.has(workspace.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-green-300 hover:shadow-md'"
        >
          <!-- Checkbox de Seleção -->
          <div class="absolute top-4 left-4 z-10">
            <input
              type="checkbox"
              :checked="selectedWorkspaces.has(workspace.id)"
              @change="toggleWorkspaceSelection(workspace.id)"
              @click.stop
              class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <!-- Botão de Exclusão Individual -->
          <button
            @click.stop="confirmDeleteSingle(workspace.id)"
            class="absolute top-4 right-4 z-10 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir workspace"
          >
            <Icon name="lucide:trash-2" class="h-5 w-5" />
          </button>

          <!-- Link para o Workspace -->
          <NuxtLink
            :to="`/workspaces/${workspace.id}`"
            class="block p-6 pt-12"
          >
            <!-- Header do Card -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3 flex-1">
                <div
                  class="h-12 w-12 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  :style="{ backgroundColor: workspace.color || '#10B981' }"
                >
                  {{ workspace.name.charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 truncate">{{ workspace.name }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ workspace.type === 'personal' ? 'Pessoal' : workspace.type === 'business' ? 'Empresarial' : 'Investimentos' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Prévia dos Dados -->
            <div v-if="workspace.preview.hasData" class="space-y-3 mb-4">
              <!-- Saldo -->
              <div class="flex items-center justify-between p-3 rounded-lg" :class="workspace.preview.balance >= 0 ? 'bg-green-50' : 'bg-red-50'">
                <span class="text-sm font-medium text-gray-700">Saldo</span>
                <span class="text-lg font-bold" :class="workspace.preview.balance >= 0 ? 'text-green-700' : 'text-red-700'">
                  {{ formatCurrency(workspace.preview.balance) }}
                </span>
              </div>

              <!-- Receitas e Despesas -->
              <div class="grid grid-cols-2 gap-2">
                <div class="p-2 bg-gray-50 rounded-lg">
                  <div class="text-xs text-gray-600 mb-1">Receitas</div>
                  <div class="text-sm font-semibold text-green-600">{{ formatCurrency(workspace.preview.totalRevenue) }}</div>
                </div>
                <div class="p-2 bg-gray-50 rounded-lg">
                  <div class="text-xs text-gray-600 mb-1">Despesas</div>
                  <div class="text-sm font-semibold text-red-600">{{ formatCurrency(workspace.preview.totalExpenses) }}</div>
                </div>
              </div>

              <!-- Estatísticas -->
              <div class="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div class="flex items-center gap-1">
                  <Icon name="lucide:credit-card" class="h-3 w-3" />
                  <span>{{ workspace.preview.transactionCount }} transações</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon name="lucide:layout-grid" class="h-3 w-3" />
                  <span>{{ workspace.preview.categoryCount }} categorias</span>
                </div>
              </div>
            </div>

            <!-- Estado Vazio -->
            <div v-else class="py-6 text-center">
              <Icon name="lucide:inbox" class="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500">Sem movimentações</p>
            </div>

            <!-- Data de Criação -->
            <div class="flex items-center gap-2 text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
              <Icon name="lucide:calendar" class="h-3 w-3" />
              <span>Criado em {{ new Date(workspace.created_at).toLocaleDateString('pt-BR') }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl border-gray-300 bg-white">
        <div class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon name="lucide:layout-grid" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Nenhum workspace encontrado</h3>
        <p class="text-gray-600 mb-6">Comece criando seu primeiro espaço financeiro</p>
        <button
          @click="isModalOpen = true"
          class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          + Criar Novo Workspace
        </button>
      </div>
    </main>

    <!-- Modal de Criação -->
    <WorkspacesCreateWorkspaceModal 
      :open="isModalOpen" 
      @update:open="isModalOpen = $event"
      @success="refresh"
    />

    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <div class="fixed inset-0 bg-black/80" @click="cancelDelete"></div>
      <div class="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl" style="z-index: 9999;">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Icon name="lucide:trash-2" class="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Confirmar Exclusão</h2>
              <p class="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
            </div>
          </div>

          <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">
              {{ getDeleteMessage }}
            </p>
          </div>

          <div class="flex gap-3">
            <button
              @click="cancelDelete"
              :disabled="isDeleting"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="executeDelete"
              :disabled="isDeleting"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="isDeleting" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              <span>{{ isDeleting ? 'Excluindo...' : 'Sim, Excluir' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>