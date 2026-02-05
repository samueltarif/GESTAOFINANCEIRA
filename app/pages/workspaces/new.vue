<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

// Função de logout
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Erro no logout:', error)
    } else {
      console.log('Logout realizado com sucesso')
      await navigateTo('/login')
    }
  } catch (error) {
    console.error('Erro durante logout:', error)
  }
}

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
    const workspace = await $fetch('/api/workspaces', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        type: form.value.type,
        currency: form.value.currency,
        color: form.value.color
      }
    })

    // Redirecionar para o workspace criado
    await navigateTo(`/workspaces/${workspace.id}`)
  } catch (error) {
    console.error('Erro ao criar workspace:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header da página -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <NuxtLink to="/workspaces" class="text-sm text-gray-600 hover:text-green-600 transition-colors">
              &larr; Voltar para workspaces
            </NuxtLink>
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Novo Workspace</h1>
          <p class="text-gray-600">Crie um novo espaço para organizar suas finanças.</p>
        </div>
        <div class="flex gap-2">
          <!-- Botão de Logout -->
          <button 
            @click="handleLogout"
            class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            🚪 Sair
          </button>
        </div>
      </div>

      <!-- Formulário -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Nome -->
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-gray-700">Nome do Workspace</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="Ex: Finanças Pessoais"
              required
              class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Tipo -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Tipo</label>
            <div class="grid grid-cols-3 gap-4">
              <label 
                v-for="option in typeOptions" 
                :key="option.value"
                class="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="form.type === option.value ? 'border-green-600 bg-green-50' : 'border-gray-200'"
              >
                <input 
                  v-model="form.type" 
                  type="radio" 
                  :value="option.value"
                  class="sr-only"
                />
                <Icon :name="option.icon" class="h-8 w-8 mb-2" :class="form.type === option.value ? 'text-green-600' : 'text-gray-600'" />
                <span class="font-medium" :class="form.type === option.value ? 'text-green-600' : 'text-gray-900'">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <!-- Moeda -->
          <div class="space-y-2">
            <label for="currency" class="block text-sm font-medium text-gray-700">Moeda</label>
            <select 
              id="currency"
              v-model="form.currency"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="BRL">Real (BRL)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          <!-- Cor -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Cor de Identificação</label>
            <div class="flex gap-3 flex-wrap">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                @click="form.color = color"
                class="w-12 h-12 rounded-full border-4 transition-all hover:scale-110 cursor-pointer"
                :class="form.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'"
                :style="{ backgroundColor: color }"
              />
            </div>
          </div>

          <!-- Botões -->
          <div class="flex gap-4 pt-4">
            <NuxtLink to="/workspaces" class="flex-1">
              <button 
                type="button"
                class="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
            </NuxtLink>
            <button 
              type="submit"
              class="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              :disabled="isSubmitting || !form.name.trim()"
            >
              {{ isSubmitting ? 'Criando...' : 'Criar Workspace' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
