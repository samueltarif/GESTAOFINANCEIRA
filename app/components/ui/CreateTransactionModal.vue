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

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const form = ref({
  type: 'expense' as 'revenue' | 'expense',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  account_id: '',
  category_id: ''
})

const isSubmitting = ref(false)
const accounts = ref([])
const categories = ref([])

// Buscar contas e categorias quando o modal abrir
watch(() => props.open, async (isOpen) => {
  if (isOpen && props.workspaceId) {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        $fetch(`/api/accounts`), // CONTAS GLOBAIS: todas do usuário
        $fetch(`/api/categories?workspace_id=${props.workspaceId}`)
      ])
      accounts.value = accountsRes || []
      categories.value = categoriesRes || []
    } catch (error) {
      console.error('Erro ao buscar contas e categorias:', error)
    }
  }
})

const filteredCategories = computed(() => {
  return categories.value?.filter(cat => cat.type === form.value.type) || []
})

const handleSubmit = async () => {
  if (!form.value.amount || !form.value.account_id || !form.value.category_id) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/transactions', {
      method: 'POST',
      body: {
        account_id: form.value.account_id,
        category_id: form.value.category_id,
        type: form.value.type,
        amount: parseFloat(form.value.amount),
        description: form.value.description,
        date: form.value.date
      }
    })

    // Reset form
    form.value = {
      type: 'expense',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      account_id: '',
      category_id: ''
    }

    isOpen.value = false
    emit('success')
  } catch (error) {
    console.error('Erro ao criar transação:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UiDialog :open="isOpen" @update:open="isOpen = $event">
    <UiDialogContent class="sm:max-w-[425px]">
      <UiDialogHeader>
        <UiDialogTitle>Nova Transação</UiDialogTitle>
      </UiDialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
        <!-- Tipo -->
        <div class="space-y-2">
          <UiLabel>Tipo</UiLabel>
          <div class="flex gap-4">
            <label class="flex items-center space-x-2">
              <input 
                v-model="form.type" 
                type="radio" 
                value="revenue"
                class="text-green-600"
              />
              <span>Receita</span>
            </label>
            <label class="flex items-center space-x-2">
              <input 
                v-model="form.type" 
                type="radio" 
                value="expense"
                class="text-red-600"
              />
              <span>Despesa</span>
            </label>
          </div>
        </div>

        <!-- Valor -->
        <div class="space-y-2">
          <UiLabel for="amount">Valor</UiLabel>
          <UiInput
            id="amount"
            v-model="form.amount"
            type="number"
            step="0.01"
            placeholder="0,00"
            required
          />
        </div>

        <!-- Data -->
        <div class="space-y-2">
          <UiLabel for="date">Data</UiLabel>
          <UiInput
            id="date"
            v-model="form.date"
            type="date"
            required
          />
        </div>

        <!-- Conta -->
        <div class="space-y-2">
          <UiLabel for="account">Conta</UiLabel>
          <select 
            id="account"
            v-model="form.account_id"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
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
          <UiLabel for="category">Categoria</UiLabel>
          <select 
            id="category"
            v-model="form.category_id"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
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
        </div>

        <!-- Descrição -->
        <div class="space-y-2">
          <UiLabel for="description">Descrição</UiLabel>
          <UiInput
            id="description"
            v-model="form.description"
            placeholder="Descrição da transação"
          />
        </div>
      </form>

      <UiDialogFooter>
        <UiButton 
          variant="outline" 
          @click="isOpen = false"
          :disabled="isSubmitting"
        >
          Cancelar
        </UiButton>
        <UiButton 
          @click="handleSubmit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>