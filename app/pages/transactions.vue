<script setup lang="ts">
import type { Transaction } from '~/composables/useTransactions'

definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()

// Usar o composable de transações
const {
  filters,
  currentPage,
  transactions,
  totalTransactions,
  totalPages,
  stats,
  pending,
  clearFilters,
  exportToCSV,
  refresh
} = useTransactions()

// Buscar dados para filtros
const { data: workspaces } = useLazyFetch('/api/workspaces', { server: false })
const { data: categories } = useLazyFetch('/api/categories', { server: false })
const { data: accounts } = useLazyFetch('/api/accounts', { server: false })

// Modal de edição
const showEditModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

const handleEdit = (transaction: Transaction) => {
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
      <TransactionsTransactionStats
        :count="stats.count"
        :total-income="stats.totalIncome"
        :total-expense="stats.totalExpense"
        :balance="stats.balance"
      />

      <!-- Filtros -->
      <TransactionsTransactionFiltersPanel
        v-model="filters"
        :workspaces="workspaces"
        :categories="categories"
        :accounts="accounts"
        @clear="clearFilters"
        @export="exportToCSV"
      />

      <!-- Tabela -->
      <div class="space-y-4">
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Resultados ({{ totalTransactions }} transações)
          </h2>
          
          <TransactionsTransactionTable
            :transactions="transactions"
            :loading="pending"
            @edit="handleEdit"
          />

          <!-- Paginação -->
          <TransactionsTransactionPagination
            v-model:current-page="currentPage"
            :total-pages="totalPages"
            :total-items="totalTransactions"
          />
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
