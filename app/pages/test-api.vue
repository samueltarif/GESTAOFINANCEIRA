<script setup lang="ts">
definePageMeta({
  layout: false
})

const logs = ref<string[]>([])
const email = ref('teste.debug@exemplo.com')
const password = ref('123456')
const loading = ref(false)

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`${timestamp}: ${message}`)
  console.log(message)
}

async function testAPI() {
  addLog('🔧 Iniciando teste da API de registro...')
  addLog(`📧 Email: ${email.value}`)
  addLog(`🔒 Password: ${password.value}`)
  
  loading.value = true
  
  try {
    addLog('🌐 Fazendo requisição para /api/auth/register...')
    
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
    
    addLog(`📡 Status da resposta: ${response.status} ${response.statusText}`)
    
    const result = await response.json()
    
    if (response.ok) {
      addLog(`✅ Sucesso: ${JSON.stringify(result)}`)
    } else {
      addLog(`❌ Erro: ${JSON.stringify(result)}`)
    }
    
  } catch (error: any) {
    addLog(`💥 Erro na requisição: ${error.message}`)
    addLog(`💥 Stack trace: ${error.stack}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  addLog('🚀 Página de teste carregada')
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">🧪 Teste da API de Registro</h1>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Configuração do Teste</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input 
              v-model="email" 
              type="email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Senha:</label>
            <input 
              v-model="password" 
              type="password" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button 
            @click="testAPI" 
            :disabled="loading"
            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Testando...' : 'Testar API de Registro' }}
          </button>
        </div>
      </div>
      
      <div class="bg-black text-green-400 rounded-lg shadow-md p-6 font-mono text-sm">
        <h2 class="text-white text-xl font-semibold mb-4">📋 Logs:</h2>
        <div class="space-y-1">
          <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
          <div v-if="logs.length === 0" class="text-gray-500">Nenhum log ainda...</div>
        </div>
      </div>
      
      <div class="mt-6 text-center">
        <NuxtLink to="/register" class="text-blue-600 hover:underline">
          ← Voltar para página de registro
        </NuxtLink>
      </div>
    </div>
  </div>
</template>