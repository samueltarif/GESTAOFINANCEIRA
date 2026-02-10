// Tipos
export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: 'revenue' | 'expense'
  category_id: string
  account_id: string
  category_name?: string
  account_name?: string
  workspace_id?: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
}

export interface FilterValues {
  searchQuery: string
  selectedType: 'all' | 'revenue' | 'expense'
  selectedCategory: string
  selectedAccount: string
  selectedWorkspace: string
  startDate: string
  endDate: string
  minAmount: number | null
  maxAmount: number | null
  sortBy: 'date' | 'amount' | 'description'
  sortOrder: 'asc' | 'desc'
}

export interface TransactionStats {
  totalIncome: number
  totalExpense: number
  balance: number
  count: number
}

/**
 * Composable para gerenciar transações
 */
export function useTransactions() {
  // Estado dos filtros
  const filters = ref<FilterValues>({
    searchQuery: '',
    selectedType: 'all',
    selectedCategory: 'all',
    selectedAccount: 'all',
    selectedWorkspace: 'all',
    startDate: '',
    endDate: '',
    minAmount: null,
    maxAmount: null,
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Paginação
  const currentPage = ref(1)
  const itemsPerPage = ref(20)

  // Buscar transações com filtros
  const { data: transactionsData, pending, refresh } = useLazyFetch<TransactionsResponse>('/api/transactions', {
    query: computed(() => ({
      search: filters.value.searchQuery || undefined,
      type: filters.value.selectedType !== 'all' ? filters.value.selectedType : undefined,
      category_id: filters.value.selectedCategory !== 'all' ? filters.value.selectedCategory : undefined,
      account_id: filters.value.selectedAccount !== 'all' ? filters.value.selectedAccount : undefined,
      workspace_id: filters.value.selectedWorkspace !== 'all' ? filters.value.selectedWorkspace : undefined,
      start_date: filters.value.startDate || undefined,
      end_date: filters.value.endDate || undefined,
      min_amount: filters.value.minAmount || undefined,
      max_amount: filters.value.maxAmount || undefined,
      sort_by: filters.value.sortBy,
      sort_order: filters.value.sortOrder,
      page: currentPage.value,
      limit: itemsPerPage.value
    })),
    server: false
  })

  // Computed
  const transactions = computed(() => transactionsData.value?.transactions || [])
  const totalTransactions = computed(() => transactionsData.value?.total || 0)
  const totalPages = computed(() => Math.ceil(totalTransactions.value / itemsPerPage.value))

  // Estatísticas
  const stats = computed<TransactionStats>(() => {
    const txs = transactions.value
    const totalIncome = txs
      .filter((t: Transaction) => t.type === 'revenue')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
    const totalExpense = txs
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: txs.length
    }
  })

  // Funções
  const clearFilters = () => {
    filters.value = {
      searchQuery: '',
      selectedType: 'all',
      selectedCategory: 'all',
      selectedAccount: 'all',
      selectedWorkspace: 'all',
      startDate: '',
      endDate: '',
      minAmount: null,
      maxAmount: null,
      sortBy: 'date',
      sortOrder: 'desc'
    }
    currentPage.value = 1
  }

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

  return {
    // Estado
    filters,
    currentPage,
    itemsPerPage,
    
    // Dados
    transactions,
    totalTransactions,
    totalPages,
    stats,
    pending,
    
    // Funções
    clearFilters,
    exportToCSV,
    refresh
  }
}
