<script setup lang="ts">
const props = defineProps<{
  open: boolean
  workspace: {
    id: string
    name: string
    color: string
  } | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const toast = useToast()

const name = ref('')
const color = ref('#10B981')
const loading = ref(false)

// Cores predefinidas
const predefinedColors = [
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
]

// Atualizar campos quando o workspace mudar
watch(() => props.workspace, (newWorkspace) => {
  if (newWorkspace) {
    name.value = newWorkspace.name || ''
    color.value = newWorkspace.color || '#10B981'
  }
}, { immediate: true })

async function handleSubmit() {
  if (!props.workspace) return
  
  if (!name.value.trim()) {
    toast.error('Nome do workspace é obrigatório')
    return
  }

  if (!color.value.match(/^#[0-9A-F]{6}$/i)) {
    toast.error('Cor inválida')
    return
  }

  loading.value = true

  try {
    await $fetch(`/api/workspaces/${props.workspace.id}`, {
      method: 'PUT',
      body: {
        name: name.value.trim(),
        color: color.value.toUpperCase()
      },
      credentials: 'include'
    })

    toast.success('Workspace atualizado com sucesso!')
    emit('success')
    emit('update:open', false)
  } catch (error: any) {
    console.error('Erro ao atualizar workspace:', error)
    toast.error(error.data?.statusMessage || 'Erro ao atualizar workspace')
  } finally {
    loading.value = false
  }
}

function handleClose() {
  if (!loading.value) {
    emit('update:open', false)
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <div class="fixed inset-0 bg-black/80" @click="handleClose"></div>
    <div class="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl" style="z-index: 9999;">
      <div class="border-b border-gray-200 px-6 py-4">
        <h2 class="text-xl font-semibold text-gray-900">Editar Workspace</h2>
        <p class="text-sm text-gray-600 mt-1">Altere o nome e a cor do workspace</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Nome -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nome do Workspace
          </label>
          <input
            v-model="name"
            type="text"
            required
            maxlength="100"
            placeholder="Ex: Pessoal, Trabalho, Investimentos"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            :disabled="loading"
          />
        </div>

        <!-- Cor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cor do Workspace
          </label>
          
          <!-- Cores predefinidas -->
          <div class="grid grid-cols-8 gap-2 mb-3">
            <button
              v-for="presetColor in predefinedColors"
              :key="presetColor"
              type="button"
              @click="color = presetColor"
              class="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110"
              :class="(color || '').toUpperCase() === presetColor.toUpperCase() ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' : 'border-gray-300'"
              :style="{ backgroundColor: presetColor }"
              :disabled="loading"
            ></button>
          </div>

          <!-- Seletor de cor customizado -->
          <div class="flex items-center gap-3">
            <input
              v-model="color"
              type="color"
              class="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
              :disabled="loading"
            />
            <input
              v-model="color"
              type="text"
              pattern="^#[0-9A-Fa-f]{6}$"
              placeholder="#10B981"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Preview -->
        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-xs text-gray-600 mb-2">Preview:</p>
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg shadow-sm"
              :style="{ backgroundColor: color }"
            ></div>
            <span class="font-medium text-gray-900">{{ name || 'Nome do Workspace' }}</span>
          </div>
        </div>
      </form>

      <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button
          type="button"
          @click="handleClose"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </div>
  </div>
</template>
