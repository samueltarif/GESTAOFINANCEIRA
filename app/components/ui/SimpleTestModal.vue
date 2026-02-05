<script setup lang="ts">
interface Props {
  open: boolean
  workspaceId: string
  type: 'category' | 'transaction'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const form = ref({
  name: '',
  type: 'expense' as 'revenue' | 'expense',
  amount: '',
  account_id: '',
  category_id: ''
})

const isSubmitting = ref(false)
const accounts = ref([])
const categories = ref([])

// Função para carregar dados
const loadData = async () => {
  if (props.type === 'transaction' && props.workspaceId) {
    try {
      console.log('🔄 Carregando dados para workspace:', props.workspaceId)
      const [accountsRes, categoriesRes] = await Promise.all([
        $fetch(`/api/accounts`), // CONTAS GLOBAIS: todas do usuário
        $fetch(`/api/categories?workspace_id=${props.workspaceId}`)
      ])
      accounts.value = accountsRes || []
      categories.value = categoriesRes || []
      console.log('✅ Dados carregados:', { 
        accounts: accounts.value.length, 
        categories: categories.value.length,
        accountNames: accounts.value.map(a => a.name),
        categoryNames: categories.value.map(c => c.name)
      })
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
    }
  }
}

// Carregar dados quando o modal abrir
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadData()
  }
})

const handleSubmit = async () => {
  if (!form.value.name.trim() && props.type === 'category') {
    alert('Nome é obrigatório')
    return
  }
  
  if (props.type === 'transaction' && (!form.value.amount || !form.value.account_id || !form.value.category_id)) {
    alert('Todos os campos são obrigatórios')
    return
  }

  isSubmitting.value = true

  try {
    if (props.type === 'category') {
      await $fetch('/api/categories', {
        method: 'POST',
        body: {
          workspace_id: props.workspaceId,
          name: form.value.name.trim(),
          type: form.value.type,
          color: '#ef4444',
          icon: 'test'
        }
      })
      alert('Categoria criada com sucesso!')
    } else {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: {
          account_id: form.value.account_id,
          category_id: form.value.category_id,
          type: form.value.type,
          amount: parseFloat(form.value.amount),
          description: 'Teste via modal',
          date: new Date().toISOString().split('T')[0]
        }
      })
      alert('Transação criada com sucesso!')
    }

    // Reset form
    form.value = {
      name: '',
      type: 'expense',
      amount: '',
      account_id: '',
      category_id: ''
    }

    isOpen.value = false
    emit('success')
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro ao criar: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50" 
      @click="isOpen = false"
    ></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
      <h2 class="text-xl font-bold mb-4">
        {{ props.type === 'category' ? 'Nova Categoria' : 'Nova Transação' }}
      </h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Categoria -->
        <div v-if="props.type === 'category'">
          <label class="block text-sm font-medium mb-1">Nome da Categoria</label>
          <input 
            v-model="form.name"
            type="text" 
            placeholder="Ex: Alimentação"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          
          <div class="mt-2">
            <label class="block text-sm font-medium mb-1">Tipo</label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input v-model="form.type" type="radio" value="revenue" class="mr-2" />
                Receita
              </label>
              <label class="flex items-center">
                <input v-model="form.type" type="radio" value="expense" class="mr-2" />
                Despesa
              </label>
            </div>
          </div>
        </div>
        
        <!-- Transação -->
        <div v-if="props.type === 'transaction'">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-medium">Criar Nova Transação</h3>
            <button 
              type="button"
              @click="loadData"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              🔄 Recarregar
            </button>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Tipo</label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input v-model="form.type" type="radio" value="revenue" class="mr-2" />
                Receita
              </label>
              <label class="flex items-center">
                <input v-model="form.type" type="radio" value="expense" class="mr-2" />
                Despesa
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Valor</label>
            <input 
              v-model="form.amount"
              type="number" 
              step="0.01"
              placeholder="0.00"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">
              Conta ({{ accounts.length }} disponíveis)
            </label>
            <select 
              v-model="form.account_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Selecione uma conta</option>
              <option 
                v-for="account in accounts" 
                :key="account.id" 
                :value="account.id"
              >
                {{ account.name }} ({{ account.type }}) - R$ {{ account.balance }}
              </option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">
              Categoria ({{ categories?.filter(c => c.type === form.type).length || 0 }} do tipo {{ form.type === 'revenue' ? 'receita' : 'despesa' }})
            </label>
            <select 
              v-model="form.category_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option 
                v-for="category in categories?.filter(c => c.type === form.type)" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Botões -->
        <div class="flex gap-2 pt-4">
          <button 
            type="button"
            @click="isOpen = false"
            class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            :disabled="isSubmitting"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>