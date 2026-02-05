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

    isOpen.value = false
    emit('success')
  } catch (error) {
    console.error('Erro ao criar conta:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UiDialog :open="isOpen" @update:open="isOpen = $event">
    <UiDialogContent class="sm:max-w-[425px]">
      <UiDialogHeader>
        <UiDialogTitle>Nova Conta</UiDialogTitle>
        <UiDialogDescription>
          Crie uma nova conta para organizar suas transações
        </UiDialogDescription>
      </UiDialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
        <!-- Nome -->
        <div class="space-y-2">
          <UiLabel for="name">Nome da Conta</UiLabel>
          <UiInput
            id="name"
            v-model="form.name"
            placeholder="Ex: Conta Corrente"
            required
          />
        </div>

        <!-- Tipo -->
        <div class="space-y-2">
          <UiLabel>Tipo</UiLabel>
          <div class="grid grid-cols-2 gap-2">
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
              <span class="text-xs text-center">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Saldo Inicial -->
        <div class="space-y-2">
          <UiLabel for="balance">Saldo Inicial</UiLabel>
          <UiInput
            id="balance"
            v-model="form.balance"
            type="number"
            step="0.01"
            placeholder="0,00"
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
          {{ isSubmitting ? 'Criando...' : 'Criar Conta' }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>