<script setup lang="ts">
interface Props {
  open: boolean
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
  type: 'personal' as 'personal' | 'business' | 'investment',
  currency: 'BRL',
  color: '#3B82F6'
})

const isSubmitting = ref(false)

const typeOptions = [
  { value: 'personal', label: 'Pessoal', icon: 'lucide:user' },
  { value: 'business', label: 'Empresarial', icon: 'lucide:briefcase' },
  { value: 'investment', label: 'Investimentos', icon: 'lucide:trending-up' }
]

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
]

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/workspaces', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: form.value.name.trim(),
        type: form.value.type,
        currency: form.value.currency,
        color: form.value.color
      }
    })

    // Reset form
    form.value = {
      name: '',
      type: 'personal',
      currency: 'BRL',
      color: '#3B82F6'
    }

    isOpen.value = false
    emit('success')
  } catch (error) {
    console.error('Erro ao criar workspace:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm"
        @click="isOpen = false"
      ></div>
      
      <!-- Modal -->
      <div class="relative z-50 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
        <!-- Header -->
        <div class="border-b border-gray-200 px-6 py-4">
          <h2 class="text-xl font-semibold text-gray-900">Novo Workspace</h2>
          <p class="text-sm text-gray-600 mt-1">Crie um novo espaço para organizar suas finanças</p>
        </div>
        
        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Nome -->
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nome do Workspace
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="Ex: Finanças Pessoais"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Tipo -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Tipo</label>
            <div class="grid grid-cols-3 gap-2">
              <label 
                v-for="option in typeOptions" 
                :key="option.value"
                class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="form.type === option.value ? 'border-green-500 bg-green-50' : 'border-gray-300'"
              >
                <input 
                  v-model="form.type" 
                  type="radio" 
                  :value="option.value"
                  class="sr-only"
                />
                <Icon :name="option.icon" class="h-5 w-5 mb-1" />
                <span class="text-xs">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <!-- Moeda -->
          <div class="space-y-2">
            <label for="currency" class="block text-sm font-medium text-gray-700">
              Moeda
            </label>
            <select 
              id="currency"
              v-model="form.currency"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="BRL">Real (BRL)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
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
                class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                :class="form.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'"
                :style="{ backgroundColor: color }"
              />
            </div>
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
            :disabled="isSubmitting || !form.name.trim()"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Criando...' : 'Criar Workspace' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>