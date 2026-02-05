<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const workspaceId = route.params.id as string

// Verificar se o ID é válido (não é 'new' e tem formato UUID)
const isValidId = workspaceId && workspaceId !== 'new' && workspaceId.length > 10

// Se o ID não for válido, redirecionar imediatamente
if (!isValidId) {
  await navigateTo('/workspaces')
  throw createError({ statusCode: 404, statusMessage: 'Workspace não encontrado' })
}

const isTransactionModalOpen = ref(false)
const isAccountModalOpen = ref(false)
const isCategoryModalOpen = ref(false)

// Fazer as requisições apenas se o ID for válido
const { data: workspace, pending: workspaceLoading } = await useFetch(`/api/workspaces/${workspaceId}`, {
  default: () => null
})

const { data: dashboard, pending: dashboardLoading, refresh } = await useFetch(`/api/workspaces/${workspaceId}/dashboard`, {
  default: () => null
})

// Função de logout
const logout = async () => {
  const supabase = useSupabaseClient()
  await supabase.auth.signOut()
  await navigateTo('/login')
}

const pieChartData = computed(() => {
  if (!dashboard.value?.expensesByCategory) return { labels: [], datasets: [{ data: [], backgroundColor: [] }] }
  
  return {
    labels: dashboard.value.expensesByCategory.labels || [],
    datasets: [{
      data: dashboard.value.expensesByCategory.data || [],
      backgroundColor: dashboard.value.expensesByCategory.colors || []
    }]
  }
})

const barChartData = computed(() => {
  if (!dashboard.value?.monthlyEvolution) return { labels: [], datasets: [] }
  
  return {
    labels: dashboard.value.monthlyEvolution.labels || [],
    datasets: [
      {
        label: 'Receitas',
        data: dashboard.value.monthlyEvolution.revenues || [],
        backgroundColor: '#22c55e'
      },
      {
        label: 'Despesas',
        data: dashboard.value.monthlyEvolution.expenses || [],
        backgroundColor: '#ef4444'
      }
    ]
  }
})
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <!-- Header simples com logout -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-semibold">{{ workspace?.name || 'Workspace' }}</h2>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">samuel.tarif@gmail.com</span>
            <button 
              @click="logout"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <div class="p-6">
      <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Loading State -->
      <div v-if="workspaceLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>

      <template v-else-if="workspace">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <NuxtLink to="/workspaces" class="text-sm text-muted-foreground hover:text-primary transition-colors">
                &larr; Voltar para workspaces
              </NuxtLink>
            </div>
            <div class="flex items-center gap-3">
              <div 
                class="h-4 w-4 rounded-full" 
                :style="{ backgroundColor: workspace.color || 'var(--primary)' }"
              ></div>
              <h1 class="text-3xl font-bold tracking-tight">{{ workspace.name }}</h1>
            </div>
          </div>
          <div class="flex gap-2">
            <UiButton variant="outline" @click="isAccountModalOpen = true">+ Nova Conta</UiButton>
            <UiButton variant="outline" @click="isCategoryModalOpen = true">+ Nova Categoria</UiButton>
            <UiButton @click="isTransactionModalOpen = true">+ Nova Transação</UiButton>
          </div>
        </div>

        <!-- Dashboard do Workspace -->
        <div v-if="dashboardLoading" class="flex items-center justify-center py-12">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>

        <template v-else-if="dashboard">
          <!-- KPIs -->
          <GlobalBalanceSummary
            :total-balance="dashboard.totalBalance"
            :total-revenue="dashboard.totalRevenue"
            :total-expenses="dashboard.totalExpenses"
            :profit="dashboard.profit"
          />

          <!-- Gráficos -->
          <div class="grid gap-6 lg:grid-cols-2">
            <GlobalPieExpenses :data="pieChartData" />
            <GlobalBarMonthly :data="barChartData" />
          </div>

          <!-- Tabelas -->
          <TablesRecentTransactionsTable :transactions="dashboard.recentTransactions" />
        </template>

        <!-- Modais de Teste -->
        <UiSimpleTestModal 
          :open="isTransactionModalOpen" 
          :workspace-id="workspaceId"
          type="transaction"
          @update:open="isTransactionModalOpen = $event"
          @success="refresh"
        />
        
        <UiSimpleTestModal 
          :open="isCategoryModalOpen" 
          :workspace-id="workspaceId"
          type="category"
          @update:open="isCategoryModalOpen = $event"
          @success="refresh"
        />
        
        <UiCreateAccountModal 
          :open="isAccountModalOpen" 
          :workspace-id="workspaceId"
          @update:open="isAccountModalOpen = $event"
          @success="refresh"
        />
      </template>

      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold">Workspace não encontrado</h2>
        <NuxtLink to="/workspaces">
          <UiButton variant="link">Voltar para a lista</UiButton>
        </NuxtLink>
      </div>
      </div>
    </div>
  </div>
</template>
