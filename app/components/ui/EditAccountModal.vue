<script setup lang="ts">
interface Account {
  id: string
  name: string
  balance: number
}

interface Props {
  open: boolean
  account: Account | null
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
  balance: 0
})

const isSubmitting = ref(false)

// Atualizar form quando account mudar
watch(() => props.account, (newAccount) => {
  if (newAccount) {
    form.value = {
      name: newAccount.name,
      balance: newAccount.balance
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!props.account?.id) {
    alert('Erro: ID da conta não encontrado')
    return
  }
  
  if (!form.value.name.trim()) {
    alert('Por favor, preencha o nome da conta')
    return
  }

  isSubmitting.value = true

  try {
    await $fetch(`/api/accounts/${props.account.id}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        name: form.value.name.trim(),
        balance: form.value.balance
      }
    })

    isOpen.value = false
    emit('success')
  } catch (error: any) {
    console.error('Erro ao atualizar conta:', error)
    alert(`Erro ao atualizar conta: ${error.message || 'Erro desconhecido'}`)
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!props.account?.id) return
  
  if (!confirm('Tem certeza que deseja deletar esta conta? Todas as transações associadas serão perdidas. Esta ação não pode ser desfeita.')) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch(`/api/accounts/${props.account.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    isOpen.value = false
    emit('success')
  } catch (error: any) {
    console.error('Erro ao deletar conta:', error)
    alert(`Erro ao deletar conta: ${error.message || 'Erro desconhecido'}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
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
        <h2 class="text-xl font-semibold text-gray-900">Editar Conta</h2>
        <p class="text-sm text-gray-600 mt-1">Atualize os dados da conta</p>
      </div>
        
      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Nome -->
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium text-gray-700">
            Nome da Conta
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Ex: Banco Itaú"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <!-- Saldo -->
        <div class="space-y-2">
          <label for="balance" class="block text-sm font-medium text-gray-700">
            Saldo Atual (R$)
          </label>
          <input
            id="balance"
            v-model.number="form.balance"
            type="number"
            step="0.01"
            placeholder="0,00"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500">
            Atualize o saldo para refletir o valor atual da conta
          </p>
        </div>
      </form>

      <!-- Footer -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
        <button
          type="button"
          @click="handleDelete"
          :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Deletar
        </button>
        <div class="flex gap-3">
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
            :disabled="isSubmitting || !form.name.trim()"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
