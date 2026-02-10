<script setup lang="ts">
interface Transaction {
  id: string
  date: string
  description: string
  category: string
  category_id?: string
  account_id?: string
  type: 'revenue' | 'expense'
  amount: number
}

interface Props {
  transactions: Transaction[]
  workspaceId?: string
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false
})

const emit = defineEmits<{
  'refresh': []
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getTypeColor = (type: string) => {
  return type === 'revenue' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
}

const getTypeLabel = (type: string) => {
  return type === 'revenue' ? 'Receita' : 'Despesa'
}

// Funcionalidade de edição/exclusão
const isEditModalOpen = ref(false)
const selectedTransaction = ref<{
  id: string
  description: string
  amount: number
  date: string
  type: 'revenue' | 'expense'
  category_id: string
  account_id: string
} | null>(null)
const isDeleting = ref<string | null>(null)
const toast = useToast()

const handleEdit = (transaction: Transaction) => {
  console.log('🔵 Clicou em editar:', transaction)
  
  if (!transaction.category_id || !transaction.account_id) {
    console.log('❌ Transação sem category_id ou account_id')
    alert('Esta transação não possui categoria ou conta associada e não pode ser editada.')
    return
  }
  
  selectedTransaction.value = {
    id: transaction.id,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date,
    type: transaction.type,
    category_id: transaction.category_id,
    account_id: transaction.account_id
  }
  
  console.log('✅ selectedTransaction definido:', selectedTransaction.value)
  isEditModalOpen.value = true
  console.log('✅ Modal aberto:', isEditModalOpen.value)
}

const handleDelete = async (transactionId: string) => {
  if (!confirm('Tem certeza que deseja excluir esta transação?')) {
    return
  }

  isDeleting.value = transactionId

  try {
    console.log('🗑️ Deletando transação:', transactionId)
    
    // Verificar sessão
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('❌ Sem sessão ativa')
      toast.error('Sessão expirada. Por favor, faça login novamente.')
      setTimeout(() => navigateTo('/login'), 2000)
      return
    }
    
    console.log('✅ Sessão ativa:', session.user.email)
    
    await $fetch(`/api/transactions/${transactionId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    console.log('✅ Transação deletada com sucesso')
    
    // Mostrar toast de sucesso
    toast.success('Transação excluída com sucesso!')
    
    emit('refresh')
  } catch (error) {
    console.error('Erro ao excluir transação:', error)
    toast.error('Erro ao excluir transação. Tente novamente.')
  } finally {
    isDeleting.value = null
  }
}

const handleEditSuccess = () => {
  isEditModalOpen.value = false
  selectedTransaction.value = null
  emit('refresh')
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
          <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Descrição</th>
          <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Categoria</th>
          <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
          <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
          <th v-if="showActions" class="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!transactions || transactions.length === 0">
          <td :colspan="showActions ? 6 : 5" class="text-center py-12">
            <div class="flex flex-col items-center gap-2">
              <Icon name="lucide:inbox" class="h-12 w-12 text-gray-300" />
              <p class="text-gray-500 text-sm">Nenhuma transação encontrada</p>
            </div>
          </td>
        </tr>
        <tr 
          v-for="transaction in transactions" 
          :key="transaction.id"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <td class="py-3 px-4 text-sm text-gray-700">
            {{ formatDate(transaction.date) }}
          </td>
          <td class="py-3 px-4 text-sm text-gray-900 font-medium">
            {{ transaction.description || '-' }}
          </td>
          <td class="py-3 px-4 text-sm text-gray-600">
            {{ transaction.category }}
          </td>
          <td class="py-3 px-4">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getTypeColor(transaction.type)"
            >
              {{ getTypeLabel(transaction.type) }}
            </span>
          </td>
          <td class="py-3 px-4 text-right text-sm font-semibold" :class="transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'">
            {{ formatCurrency(transaction.amount) }}
          </td>
          <td v-if="showActions" class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button
                @click="handleEdit(transaction)"
                class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Icon name="lucide:pencil" class="h-4 w-4" />
              </button>
              <button
                @click="handleDelete(transaction.id)"
                :disabled="isDeleting === transaction.id"
                class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Excluir"
              >
                <Icon v-if="isDeleting === transaction.id" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                <Icon v-else name="lucide:trash-2" class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de Edição -->
    <UiEditTransactionModal
      v-if="showActions && workspaceId"
      :open="isEditModalOpen"
      :transaction="selectedTransaction"
      :workspace-id="workspaceId"
      @update:open="isEditModalOpen = $event"
      @success="handleEditSuccess"
    />
    
    <!-- Toast de Notificação -->
    <UiToast
      v-model:show="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
    />
  </div>
</template>
