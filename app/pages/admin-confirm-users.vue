<script setup lang="ts">
const isLoading = ref(false)
const result = ref<any>(null)
const error = ref('')

const confirmAllUsers = async () => {
  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await $fetch('/api/auth/confirm-all-users', {
      method: 'POST'
    })
    
    result.value = response
  } catch (err: any) {
    error.value = err.message || 'Erro ao confirmar usuários'
    console.error('Erro:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        🔧 Confirmar Todos os Usuários
      </h1>
      <p class="text-gray-600 mb-8">
        Esta página confirma automaticamente todos os usuários não confirmados no sistema.
      </p>

      <button
        @click="confirmAllUsers"
        :disabled="isLoading"
        class="w-full px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
      >
        {{ isLoading ? 'Confirmando...' : 'Confirmar Todos os Usuários' }}
      </button>

      <!-- Resultado de Sucesso -->
      <div v-if="result" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 class="text-lg font-semibold text-green-800 mb-2">✅ Sucesso!</h2>
        <p class="text-green-700 mb-3">{{ result.message }}</p>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Total de usuários:</span>
            <span class="font-semibold">{{ result.total }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Confirmados agora:</span>
            <span class="font-semibold text-green-600">{{ result.confirmed }}</span>
          </div>
          <div v-if="result.failed > 0" class="flex justify-between">
            <span class="text-gray-600">Falhas:</span>
            <span class="font-semibold text-red-600">{{ result.failed }}</span>
          </div>
        </div>

        <!-- Detalhes -->
        <div v-if="result.details && result.details.length > 0" class="mt-4">
          <h3 class="font-semibold text-gray-700 mb-2">Detalhes:</h3>
          <div class="max-h-60 overflow-y-auto space-y-1">
            <div 
              v-for="(detail, index) in result.details" 
              :key="index"
              class="text-sm p-2 rounded"
              :class="detail.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              <span class="font-medium">{{ detail.email }}</span>
              <span v-if="!detail.success" class="ml-2 text-xs">- {{ detail.error }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Erro -->
      <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 class="text-lg font-semibold text-red-800 mb-2">❌ Erro</h2>
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Instruções -->
      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 class="font-semibold text-blue-800 mb-2">ℹ️ Informações</h3>
        <ul class="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Esta ação confirma automaticamente todos os emails não confirmados</li>
          <li>Usuários já confirmados não serão afetados</li>
          <li>Esta página deve ser usada apenas em desenvolvimento</li>
          <li>Após confirmar, os usuários poderão fazer login normalmente</li>
        </ul>
      </div>

      <!-- Voltar -->
      <div class="mt-6">
        <NuxtLink 
          to="/"
          class="text-green-600 hover:text-green-700 font-medium"
        >
          ← Voltar para a página inicial
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
