<script setup lang="ts">
interface Category {
  id: string
  name: string
  color: string
  type: 'revenue' | 'expense'
}

interface Props {
  open: boolean
  category: Category | null
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
  name: '',
  color: '#10B981',
  type: 'expense' as 'revenue' | 'expense'
})

const isSubmitting = ref(false)

// Atualizar form quando category mudar
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    form.value = {
      name: newCategory.name,
      color: newCategory.color,
      type: newCategory.type
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!props.category?.id) {
    alert('Erro: ID da categoria não encontrado')
    return
  }
  
  if (!form.value.name.trim()) {
    alert('Por favor, preencha o nome da categoria')
    return
  }

  isSubmitting.value = true

  try {
    await $fetch(`/api/categories/${props.category.id}`, {
      method: 'PUT',
      body: {
        name: form.value.name.trim(),
        color: form.value.color,
        type: form.value.type
      }
    })

    isOpen.value = false
    emit('success')
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error)
    alert(`Erro ao atualizar categoria: ${error.message || 'Erro desconhecido'}`)
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!props.category?.id) return
  
  if (!confirm('Tem certeza que deseja deletar esta categoria? Esta ação não pode ser desfeita.')) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch(`/api/categories/${props.category.id}`, {
      method: 'DELETE'
    })

    isOpen.value = false
    emit('success')
  } catch (error: any) {
    console.error('Erro ao deletar categoria:', error)
    alert(`Erro ao deletar categoria: ${error.message || 'Erro desconhecido'}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center" style="position: fixed !important;">
    <div 
      class="fixed inset-0 bg-black/80"
      style="position: fixed !important; z-index: 9998;"
      @click="isOpen = false"
    ></div>
    
    <div class="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl" style="z-index: 9999;">
      <div class="border-b border-gray-200 px-6 py-4">
        <h2 class="text-xl font-semibold text-gray-900">Editar Categoria</h2>
        <p class="text-sm text-gray-600 mt-1">Atualize os dados da categoria</p>
      </div>
        
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium text-gray-700">
            Nome da Categoria
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Ex: Alimentação"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div class="space-y-2">
          <label for="color" class="block text-sm font-medium text-gray-700">
            Cor
          </label>
          <div class="flex gap-2">
            <input
              id="color"
              v-model="form.color"
              type="color"
              class="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              v-model="form.color"
              type="text"
              placeholder="#10B981"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Tipo</label>
          <div class="p-3 border border-gray-300 rounded-lg bg-gray-50">
            <span class="text-sm font-medium" :class="form.type === 'revenue' ? 'text-green-600' : 'text-red-600'">
              {{ form.type === 'revenue' ? '✓ Receita' : '✓ Despesa' }}
            </span>
          </div>
          <p class="text-xs text-gray-500">O tipo da categoria não pode ser alterado</p>
        </div>
      </form>

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
