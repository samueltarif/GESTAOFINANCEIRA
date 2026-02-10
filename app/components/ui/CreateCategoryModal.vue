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
  type: 'expense' as 'revenue' | 'expense',
  color: '#ef4444',
  icon: 'tag'
})

const isSubmitting = ref(false)

const colorOptions = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    alert('Por favor, preencha o nome da categoria')
    return
  }

  isSubmitting.value = true

  try {
    const result = await $fetch('/api/categories', {
      method: 'POST',
      credentials: 'include',
      body: {
        workspace_id: props.workspaceId,
        name: form.value.name.trim(),
        type: form.value.type,
        color: form.value.color,
        icon: form.value.icon
      }
    })

    console.log('✅ Categoria criada com sucesso:', result)

    // Reset form
    form.value = {
      name: '',
      type: 'expense',
      color: '#ef4444',
      icon: 'tag'
    }

    emit('update:open', false)
    emit('success')
  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error)
    alert('Erro ao criar categoria. Verifique o console.')
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
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Nova Categoria</h2>
              <p class="text-sm text-gray-600 mt-1">Crie uma nova categoria para classificar suas transações</p>
            </div>
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
            <!-- Nome -->
            <div class="space-y-2">
              <label for="name" class="block text-sm font-medium text-gray-700">Nome da Categoria *</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Ex: Alimentação"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

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

            <!-- Cor -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Cor</label>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  type="button"
                  @click="form.color = color"
                  class="w-10 h-10 rounded-full border-2 transition-all hover:scale-110 cursor-pointer"
                  :class="form.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>

            <!-- Ícone -->
            <div class="space-y-2">
              <label for="icon" class="block text-sm font-medium text-gray-700">Ícone</label>
              <input
                id="icon"
                v-model="form.icon"
                type="text"
                placeholder="tag"
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
                :disabled="isSubmitting || !form.name.trim()"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Criando...' : 'Criar Categoria' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>