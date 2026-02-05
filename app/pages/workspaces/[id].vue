<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Workspace {
  id: string
  name: string
  color: string
}

interface DashboardData {
  workspace: Workspace
  totalBalance: number
  totalRevenue: number
  totalExpenses: number
  profit: number
  expensesByCategory: {
    labels: string[]
    data: number[]
    colors: string[]
  }
  monthlyEvolution: {
    labels: string[]
    revenues: number[]
    expenses: number[]
  }
  recentTransactions: Array<{
    id: string
    date: string
    description: string
    category: string
    category_id: string
    account_id: string
    type: 'revenue' | 'expense'
    amount: number
  }>
}

const route = useRoute()
const workspaceId = route.params.id as string
const user = useSupabaseUser()

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
const { data: workspace, pending: workspaceLoading } = await useFetch<Workspace>(`/api/workspaces/${workspaceId}`, {
  default: () => null as any
})

const { data: dashboard, pending: dashboardLoading, refresh } = await useFetch<DashboardData>(`/api/workspaces/${workspaceId}/dashboard`, {
  default: () => null as any
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">💰</span>
            <h1 class="text-xl font-bold text-gray-900">{{ workspace?.name || 'Workspace' }}</h1>
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
              @click="logout"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="workspaceLoading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-2">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          <p class="text-sm text-gray-600">Carregando workspace...</p>
        </div>
      </div>

      <template v-else-if="workspace">
        <!-- Header do Workspace -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <NuxtLink to="/workspaces" class="text-sm text-gray-600 hover:text-green-600 transition-colors">
                &larr; Voltar para workspaces
              </NuxtLink>
            </div>
            <div class="flex items-center gap-3">
              <div 
                class="h-4 w-4 rounded-full" 
                :style="{ backgroundColor: workspace.color || '#10B981' }"
              ></div>
              <h2 class="text-3xl font-bold text-gray-900">{{ workspace.name }}</h2>
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button 
              @click="isAccountModalOpen = true"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              + Nova Conta
            </button>
            <button 
              @click="isCategoryModalOpen = true"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              + Nova Categoria
            </button>
            <button 
              @click="isTransactionModalOpen = true"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              + Nova Transação
            </button>
          </div>
        </div>

        <!-- Dashboard Loading -->
        <div v-if="dashboardLoading" class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-2">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
            <p class="text-sm text-gray-600">Carregando dados...</p>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else-if="dashboard" class="space-y-6">
          <!-- KPI Cards -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Saldo Total -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-600">Saldo Total</h3>
                <Icon name="lucide:wallet" class="h-4 w-4 text-gray-400" />
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ formatCurrency(dashboard.totalBalance) }}</div>
              <p class="text-xs text-gray-500 mt-1">Saldo atual</p>
            </div>

            <!-- Total de Receitas -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-600">Total de Receitas</h3>
                <Icon name="lucide:trending-up" class="h-4 w-4 text-gray-400" />
              </div>
              <div class="text-2xl font-bold text-green-600">{{ formatCurrency(dashboard.totalRevenue) }}</div>
              <p class="text-xs text-gray-500 mt-1">Receitas acumuladas</p>
            </div>

            <!-- Total de Despesas -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-600">Total de Despesas</h3>
                <Icon name="lucide:trending-down" class="h-4 w-4 text-gray-400" />
              </div>
              <div class="text-2xl font-bold text-red-600">{{ formatCurrency(dashboard.totalExpenses) }}</div>
              <p class="text-xs text-gray-500 mt-1">Despesas acumuladas</p>
            </div>

            <!-- Lucro / Sobra -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-600">Lucro / Sobra</h3>
                <Icon name="lucide:piggy-bank" class="h-4 w-4 text-gray-400" />
              </div>
              <div class="text-2xl font-bold" :class="dashboard.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(dashboard.profit) }}
              </div>
              <p class="text-xs text-gray-500 mt-1">Saldo + Receitas - Despesas</p>
            </div>
          </div>

          <!-- Charts -->
          <div class="grid gap-6 lg:grid-cols-2">
            <!-- Pie Chart -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Gastos por Categoria</h3>
                <p class="text-sm text-gray-600">Distribuição das suas despesas</p>
              </div>
              <div class="h-[300px]">
                <ChartsPieChart :data="pieChartData" />
              </div>
            </div>

            <!-- Bar Chart -->
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Evolução Mensal</h3>
                <p class="text-sm text-gray-600">Receitas e despesas ao longo do tempo</p>
              </div>
              <div class="h-[300px]">
                <ChartsBarChart :data="barChartData" />
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Transações Recentes</h3>
              <p class="text-sm text-gray-600">Últimas movimentações financeiras</p>
            </div>
            <TablesRecentTransactionsTable 
              :transactions="dashboard.recentTransactions" 
              :workspace-id="workspaceId"
              :show-actions="true"
              @refresh="refresh"
            />
          </div>
        </div>

        <!-- Modais -->
        <UiCreateTransactionModal 
          :open="isTransactionModalOpen" 
          :workspace-id="workspaceId"
          @update:open="isTransactionModalOpen = $event"
          @success="refresh"
        />
        
        <UiCreateCategoryModal 
          :open="isCategoryModalOpen" 
          :workspace-id="workspaceId"
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

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
        <div class="text-center">
          <Icon name="lucide:inbox" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Workspace não encontrado</h2>
          <p class="text-gray-600 mb-4">O workspace que você está procurando não existe ou foi removido.</p>
          <NuxtLink to="/workspaces">
            <button class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
              Voltar para a lista
            </button>
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>
