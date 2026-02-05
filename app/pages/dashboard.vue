<script setup lang="ts">
import LogoutButton from '@/components/LogoutButton.vue'

definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()
const { data: dashboardData, pending } = await useFetch('/api/dashboard/global')

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
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <!-- Header simples com logout -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-primary">💰 Controle Financeiro</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- User Info -->
            <div class="flex items-center gap-2 text-sm">
              <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span class="text-primary font-medium">
                  {{ user?.email?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="text-gray-600">{{ user?.email }}</span>
            </div>
            
            <!-- Logout Button -->
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
    
    <div class="p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header da página -->
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold">Dashboard Global</h1>
          <div class="flex gap-2">
            <NuxtLink to="/workspaces">
              <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Ver Workspaces
              </button>
            </NuxtLink>
            <NuxtLink to="/workspaces/new">
              <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90">
                + Novo Workspace
              </button>
            </NuxtLink>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="flex items-center justify-center py-12">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>

        <template v-else-if="dashboardData">
          <!-- KPIs -->
          <GlobalBalanceSummary
            :total-balance="dashboardData.totalBalance"
            :total-revenue="dashboardData.totalRevenue"
            :total-expenses="dashboardData.totalExpenses"
            :profit="dashboardData.profit"
          />

          <!-- Gráficos -->
          <div class="grid gap-6 lg:grid-cols-2">
            <GlobalPieExpenses :data="pieChartData" />
            <GlobalBarMonthly :data="barChartData" />
          </div>

          <!-- Transações Recentes -->
          <RecentTransactionsTable :transactions="dashboardData.recentTransactions" />
        </template>
      </div>
    </div>
  </div>
</template>