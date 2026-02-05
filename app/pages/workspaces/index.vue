<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Workspace {
  id: string
  name: string
  type: 'personal' | 'business' | 'investment'
  color: string
  created_at: string
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

const { data: workspaces, pending, refresh } = await useFetch<Workspace[]>('/api/workspaces')

const isModalOpen = ref(false)
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
        <div class="flex gap-2">
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

      <!-- Loading State -->
      <div v-if="pending" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-48 rounded-xl border border-gray-200 bg-white animate-pulse"></div>
      </div>

      <!-- Content -->
      <div v-else-if="workspaces && workspaces.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="workspace in workspaces"
          :key="workspace.id"
          :to="`/workspaces/${workspace.id}`"
          class="block"
        >
          <div class="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-green-300">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div
                  class="h-12 w-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                  :style="{ backgroundColor: workspace.color || '#10B981' }"
                >
                  {{ workspace.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ workspace.name }}</h3>
                  <p class="text-sm text-gray-500">{{ workspace.type === 'personal' ? 'Pessoal' : workspace.type === 'business' ? 'Empresarial' : 'Investimentos' }}</p>
                </div>
              </div>
              <Icon name="lucide:chevron-right" class="h-5 w-5 text-gray-400" />
            </div>
            
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="lucide:calendar" class="h-4 w-4" />
              <span>Criado em {{ new Date(workspace.created_at).toLocaleDateString('pt-BR') }}</span>
            </div>
          </div>
        </NuxtLink>
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
  </div>
</template>