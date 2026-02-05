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
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/categories', {
      method: 'POST',
      body: {
        workspace_id: props.workspaceId,
        name: form.value.name.trim(),
        type: form.value.type,
        color: form.value.color,
        icon: form.value.icon
      }
    })

    // Reset form
    form.value = {
      name: '',
      type: 'expense',
      color: '#ef4444',
      icon: 'tag'
    }

    isOpen.value = false
    emit('success')
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UiDialog :open="isOpen" @update:open="isOpen = $event">
    <UiDialogContent class="sm:max-w-[425px]">
      <UiDialogHeader>
        <UiDialogTitle>Nova Categoria</UiDialogTitle>
        <UiDialogDescription>
          Crie uma nova categoria para classificar suas transações
        </UiDialogDescription>
      </UiDialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
        <!-- Nome -->
        <div class="space-y-2">
          <UiLabel for="name">Nome da Categoria</UiLabel>
          <UiInput
            id="name"
            v-model="form.name"
            placeholder="Ex: Alimentação"
            required
          />
        </div>

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

        <!-- Cor -->
        <div class="space-y-2">
          <UiLabel>Cor</UiLabel>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              @click="form.color = color"
              class="w-8 h-8 rounded-full border-2 transition-all"
              :class="form.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>

        <!-- Ícone -->
        <div class="space-y-2">
          <UiLabel for="icon">Ícone</UiLabel>
          <UiInput
            id="icon"
            v-model="form.icon"
            placeholder="tag"
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
          :disabled="isSubmitting || !form.name.trim()"
        >
          {{ isSubmitting ? 'Criando...' : 'Criar Categoria' }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>