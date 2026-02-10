<script setup lang="ts">
interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface Props {
  open: boolean
  transaction: {
    id: string
    description: string
    amount: number
    date: string
    type: 'revenue' | 'expense'
    category_id: string
    account_id: string
  } | null
  workspaceId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const isOpen = computed({
  get: () => {
    console.log('🟢 Modal isOpen get:', props.open)
    return props.open
  },
  set: (value) => {
    console.log('🟢 Modal isOpen set:', value)
    emit('update:open', value)
  }
})

const form = ref({
  description: '',
  amount: 0,
  date: '',
  type: 'expense' as 'revenue' | 'expense',
  category_id: '',
  account_id: ''
})

const isSubmitting = ref(false)

// Carregar contas e categorias
const { data: accounts } = await useFetch<Account[]>('/api/accounts', {
  query: { workspace_id: props.workspaceId }
})

const { data: categories } = await useFetch<Category[]>('/api/categories', {
  query: { workspace_id: props.workspaceId }
})

// Atualizar form quando transaction mudar
watch(() => props.transaction, (newTransaction) => {
  console.log('🟡 Transaction mudou:', newTransaction)
  if (newTransaction) {
    form.value = {
      description: newTransaction.description,
      amount: newTransaction.amount,
      date: newTransaction.date,
      type: newTransaction.type,
      category_id: newTransaction.category_id,
      account_id: newTransaction.account_id
    }
    console.log('🟡 Form atualizado:', form.value)
  }
}, { immediate: true })

const handleSubmit = async () => {
  console.log('🟢 handleSubmit chamado')
  console.log('🟢 form.value:', form.value)
  console.log('🟢 props.transaction:', props.transaction)
  
  if (!props.transaction?.id) {
    console.log('❌ Sem transaction.id')
    alert('Erro: ID da transação não encontrado')
    return
  }
  
  if (!form.value.description.trim()) {
    console.log('❌ Descrição vazia')
    alert('Por favor, preencha a descrição')
    return
  }
  
  if (form.value.amount <= 0) {
    console.log('❌ Valor inválido')
    alert('Por favor, insira um valor maior que zero')
    return
  }

  isSubmitting.value = true
  console.log('🟢 Iniciando requisição PUT...')

  try {
    const body = {
      description: form.value.description.trim(),
      amount: form.value.amount,
      date: form.value.date,
      type: form.value.type,
      category_id: form.value.category_id,
      account_id: form.value.account_id,
      workspace_id: props.workspaceId
    }
    
    console.log('🟢 Body da requisição:', body)
    
    const result = await $fetch(`/api/transactions/${props.transaction.id}`, {
      method: 'PUT',
      credentials: 'include',
      body
    })
    
    console.log('✅ Transação atualizada com sucesso:', result)

    isOpen.value = false
    emit('success')
  } catch (error: any) {
    console.error('❌ Erro ao atualizar transação:', error)
    alert(`Erro ao atualizar transação: ${error.message || 'Erro desconhecido'}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- Modal de Edição -->
  <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center" style="position: fixed !important;">
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-black/80"
      style="position: fixed !important; z-index: 9998;"
      @click="isOpen = false"
    ></div>
    
    <!-- Modal -->
    <div class="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl" style="z-index: 9999;">
      <!-- Header -->
      <div class="border-b border-gray-200 px-6 py-4">
        <h2 class="text-xl font-semibold text-gray-900">Editar Transação</h2>
        <p class="text-sm text-gray-600 mt-1">Atualize os dados da transação</p>
      </div>
        
        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Descrição -->
          <div class="space-y-2">
            <label for="description" class="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <input
              id="description"
              v-model="form.description"
              type="text"
              placeholder="Ex: Compra no supermercado"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Valor -->
          <div class="space-y-2">
            <label for="amount" class="block text-sm font-medium text-gray-700">
              Valor (R$)
            </label>
            <input
              id="amount"
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Data -->
          <div class="space-y-2">
            <label for="date" class="block text-sm font-medium text-gray-700">
              Data
            </label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Tipo (somente leitura) -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Tipo</label>
            <div class="p-3 border border-gray-300 rounded-lg bg-gray-50">
              <span class="text-sm font-medium" :class="form.type === 'revenue' ? 'text-green-600' : 'text-red-600'">
                {{ form.type === 'revenue' ? '✓ Receita' : '✓ Despesa' }}
              </span>
            </div>
            <p class="text-xs text-gray-500">O tipo da transação não pode ser alterado</p>
          </div>

          <!-- Conta -->
          <div class="space-y-2">
            <label for="account" class="block text-sm font-medium text-gray-700">
              Conta
            </label>
            <select
              id="account"
              v-model="form.account_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecione uma conta</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>

          <!-- Categoria -->
          <div class="space-y-2">
            <label for="category" class="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <select
              id="category"
              v-model="form.category_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </form>

        <!-- Footer -->
        <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            @click="isOpen = false"
            :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting || !form.description.trim() || form.amount <= 0"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
    </div>
  </div>
</template>
