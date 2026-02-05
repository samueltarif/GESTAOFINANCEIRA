<script setup lang="ts">
definePageMeta({
  layout: false
})

// Estados básicos
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const debugLogs = ref<string[]>([])

// Função para adicionar logs
function addLog(message: string) {
  console.log(message)
  debugLogs.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
}

// Função de registro
async function handleRegister() {
  addLog('🔧 Iniciando processo de registro')
  
  if (!email.value || !password.value) {
    addLog('❌ Campos obrigatórios não preenchidos')
    errorMsg.value = 'Preencha todos os campos'
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  addLog('✅ Validação passou, fazendo requisição...')
  
  try {
    addLog(`🌐 Chamando API com email: ${email.value}`)
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })
    
    addLog(`📡 Resposta recebida: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const result = await response.json()
      addLog(`✅ Sucesso: ${JSON.stringify(result)}`)
      
      // Redirecionar para login
      addLog('🔄 Redirecionando para login...')
      await navigateTo('/login')
    } else {
      const error = await response.json()
      addLog(`❌ Erro da API: ${JSON.stringify(error)}`)
      errorMsg.value = error.statusMessage || 'Erro no cadastro'
    }
    
  } catch (error: any) {
    addLog(`💥 Erro na requisição: ${error.message}`)
    errorMsg.value = 'Erro de conexão. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Função de teste
function testJS() {
  addLog('🧪 Teste de JavaScript executado!')
  alert('JavaScript funcionando!')
}

// Log inicial
onMounted(() => {
  addLog('🚀 Página de registro carregada')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <!-- Debug Panel -->
    <div class="fixed top-4 right-4 bg-black text-green-400 p-4 rounded-lg max-w-sm max-h-96 overflow-auto text-xs font-mono z-50">
      <h3 class="text-white font-bold mb-2">🔧 DEBUG:</h3>
      <div v-for="log in debugLogs" :key="log" class="mb-1">{{ log }}</div>
      <button @click="testJS" class="mt-2 bg-blue-500 text-white px-2 py-1 rounded">
        Testar JS
      </button>
    </div>

    <!-- Formulário Simples -->
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">Criar Conta</h1>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            v-model="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <div v-if="errorMsg" class="text-red-600 text-sm">
          {{ errorMsg }}
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Carregando...</span>
          <span v-else>Cadastrar</span>
        </button>
      </form>
      
      <p class="text-center text-sm text-gray-600 mt-4">
        Já tem uma conta?
        <NuxtLink to="/login" class="text-blue-600 hover:underline">
          Fazer login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>