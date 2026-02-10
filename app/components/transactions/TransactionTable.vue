<script setup lang="ts">
// Tipos
interface Transaction {
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

// Props
interface Props {
  transactions: Transaction[]
  loading?: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'edit': [transaction: Transaction]
}>()

// Funções de formatação
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

// Função para editar
const handleEdit = (transaction: Transaction) => {
  emit('edit', transaction)
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="p-6">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
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
                  @click="handleEdit(tx)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Icon name="lucide:inbox" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">Nenhuma transação encontrada com os filtros aplicados</p>
      </div>
    </div>
  </div>
</template>
