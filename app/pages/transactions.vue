<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()

// Tipos
interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: 'revenue' | 'expense'  // Corrigido: revenue ao invés de income
  category_id: string
  account_id: string
  category_name?: string
  account_name?: string
  workspace_id?: string
}

interface TransactionsResponse {
  transactions: Transaction[]
  total: number
}

// Filtros
const searchQuery = ref('')
const selectedType = ref<'all' | 'revenue' | 'expense'>('all')  // Corrigido: revenue ao invés de income
const selectedCategory = ref<string>('all')
const selectedAccount = ref<string>('all')
const selectedWorkspace = ref<string>('all')
const startDate = ref('')
const endDate = ref('')
const minAmount = ref<number | null>(null)
const maxAmount = ref<number | null>(null)

// Ordenação
const sortBy = ref<'date' | 'amount' | 'description'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Paginação
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Buscar dados para filtros
const { data: workspaces } = useLazyFetch('/api/workspaces', { server: false })
const { data: categories } = useLazyFetch('/api/categories', { server: false })
const { data: accounts } = useLazyFetch('/api/accounts', { server: false })

// Buscar transações com filtros
const { data: transactionsData, pending, refresh } = useLazyFetch<TransactionsResponse>('/api/transactions', {
  query: computed(() => ({
    search: searchQuery.value,
    type: selectedType.value !== 'all' ? selectedType.value : undefined,
    category_id: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    account_id: selectedAccount.value !== 'all' ? selectedAccount.value : undefined,
    workspace_id: selectedWorkspace.value !== 'all' ? selectedWorkspace.value : undefined,
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined,
    min_amount: minAmount.value || undefined,
    max_amount: maxAmount.value || undefined,
    sort_by: sortBy.value,
    sort_order: sortOrder.value,
    page: currentPage.value,
    limit: itemsPerPage.value
  })),
  server: false
})

// Transações filtradas e ordenadas
const transactions = computed(() => transactionsData.value?.transactions || [])
const totalTransactions = computed(() => transactionsData.value?.total || 0)
const totalPages = computed(() => Math.ceil(totalTransactions.value / itemsPerPage.value))

// Estatísticas
const stats = computed(() => {
  const txs = transactions.value
  const totalIncome = txs.filter((t: Transaction) => t.type === 'revenue').reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  const totalExpense = txs.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    count: txs.length
  }
})

// Limpar filtros
const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = 'all'
  selectedCategory.value = 'all'
  selectedAccount.value = 'all'
  selectedWorkspace.value = 'all'
  startDate.value = ''
  endDate.value = ''
  minAmount.value = null
  maxAmount.value = null
  currentPage.value = 1
}

// Exportar para CSV
const exportToCSV = () => {
  const headers = ['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor']
  const rows = transactions.value.map((t: Transaction) => [
    t.date,
    t.description,
    t.category_name || '',
    t.account_name || '',
    t.type === 'revenue' ? 'Receita' : 'Despesa',
    t.amount.toFixed(2)
  ])
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

// Modal de edição
const showEditModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

const editTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  showEditModal.value = true
}

const handleEditSuccess = () => {
  showEditModal.value = false
  refresh()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div class="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl">💰</span>
          <h1 class="text-xl font-bold text-gray-900">Transações</h1>
        </div>
        
        <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard">
            <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              ← Dashboard
            </button>
          </NuxtLink>
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
            <span class="text-sm font-medium text-green-700">
              {{ user?.email?.charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Estatísticas -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-sm text-gray-600">Total de Transações</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.count }}</p>
        </div>
        <div class="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
          <p class="text-sm text-green-700">Receitas</p>
          <p class="text-2xl font-bold text-green-600">{{ formatCurrency(stats.totalIncome) }}</p>
        </div>
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <p class="text-sm text-red-700">Despesas</p>
          <p class="text-2xl font-bold text-red-600">{{ formatCurrency(stats.totalExpense) }}</p>
        </div>
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p class="text-sm text-blue-700">Saldo</p>
          <p class="text-2xl font-bold" :class="stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'">
            {{ formatCurrency(stats.balance) }}
          </p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Filtros Avançados</h2>
          <div class="flex gap-2">
            <button
              @click="clearFilters"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              @click="exportToCSV"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              📥 Exportar CSV
            </button>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Busca por texto -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Descrição..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <!-- Tipo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              v-model="selectedType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todos</option>
              <option value="revenue">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          <!-- Categoria -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              v-model="selectedCategory"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todas</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Conta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Conta</label>
            <select
              v-model="selectedAccount"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todas</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>

          <!-- Workspace -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Workspace</label>
            <select
              v-model="selectedWorkspace"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todos</option>
              <option v-for="ws in workspaces" :key="ws.id" :value="ws.id">
                {{ ws.name }}
              </option>
            </select>
          </div>

          <!-- Data Início -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              v-model="startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <!-- Data Fim -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              v-model="endDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <!-- Valor Mínimo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo</label>
            <input
              v-model.number="minAmount"
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <!-- Valor Máximo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor Máximo</label>
            <input
              v-model.number="maxAmount"
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <!-- Ordenação -->
        <div class="flex gap-4 mt-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
            <select
              v-model="sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="date">Data</option>
              <option value="amount">Valor</option>
              <option value="description">Descrição</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
            <select
              v-model="sortOrder"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabela de Transações -->
      <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Resultados ({{ totalTransactions }} transações)
          </h2>

          <!-- Loading -->
          <div v-if="pending" class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          </div>

          <!-- Tabela -->
          <div v-else-if="transactions.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Descrição</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Categoria</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Conta</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                  <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                  <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="tx in transactions"
                  :key="tx.id"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4 text-sm text-gray-700">{{ formatDate(tx.date) }}</td>
                  <td class="py-3 px-4 text-sm text-gray-900 font-medium">{{ tx.description }}</td>
                  <td class="py-3 px-4 text-sm text-gray-600">{{ tx.category_name }}</td>
                  <td class="py-3 px-4 text-sm text-gray-600">{{ tx.account_name }}</td>
                  <td class="py-3 px-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="tx.type === 'revenue' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'"
                    >
                      {{ tx.type === 'revenue' ? 'Receita' : 'Despesa' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right text-sm font-semibold" :class="tx.type === 'revenue' ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(tx.amount) }}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button
                      @click="editTransaction(tx)"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Paginação -->
            <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                Página {{ currentPage }} de {{ totalPages }}
              </p>
              <div class="flex gap-2">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <Icon name="lucide:inbox" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">Nenhuma transação encontrada com os filtros aplicados</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Edição -->
    <UiEditTransactionModal
      v-if="selectedTransaction"
      v-model:open="showEditModal"
      :transaction="selectedTransaction"
      :workspace-id="selectedTransaction.workspace_id || ''"
      @success="handleEditSuccess"
    />
  </div>
</template>
