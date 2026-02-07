<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const debugLogs = ref<string[]>([])

function addLog(message: string) {
  console.log(message)
  debugLogs.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
}

async function handleRegister() {
  addLog('🔧 INÍCIO')
  
  if (!email.value || !password.value) {
    addLog('❌ Campos vazios')
    errorMsg.value = 'Preencha todos os campos'
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  const startTime = performance.now()
  
  try {
    addLog('🚀 Criando usuário...')
    
    const response = await fetch('/api/auth/register-instant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const createTime = performance.now() - startTime
    addLog(`📡 Criado em ${createTime.toFixed(0)}ms`)
    
    if (!response.ok) {
      const error = await response.json()
      addLog(`❌ Erro: ${error.statusMessage}`)
      errorMsg.value = error.statusMessage || 'Erro'
      loading.value = false
      return
    }
    
    const result = await response.json()
    addLog(`✅ API: ${result.performance?.total_time_ms}ms`)
    
    successMsg.value = '✅ Cadastro realizado! Redirecionando para login...'
    addLog('✅ Cadastro realizado!')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    addLog('➡️ Redirecionando para login...')
    await navigateTo('/login?registered=true&email=' + encodeURIComponent(email.value))
    
  } catch (error: any) {
    addLog(`💥 Erro: ${error.message}`)
    errorMsg.value = 'Erro de conexão'
    loading.value = false
  }
}

function testJS() {
  addLog('🧪 Teste OK!')
  alert('JavaScript funcionando!')
}

onMounted(() => {
  addLog('🚀 Página carregada')
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

    <!-- Formulário -->
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
            :disabled="loading"
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
            :disabled="loading"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <!-- Mensagem de Sucesso -->
        <div v-if="successMsg" class="p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-800 font-medium">{{ successMsg }}</p>
        </div>
        
        <!-- Mensagem de Erro -->
        <div v-if="errorMsg" class="text-red-600 text-sm">
          {{ errorMsg }}
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
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
