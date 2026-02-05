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
  <UiDialog :open="isOpen" @update:open="isOpen = $event">
    <UiDialogContent class="sm:max-w-[425px]">
      <UiDialogHeader>
        <UiDialogTitle>Novo Workspace</UiDialogTitle>
        <UiDialogDescription>
          Crie um novo espaço para organizar suas finanças
        </UiDialogDescription>
      </UiDialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
        <!-- Nome -->
        <div class="space-y-2">
          <UiLabel for="name">Nome do Workspace</UiLabel>
          <UiInput
            id="name"
            v-model="form.name"
            placeholder="Ex: Finanças Pessoais"
            required
          />
        </div>

        <!-- Tipo -->
        <div class="space-y-2">
          <UiLabel>Tipo</UiLabel>
          <div class="grid grid-cols-3 gap-2">
            <label 
              v-for="option in typeOptions" 
              :key="option.value"
              class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              :class="form.type === option.value ? 'border-primary bg-primary/5' : 'border-input'"
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
          <UiLabel for="currency">Moeda</UiLabel>
          <select 
            id="currency"
            v-model="form.currency"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="BRL">Real (BRL)</option>
            <option value="USD">Dólar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
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
          {{ isSubmitting ? 'Criando...' : 'Criar Workspace' }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>