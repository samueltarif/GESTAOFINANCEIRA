<script setup lang="ts">
import LogoutButton from '@/components/LogoutButton.vue'

definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()

// Filtro de mês (formato: YYYY-MM)
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

// Modal de criação de conta
const isAccountModalOpen = ref(false)

// Buscar dados do dashboard com lazy loading
const { data: dashboardData, pending, refresh } = useLazyFetch('/api/dashboard/global', {
  query: computed(() => ({ month: selectedMonth.value })),
  server: false, // Desabilita SSR para essa chamada
  lazy: true
})

// Gerar lista de meses (últimos 12 meses + próximos 3)
const monthOptions = computed(() => {
  const options = []
  const today = new Date()
  
  // Últimos 12 meses (excluindo 2025)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    // Pular meses de 2025
    if (d.getFullYear() === 2025) continue
    
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  
  // Próximos 3 meses (excluindo 2025)
  for (let i = 1; i <= 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    // Pular meses de 2025
    if (d.getFullYear() === 2025) continue
    
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  
  return options
})

const pieChartData = computed(() => ({
  labels: dashboardData.value?.expensesByCategory.labels || [],
  datasets: [{
    data: dashboardData.value?.expensesByCategory.data || [],
    backgroundColor: dashboardData.value?.expensesByCategory.colors || []
  }]
}))

const barChartData = computed(() => ({
  labels: dashboardData.value?.monthlyEvolution.labels || [],
  datasets: [
    {
      label: 'Receitas',
      data: dashboardData.value?.monthlyEvolution.revenues || [],
      backgroundColor: '#22c55e'
    },
    {
      label: 'Despesas',
      data: dashboardData.value?.monthlyEvolution.expenses || [],
      backgroundColor: '#ef4444'
    }
  ]
}))

const lineChartData = computed(() => ({
  labels: dashboardData.value?.monthlyEvolution.labels || [],
  datasets: [
    {
      label: 'Receitas',
      data: dashboardData.value?.monthlyEvolution.revenues || [],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Despesas',
      data: dashboardData.value?.monthlyEvolution.expenses || [],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
}))

const trendChartData = computed(() => {
  const labels = dashboardData.value?.monthlyEvolution.labels || []
  const revenues = dashboardData.value?.monthlyEvolution.revenues || []
  const expenses = dashboardData.value?.monthlyEvolution.expenses || []
  
  // Calcular lucro mensal
  const profit = revenues.map((rev, i) => rev - (expenses[i] || 0))
  
  return {
    labels,
    datasets: [
      {
        label: 'Lucro Mensal',
        data: profit,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
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
          <LogoutButton />
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-gray-900">Dashboard Global</h2>
          <p class="text-gray-600">Visão geral das suas finanças</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <!-- Filtro de Mês -->
          <select 
            v-model="selectedMonth"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option v-for="option in monthOptions" :key="option.value" :value="option.value">
              📅 {{ option.label }}
            </option>
          </select>
          
          <NuxtLink to="/workspaces">
            <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Ver Workspaces
            </button>
          </NuxtLink>
          <button 
            @click="isAccountModalOpen = true"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            + Nova Conta
          </button>
          <NuxtLink to="/workspaces/new">
            <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors">
              + Novo Workspace
            </button>
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-2">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          <p class="text-sm text-gray-600">Carregando dados...</p>
        </div>
      </div>

      <!-- Dashboard Content -->
      <template v-else-if="dashboardData">
        <!-- KPI Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Saldo Atual das Contas -->
          <div class="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-purple-900">Saldo Atual</h3>
              <Icon name="lucide:briefcase" class="h-4 w-4 text-purple-600" />
            </div>
            <div class="text-2xl font-bold text-purple-900">{{ formatCurrency(dashboardData.currentAccountBalance) }}</div>
            <p class="text-xs text-purple-700 mt-1">Nas contas</p>
          </div>

          <!-- Total de Receitas -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-600">Receitas do Mês</h3>
              <Icon name="lucide:trending-up" class="h-4 w-4 text-gray-400" />
            </div>
            <div class="text-2xl font-bold text-green-600">{{ formatCurrency(dashboardData.totalRevenue) }}</div>
            <p class="text-xs text-gray-500 mt-1">+ Receitas</p>
          </div>

          <!-- Total de Despesas -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-600">Despesas do Mês</h3>
              <Icon name="lucide:trending-down" class="h-4 w-4 text-gray-400" />
            </div>
            <div class="text-2xl font-bold text-red-600">{{ formatCurrency(dashboardData.totalExpenses) }}</div>
            <p class="text-xs text-gray-500 mt-1">- Despesas</p>
          </div>

          <!-- Lucro / Sobra (Saldo Final) -->
          <div class="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-green-900">Lucro / Sobra</h3>
              <Icon name="lucide:piggy-bank" class="h-4 w-4 text-green-600" />
            </div>
            <div class="text-2xl font-bold" :class="dashboardData.profit >= 0 ? 'text-green-900' : 'text-red-600'">
              {{ formatCurrency(dashboardData.profit) }}
            </div>
            <p class="text-xs text-green-700 mt-1">Saldo + Receitas - Despesas</p>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Pie Chart -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Gastos por Categoria</h3>
              <p class="text-sm text-gray-600">Distribuição das suas despesas</p>
            </div>
            <div class="h-[300px]">
              <ClientOnly>
                <ChartsPieChart :data="pieChartData" />
              </ClientOnly>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Evolução Mensal</h3>
              <p class="text-sm text-gray-600">Receitas e despesas ao longo do tempo</p>
            </div>
            <div class="h-[300px]">
              <ClientOnly>
                <ChartsBarChart :data="barChartData" />
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- New Charts: Timeline and Trends -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Line Chart - Timeline -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Linha do Tempo</h3>
              <p class="text-sm text-gray-600">Evolução detalhada das suas finanças</p>
            </div>
            <div class="h-[300px]">
              <ClientOnly>
                <ChartsLineChart :data="lineChartData" />
              </ClientOnly>
            </div>
          </div>

          <!-- Trend Chart -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Análise de Tendências</h3>
              <p class="text-sm text-gray-600">Projeção baseada em dados históricos</p>
            </div>
            <div class="h-[300px]">
              <ClientOnly>
                <ChartsTrendChart :data="trendChartData" :show-trend="true" />
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- New Charts: Timeline and Trends -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Line Chart - Timeline -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Linha do Tempo</h3>
              <p class="text-sm text-gray-600">Evolução detalhada das finanças</p>
            </div>
            <div class="h-[300px]">
              <ClientOnly>
                <ChartsLineChart :data="barChartData" />
              </ClientOnly>
            </div>
          </div>

          <!-- Trend Chart -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Análise de Tendências</h3>
              <p class="text-sm text-gray-600">Projeção baseada em dados históricos</p>
            </div>
            <div class="h-[300px]">
              <ClientOnly>
                <ChartsTrendChart :data="barChartData" :show-trend-line="true" />
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Transações Recentes</h3>
            <p class="text-sm text-gray-600">Últimas movimentações financeiras ({{ dashboardData.recentTransactions?.length || 0 }} transações)</p>
          </div>
          
          <div v-if="dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Descrição</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Categoria</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                  <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                  <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">Impacto no Lucro</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="tx in dashboardData.recentTransactions" 
                  :key="tx.id"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4 text-sm text-gray-700">{{ tx.date }}</td>
                  <td class="py-3 px-4 text-sm text-gray-900 font-medium">{{ tx.description || '-' }}</td>
                  <td class="py-3 px-4 text-sm text-gray-600">{{ tx.category }}</td>
                  <td class="py-3 px-4">
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="tx.type === 'revenue' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'"
                    >
                      {{ tx.type === 'revenue' ? 'Receita' : 'Despesa' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right text-sm font-semibold" :class="tx.type === 'revenue' ? 'text-green-600' : 'text-red-600'">
                    R$ {{ (tx.amount || 0).toFixed(2) }}
                  </td>
                  <td class="py-3 px-4 text-right text-sm font-bold" :class="tx.type === 'revenue' ? 'text-green-600' : 'text-red-600'">
                    {{ tx.type === 'revenue' ? '+' : '-' }} R$ {{ (tx.amount || 0).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="text-center py-12">
            <div class="flex flex-col items-center gap-2">
              <Icon name="lucide:inbox" class="h-12 w-12 text-gray-300" />
              <p class="text-gray-500 text-sm">Nenhuma transação encontrada</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="rounded-lg border border-gray-200 bg-white p-12 shadow-sm text-center">
        <Icon name="lucide:inbox" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Nenhum dado disponível</h3>
        <p class="text-sm text-gray-600 mb-4">Comece criando um workspace e adicionando transações</p>
        <NuxtLink to="/workspaces/new">
          <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors">
            Criar Primeiro Workspace
          </button>
        </NuxtLink>
      </div>
    </main>

    <!-- Modal de Criação de Conta -->
    <UiCreateAccountModal 
      :open="isAccountModalOpen"
      :month="selectedMonth"
      @update:open="isAccountModalOpen = $event"
      @success="refresh"
    />
  </div>
</template>
