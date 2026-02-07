<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const debugInfo = ref('')

function addDebugInfo(message: string) {
  console.log(message)
  debugInfo.value += message + '\n'
}

async function handleRegister() {
  console.log('🔧 handleRegister CHAMADO')
  addDebugInfo('🔧 INICIANDO')
  
  if (!email.value || !password.value) {
    console.log('❌ Campos vazios')
    errorMsg.value = 'Preencha todos os campos'
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    console.log('🚀 Criando usuário...')
    addDebugInfo('🚀 Criando usuário...')
    
    // Criar usuário
    const result = await $fetch('/api/auth/register-instant', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    
    console.log('✅ Usuário criado!', result)
    addDebugInfo('✅ Usuário criado!')
    
    // Mostrar mensagem de sucesso
    successMsg.value = '✅ Cadastro realizado com sucesso! Redirecionando para login...'
    console.log('✅ Mensagem de sucesso definida')
    
    // Aguardar 1.5 segundos para mostrar mensagem
    console.log('⏳ Aguardando 1.5s...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Redirecionar para login
    console.log('➡️ Redirecionando para login...')
    addDebugInfo('➡️ Redirecionando para login...')
    
    const loginUrl = '/login?registered=true&email=' + encodeURIComponent(email.value)
    console.log('URL de redirecionamento:', loginUrl)
    
    await navigateTo(loginUrl)
    
  } catch (error: any) {
    console.error('❌ ERRO:', error)
    addDebugInfo(`❌ ERRO: ${error.message}`)
    errorMsg.value = error.data?.statusMessage || error.message || 'Erro ao criar conta'
    loading.value = false
  }
}

onMounted(() => {
  console.log('🚀 Página register.vue montada')
  addDebugInfo('🚀 Página carregada')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
    <!-- Debug Panel -->
    <ClientOnly>
      <div v-if="debugInfo" class="fixed top-4 right-4 bg-black text-green-400 p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs font-mono z-50">
        <h3 class="text-white font-bold mb-2">🔧 DEBUG:</h3>
        <pre>{{ debugInfo }}</pre>
      </div>
    </ClientOnly>

    <!-- Formulário -->
    <div class="w-full max-w-md">
      <AuthForm
        title="Criar conta"
        description="Preencha os dados para começar"
        @submit="handleRegister"
      >
        <template #fields>
          <AuthInput
            id="email"
            label="E-mail"
            type="email"
            v-model="email"
            placeholder="seu@email.com"
            required
          />
          <AuthInput
            id="password"
            label="Senha"
            type="password"
            v-model="password"
            placeholder="••••••••"
            required
          />
          
          <!-- Mensagem de Sucesso -->
          <div v-if="successMsg" class="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p class="text-green-800 font-bold text-center">{{ successMsg }}</p>
          </div>
          
          <!-- Mensagem de Erro -->
          <div v-if="errorMsg" class="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p class="text-red-800 font-bold text-center">{{ errorMsg }}</p>
          </div>
        </template>
        
        <template #actions>
          <AuthButton :loading="loading">
            {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
          </AuthButton>
        </template>

        <template #footer>
          <p class="text-sm text-center text-muted-foreground">
            Já tem uma conta?
            <a href="/login" class="text-primary hover:underline font-medium">
              Fazer login
            </a>
          </p>
        </template>
      </AuthForm>
    </div>
  </div>
</template>
