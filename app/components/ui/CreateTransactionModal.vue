<script setup lang="ts">
interface Props {
  open: boolean
  workspaceId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const form = ref({
  type: 'expense' as 'revenue' | 'expense',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  account_id: '',
  category_id: ''
})

const isSubmitting = ref(false)
const accounts = ref<any[]>([])
const categories = ref<any[]>([])
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Buscar contas e categorias quando o modal abrir
watch(() => props.open, async (isOpen) => {
  if (isOpen && props.workspaceId) {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        $fetch(`/api/accounts`, { credentials: 'include' }),
        $fetch(`/api/categories?workspace_id=${props.workspaceId}`, { credentials: 'include' })
      ])
      accounts.value = accountsRes || []
      categories.value = categoriesRes || []
      
      console.log('📊 Contas carregadas:', accounts.value.length)
      console.log('📊 Categorias carregadas:', categories.value.length)
    } catch (error) {
      console.error('Erro ao buscar contas e categorias:', error)
    }
  }
})

const filteredCategories = computed(() => {
  return categories.value?.filter((cat: any) => cat.type === form.value.type) || []
})

const handleSubmit = async () => {
  if (!form.value.amount || !form.value.account_id || !form.value.category_id) {
    alert('Por favor, preencha todos os campos obrigatórios')
    return
  }

  isSubmitting.value = true

  try {
    console.log('📤 Enviando transação...')
    
    // Verificar se o usuário está autenticado
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('❌ Sem sessão ativa')
      alert('Sessão expirada. Por favor, faça login novamente.')
      await navigateTo('/login')
      return
    }
    
    console.log('✅ Sessão ativa:', session.user.email)
    
    const result = await $fetch('/api/transactions', {
      method: 'POST',
      credentials: 'include',
      body: {
        account_id: form.value.account_id,
        category_id: form.value.category_id,
        type: form.value.type,
        amount: parseFloat(form.value.amount),
        description: form.value.description,
        date: form.value.date
      }
    })

    console.log('✅ Transação criada com sucesso:', result)

    // Mostrar toast de sucesso
    toastMessage.value = 'Transação criada com sucesso!'
    toastType.value = 'success'
    showToast.value = true

    // Reset form
    form.value = {
      type: 'expense',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      account_id: '',
      category_id: ''
    }

    // Fechar modal após 1 segundo
    setTimeout(() => {
      emit('update:open', false)
      emit('success')
    }, 1000)
  } catch (error) {
    console.error('❌ Erro ao criar transação:', error)
    toastMessage.value = 'Erro ao criar transação. Verifique os dados e tente novamente.'
    toastType.value = 'error'
    showToast.value = true
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModal"
      >
        <div
          class="relative w-full max-w-md bg-white rounded-lg shadow-xl"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Nova Transação</h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <!-- Tipo -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Tipo</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    v-model="form.type" 
                    type="radio" 
                    value="revenue"
                    class="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span class="text-sm text-gray-700">Receita</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    v-model="form.type" 
                    type="radio" 
                    value="expense"
                    class="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span class="text-sm text-gray-700">Despesa</span>
                </label>
              </div>
            </div>

            <!-- Valor -->
            <div class="space-y-2">
              <label for="amount" class="block text-sm font-medium text-gray-700">Valor *</label>
              <input
                id="amount"
                v-model="form.amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <!-- Data -->
            <div class="space-y-2">
              <label for="date" class="block text-sm font-medium text-gray-700">Data *</label>
              <input
                id="date"
                v-model="form.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <!-- Conta -->
            <div class="space-y-2">
              <label for="account" class="block text-sm font-medium text-gray-700">Conta *</label>
              <select 
                id="account"
                v-model="form.account_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
              >
                <option value="">Selecione uma conta</option>
                <option 
                  v-for="account in accounts" 
                  :key="account.id" 
                  :value="account.id"
                >
                  {{ account.name }}
                </option>
              </select>
            </div>

            <!-- Categoria -->
            <div class="space-y-2">
              <label for="category" class="block text-sm font-medium text-gray-700">Categoria *</label>
              <select 
                id="category"
                v-model="form.category_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
              >
                <option value="">Selecione uma categoria</option>
                <option 
                  v-for="category in filteredCategories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <p v-if="filteredCategories.length === 0" class="text-xs text-gray-500">
                Nenhuma categoria de {{ form.type === 'revenue' ? 'receita' : 'despesa' }} encontrada
              </p>
            </div>

            <!-- Descrição -->
            <div class="space-y-2">
              <label for="description" class="block text-sm font-medium text-gray-700">Descrição</label>
              <input
                id="description"
                v-model="form.description"
                type="text"
                placeholder="Descrição da transação"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <!-- Botões -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                :disabled="isSubmitting"
                class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
    
    <!-- Toast de Notificação -->
    <UiToast
      v-model:show="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
    />
  </Teleport>
</template>