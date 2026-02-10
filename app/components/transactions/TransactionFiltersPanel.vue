<script setup lang="ts">
// Tipos
interface Workspace {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface Account {
  id: string
  name: string
}

interface FilterValues {
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

// Props
interface Props {
  workspaces?: Workspace[]
  categories?: Category[]
  accounts?: Account[]
  modelValue: FilterValues
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: FilterValues]
  'clear': []
  'export': []
}>()

// Computed para v-model
const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Funções
const clearFilters = () => emit('clear')
const exportCSV = () => emit('export')
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <!-- Header -->
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
          @click="exportCSV"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          📥 Exportar CSV
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Busca por texto -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
        <input
          v-model="filters.searchQuery"
          type="text"
          placeholder="Descrição..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <!-- Tipo -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select
          v-model="filters.selectedType"
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
          v-model="filters.selectedCategory"
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
          v-model="filters.selectedAccount"
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
          v-model="filters.selectedWorkspace"
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
          v-model="filters.startDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <!-- Data Fim -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
        <input
          v-model="filters.endDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <!-- Valor Mínimo -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo</label>
        <input
          v-model.number="filters.minAmount"
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
          v-model.number="filters.maxAmount"
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
          v-model="filters.sortBy"
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
          v-model="filters.sortOrder"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="desc">Decrescente</option>
          <option value="asc">Crescente</option>
        </select>
      </div>
    </div>
  </div>
</template>
