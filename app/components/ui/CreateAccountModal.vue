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
  name: '',
  type: 'checking' as 'checking' | 'savings' | 'cash' | 'credit_card',
  balance: ''
})

const isSubmitting = ref(false)

const typeOptions = [
  { value: 'checking', label: 'Conta Corrente', icon: 'lucide:credit-card' },
  { value: 'savings', label: 'Poupança', icon: 'lucide:piggy-bank' },
  { value: 'cash', label: 'Dinheiro', icon: 'lucide:wallet' },
  { value: 'credit_card', label: 'Cartão de Crédito', icon: 'lucide:credit-card' }
]

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/accounts', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        type: form.value.type,
        balance: parseFloat(form.value.balance) || 0
      }
    })

    // Reset form
    form.value = {
      name: '',
      type: 'checking',
      balance: ''
    }

    emit('update:open', false)
    emit('success')
  } catch (error) {
    console.error('Erro ao criar conta:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('update:open', false)
}
</script>

<template>
  <!-- Modal Overlay -->
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
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <!-- Modal Content -->
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="border-b border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Nova Conta</h2>
                <p class="text-sm text-gray-600 mt-1">Crie uma nova conta para organizar suas transações</p>
              </div>
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="lucide:x" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <!-- Nome -->
            <div class="space-y-2">
              <label for="account-name" class="block text-sm font-medium text-gray-700">
                Nome da Conta
              </label>
              <input
                id="account-name"
                v-model="form.name"
                type="text"
                placeholder="Ex: Conta Corrente"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <!-- Tipo -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Tipo</label>
              <div class="grid grid-cols-2 gap-2">
                <label 
                  v-for="option in typeOptions" 
                  :key="option.value"
                  class="flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  :class="form.type === option.value ? 'border-green-600 bg-green-50' : 'border-gray-200'"
                >
                  <input 
                    v-model="form.type" 
                    type="radio" 
                    :value="option.value"
                    class="sr-only"
                  />
                  <Icon :name="option.icon" class="h-5 w-5 mb-1" :class="form.type === option.value ? 'text-green-600' : 'text-gray-600'" />
                  <span class="text-xs text-center" :class="form.type === option.value ? 'text-green-600 font-medium' : 'text-gray-700'">
                    {{ option.label }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Saldo Inicial -->
            <div class="space-y-2">
              <label for="account-balance" class="block text-sm font-medium text-gray-700">
                Saldo Inicial
              </label>
              <input
                id="account-balance"
                v-model="form.balance"
                type="number"
                step="0.01"
                placeholder="0,00"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </form>

          <!-- Footer -->
          <div class="border-t border-gray-200 p-6 flex gap-3">
            <button
              type="button"
              @click="closeModal"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="handleSubmit"
              :disabled="isSubmitting || !form.name.trim()"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Criando...' : 'Criar Conta' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
