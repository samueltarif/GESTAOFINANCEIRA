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
  currentAccountBalance: number
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

// Filtro de mês (formato: YYYY-MM)
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

// Gerar lista de meses (últimos 12 meses + próximos 3)
const monthOptions = computed(() => {
  const options = []
  const today = new Date()
  
  // Últimos 12 meses (excluindo 2025)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    if (d.getFullYear() === 2025) continue
    
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  
  // Próximos 3 meses (excluindo 2025)
  for (let i = 1; i <= 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    if (d.getFullYear() === 2025) continue
    
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  
  return options
})

// Verificar se o ID é válido
const isValidId = workspaceId && workspaceId !== 'new' && workspaceId.length > 10

if (!isValidId) {
  await navigateTo('/workspaces')
  throw createError({ statusCode: 404, statusMessage: 'Workspace não encontrado' })
}

// Estados reativos
const workspace = ref<Workspace | null>(null)
const dashboard = ref<DashboardData | null>(null)
const dashboardLoading = ref(true)
const isTransactionModalOpen = ref(false)
const isCategoryModalOpen = ref(false)
const showManageAccountsModal = ref(false)
const showManageCategoriesModal = ref(false)
const showEditAccountModal = ref(false)
const showEditCategoryModal = ref(false)
const selectedAccount = ref<any>(null)
const selectedCategory = ref<any>(null)

// Buscar contas e categorias
const { data: accounts, refresh: refreshAccounts } = useLazyFetch('/api/accounts', {
  query: computed(() => ({ month: selectedMonth.value })),
  server: false
})

const { data: categories, refresh: refreshCategories } = useLazyFetch(`/api/categories`, {
  query: { workspace_id: workspaceId },
  server: false
})

// Carregar workspace
const loadWorkspace = async () => {
  try {
    const data = await $fetch<Workspace>(`/api/workspaces/${workspaceId}`)
    workspace.value = data
  } catch (error) {
    console.error('Erro ao carregar workspace:', error)
  }
}

// Carregar dashboard
const loadDashboard = async () => {
  try {
    dashboardLoading.value = true
    const data = await $fetch<DashboardData>(`/api/workspaces/${workspaceId}/dashboard`, {
      query: { month: selectedMonth.value }
    })
    dashboard.value = data
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
  } finally {
    dashboardLoading.value = false
  }
}

// Refresh completo
const refresh = async () => {
  await Promise.all([loadDashboard(), refreshAccounts(), refreshCategories()])
}

// Carregar dados em paralelo
onMounted(() => {
  Promise.all([loadWorkspace(), loadDashboard()])
})

// Recarregar dashboard quando o mês mudar
watch(selectedMonth, () => {
  loadDashboard()
})

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

function editAccount(account: any) {
  selectedAccount.value = account
  showEditAccountModal.value = true
}

function editCategory(category: any) {
  selectedCategory.value = category
  showEditCategoryModal.value = true
}

async function handleAccountSuccess() {
  showEditAccountModal.value = false
  await refreshAccounts()
  await loadDashboard()
}

async function handleCategorySuccess() {
  showEditCategoryModal.value = false
  await refreshCategories()
  await loadDashboard()
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
              :style="{ backgroundColor: workspace?.color || '#10B981' }"
            ></div>
            <h2 class="text-3xl font-bold text-gray-900">{{ workspace?.name || 'Carregando...' }}</h2>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <select 
            v-model="selectedMonth"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option v-for="option in monthOptions" :key="option.value" :value="option.value">
              📅 {{ option.label }}
            </option>
          </select>
          
          <button 
            @click="showManageAccountsModal = true"
            class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
          >
            ⚙️ Gerenciar Contas
          </button>
          <button 
            @click="showManageCategoriesModal = true"
            class="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
          >
            ⚙️ Gerenciar Categorias
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

      <!-- Dashboard Content com Skeleton -->
      <div class="space-y-6">
        <!-- KPI Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Saldo Atual -->
          <div class="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-purple-900">Saldo Atual</h3>
              <Icon name="lucide:briefcase" class="h-4 w-4 text-purple-600" />
            </div>
            <div v-if="dashboardLoading" class="h-8 w-32 bg-purple-200 rounded animate-pulse"></div>
            <div v-else class="text-2xl font-bold text-purple-900">{{ formatCurrency(dashboard?.currentAccountBalance || 0) }}</div>
            <p class="text-xs text-purple-700 mt-1">Nas contas</p>
          </div>

          <!-- Receitas -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-600">Receitas do Mês</h3>
              <Icon name="lucide:trending-up" class="h-4 w-4 text-gray-400" />
            </div>
            <div v-if="dashboardLoading" class="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div v-else class="text-2xl font-bold text-green-600">{{ formatCurrency(dashboard?.totalRevenue || 0) }}</div>
            <p class="text-xs text-gray-500 mt-1">+ Receitas</p>
          </div>

          <!-- Despesas -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-600">Despesas do Mês</h3>
              <Icon name="lucide:trending-down" class="h-4 w-4 text-gray-400" />
            </div>
            <div v-if="dashboardLoading" class="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div v-else class="text-2xl font-bold text-red-600">{{ formatCurrency(dashboard?.totalExpenses || 0) }}</div>
            <p class="text-xs text-gray-500 mt-1">- Despesas</p>
          </div>

          <!-- Lucro -->
          <div class="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-green-900">Lucro / Sobra</h3>
              <Icon name="lucide:piggy-bank" class="h-4 w-4 text-green-600" />
            </div>
            <div v-if="dashboardLoading" class="h-8 w-32 bg-green-200 rounded animate-pulse"></div>
            <div v-else class="text-2xl font-bold" :class="(dashboard?.profit || 0) >= 0 ? 'text-green-900' : 'text-red-600'">
              {{ formatCurrency(dashboard?.profit || 0) }}
            </div>
            <p class="text-xs text-green-700 mt-1">Saldo + Receitas - Despesas</p>
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
              <div v-if="dashboardLoading" class="flex items-center justify-center h-full">
                <div class="h-32 w-32 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <ChartsPieChart v-else :data="pieChartData" />
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Evolução Mensal</h3>
              <p class="text-sm text-gray-600">Receitas e despesas ao longo do tempo</p>
            </div>
            <div class="h-[300px]">
              <div v-if="dashboardLoading" class="space-y-2">
                <div v-for="i in 6" :key="i" class="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <ChartsBarChart v-else :data="barChartData" />
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Transações Recentes</h3>
            <p class="text-sm text-gray-600">Últimas movimentações financeiras</p>
          </div>
          <div v-if="dashboardLoading" class="space-y-3">
            <div v-for="i in 5" :key="i" class="h-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <TablesRecentTransactionsTable 
            v-else
            :transactions="dashboard?.recentTransactions || []" 
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

      <!-- Modal de Gerenciar Contas -->
      <div v-if="showManageAccountsModal" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="fixed inset-0 bg-black/80" @click="showManageAccountsModal = false"></div>
        <div class="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl" style="z-index: 9999;">
          <div class="border-b border-gray-200 px-6 py-4">
            <h2 class="text-xl font-semibold text-gray-900">Gerenciar Contas</h2>
            <p class="text-sm text-gray-600 mt-1">Contas do mês selecionado ({{ monthOptions.find(m => m.value === selectedMonth)?.label }})</p>
          </div>
          <div class="p-6 max-h-[60vh] overflow-y-auto">
            <div v-if="accounts && accounts.length > 0" class="space-y-3">
              <div
                v-for="account in accounts"
                :key="account.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div>
                  <h3 class="font-medium text-gray-900">{{ account.name }}</h3>
                  <p class="text-sm" :class="account.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                    Saldo: R$ {{ account.balance.toFixed(2) }}
                  </p>
                </div>
                <button
                  @click="editAccount(account)"
                  class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  ✏️ Editar
                </button>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <p class="text-gray-500">Nenhuma conta cadastrada</p>
            </div>
          </div>
          <div class="border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              @click="showManageAccountsModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Gerenciar Categorias -->
      <div v-if="showManageCategoriesModal" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="fixed inset-0 bg-black/80" @click="showManageCategoriesModal = false"></div>
        <div class="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl" style="z-index: 9999;">
          <div class="border-b border-gray-200 px-6 py-4">
            <h2 class="text-xl font-semibold text-gray-900">Gerenciar Categorias</h2>
            <p class="text-sm text-gray-600 mt-1">Categorias deste workspace</p>
          </div>
          <div class="p-6 max-h-[60vh] overflow-y-auto">
            <div v-if="categories && categories.length > 0" class="space-y-3">
              <div
                v-for="category in categories"
                :key="category.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full"
                    :style="{ backgroundColor: category.color }"
                  ></div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
                    <p class="text-sm text-gray-600">
                      {{ category.type === 'revenue' ? '💰 Receita' : '💸 Despesa' }}
                    </p>
                  </div>
                </div>
                <button
                  @click="editCategory(category)"
                  class="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  ✏️ Editar
                </button>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <p class="text-gray-500">Nenhuma categoria cadastrada neste workspace</p>
            </div>
          </div>
          <div class="border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              @click="showManageCategoriesModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      <!-- Modais de Edição -->
      <UiEditAccountModal
        v-model:open="showEditAccountModal"
        :account="selectedAccount"
        @success="handleAccountSuccess"
      />

      <UiEditCategoryModal
        v-model:open="showEditCategoryModal"
        :category="selectedCategory"
        :workspace-id="workspaceId"
        @success="handleCategorySuccess"
      />
    </main>
  </div>
</template>
