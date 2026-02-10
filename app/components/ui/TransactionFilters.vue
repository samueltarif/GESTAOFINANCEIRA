<script setup lang="ts">
interface Props {
  workspaceId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'filter': [filters: TransactionFilters]
  'reset': []
}>()

interface TransactionFilters {
  search?: string
  type?: 'revenue' | 'expense' | ''
  category_id?: string
  account_id?: string
  date_from?: string
  date_to?: string
  amount_min?: number
  amount_max?: number
}

// Estados dos filtros
const filters = ref<TransactionFilters>({
  search: '',
  type: '',
  category_id: '',
  account_id: '',
  date_from: '',
  date_to: '',
  amount_min: undefined,
  amount_max: undefined
})

// Buscar contas e categorias
const { data: accounts } = useLazyFetch('/api/accounts', { server: false })
const { data: categories } = useLazyFetch('/api/categories', {
  query: props.workspaceId ? { workspace_id: props.workspaceId } : {},
  server: false
})

// Aplicar filtros
const applyFilters = () => {
  // Remover campos vazios
  const activeFilters: TransactionFilters = {}
  
  if (filters.value.search?.trim()) activeFilters.search = filters.value.search.trim()
  if (filters.value.type) activeFilters.type = filters.value.type
  if (filters.value.category_id) activeFilters.category_id = filters.value.category_id
  if (filters.value.account_id) activeFilters.account_id = filters.value.account_id
  if (filters.value.date_from) activeFilters.date_from = filters.value.date_from
  if (filters.value.date_to) activeFilters.date_to = filters.value.date_to
  if (filters.value.amount_min !== undefined && filters.value.amount_min !== null) {
    activeFilters.amount_min = filters.value.amount_min
  }
  if (filters.value.amount_max !== undefined && filters.value.amount_max !== null) {
    activeFilters.amount_max = filters.value.amount_max
  }
  
  emit('filter', activeFilters)
}

// Resetar filtros
const resetFilters = () => {
  filters.value = {
    search: '',
    type: '',
    category_id: '',
    account_id: '',
    date_from: '',
    date_to: '',
    amount_min: undefined,
    amount_max: undefined
  }
  emit('reset')
}

// Contador de filtros ativos
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.search?.trim()) count++
  if (filters.value.type) count++
  if (filters.value.category_id) count++
  if (filters.value.account_id) count++
  if (filters.value.date_from) count++
  if (filters.value.date_to) count++
  if (filters.value.amount_min !== undefined && filters.value.amount_min !== null) count++
  if (filters.value.amount_max !== undefined && filters.value.amount_max !== null) count++
  return count
})

// Mostrar/ocultar filtros avançados
const showAdvancedFilters = ref(false)
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
    <!-- Filtros Básicos -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Busca por descrição -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Buscar
        </label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Descrição da transação..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          @keyup.enter="applyFilters"
        />
      </div>

      <!-- Tipo -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          v-model="filters.type"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        >
          <option value="">Todos</option>
          <option value="revenue">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
      </div>

      <!-- Categoria -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <select
          v-model="filters.category_id"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        >
          <option value="">Todas</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Conta -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Conta
        </label>
        <select
          v-model="filters.account_id"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        >
          <option value="">Todas</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Toggle Filtros Avançados -->
    <button
      @click="showAdvancedFilters = !showAdvancedFilters"
      class="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
    >
      <Icon :name="showAdvancedFilters ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="h-4 w-4" />
      {{ showAdvancedFilters ? 'Ocultar' : 'Mostrar' }} filtros avançados
    </button>

    <!-- Filtros Avançados -->
    <div v-if="showAdvancedFilters" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-gray-200">
      <!-- Data Inicial -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Data Inicial
        </label>
        <input
          v-model="filters.date_from"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      <!-- Data Final -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Data Final
        </label>
        <input
          v-model="filters.date_to"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      <!-- Valor Mínimo -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Valor Mínimo (R$)
        </label>
        <input
          v-model.number="filters.amount_min"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      <!-- Valor Máximo -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Valor Máximo (R$)
        </label>
        <input
          v-model.number="filters.amount_max"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>
    </div>

    <!-- Botões de Ação -->
    <div class="flex items-center justify-between pt-2">
      <div class="text-sm text-gray-600">
        <span v-if="activeFiltersCount > 0">
          {{ activeFiltersCount }} filtro{{ activeFiltersCount > 1 ? 's' : '' }} ativo{{ activeFiltersCount > 1 ? 's' : '' }}
        </span>
        <span v-else>
          Nenhum filtro ativo
        </span>
      </div>
      <div class="flex gap-2">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpar
        </button>
        <button
          @click="applyFilters"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  </div>
</template>
