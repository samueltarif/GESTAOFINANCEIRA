<script setup lang="ts">
definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const debugInfo = ref('')
const successMsg = ref('')
const showEmailSent = ref(false)

// Função de debug para mostrar informações na tela
function addDebugInfo(message: string) {
  console.log(message)
  debugInfo.value += message + '\n'
}

async function handleRegister() {
  addDebugInfo('🔧 FUNÇÃO handleRegister CHAMADA')
  addDebugInfo(`📧 Email: ${email.value}`)
  addDebugInfo(`🔒 Password length: ${password.value.length}`)
  
  if (!email.value || !password.value) {
    const msg = 'Preencha todos os campos'
    addDebugInfo(`❌ Validação falhou: ${msg}`)
    errorMsg.value = msg
    return
  }
  
  addDebugInfo('✅ Validação passou, iniciando registro...')
  loading.value = true
  errorMsg.value = ''
  
  try {
    addDebugInfo(`🔧 Fazendo chamada para /api/auth/register com email: ${email.value}`)
    
    // Usar a API de registro que envia email de confirmação
    const result = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { 
        email: email.value, 
        password: password.value 
      }
    })
    
    addDebugInfo(`✅ Resposta da API recebida: ${JSON.stringify(result)}`)
    
    // Verificar se precisa confirmar email
    if (result.needsEmailConfirmation) {
      showEmailSent.value = true
      successMsg.value = 'Cadastro realizado! Verifique seu email para confirmar o cadastro.'
      loading.value = false
      return
    }
    
    // Se não precisa confirmar, fazer login automático
    addDebugInfo('🔧 Iniciando login automático...')
    const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    if (signInError) {
      addDebugInfo(`❌ Erro no login automático: ${JSON.stringify(signInError)}`)
      errorMsg.value = 'Conta criada com sucesso! Faça login para continuar.'
      loading.value = false
    } else {
      addDebugInfo(`✅ Login automático realizado: ${JSON.stringify(signInData)}`)
      addDebugInfo('🔧 Redirecionando para dashboard...')
      navigateTo('/dashboard')
    }
    
  } catch (error: any) {
    addDebugInfo(`❌ ERRO CAPTURADO: ${JSON.stringify(error)}`)
    addDebugInfo(`❌ Error.message: ${error.message}`)
    addDebugInfo(`❌ Error.data: ${JSON.stringify(error.data)}`)
    
    if (error.data?.statusMessage) {
      errorMsg.value = error.data.statusMessage
    } else if (error.message) {
      errorMsg.value = error.message
    } else {
      errorMsg.value = 'Erro inesperado. Tente novamente.'
    }
    
    loading.value = false
  }
}

// Log quando o componente é montado
onMounted(() => {
  console.log('🚀 REGISTER.VUE: Componente montado')
  addDebugInfo('🚀 REGISTER.VUE: Componente carregado com sucesso')
  addDebugInfo('🚀 REGISTER.VUE: Componente montado no DOM')
})

// Função de teste para verificar se o JavaScript está funcionando
function testJavaScript() {
  addDebugInfo('🧪 TESTE: Função JavaScript chamada!')
  alert('🧪 JavaScript está funcionando! Verifique o console para mais logs.')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
    <!-- Debug Info Panel -->
    <ClientOnly>
      <div v-if="debugInfo" class="fixed top-4 right-4 bg-black text-green-400 p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs font-mono z-50">
        <h3 class="text-white font-bold mb-2">🔧 DEBUG LOG:</h3>
        <pre>{{ debugInfo }}</pre>
        <button 
          @click="testJavaScript" 
          class="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Testar JS
        </button>
      </div>
    </ClientOnly>

    <!-- Mensagem de Email Enviado -->
    <div v-if="showEmailSent" class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Verifique seu Email</h2>
        <p class="text-gray-600 mb-6">{{ successMsg }}</p>
        <p class="text-sm text-gray-500 mb-6">
          Enviamos um link de confirmação para <strong>{{ email }}</strong>
        </p>
        <NuxtLink 
          to="/login"
          class="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Voltar para Login
        </NuxtLink>
      </div>
    </div>

    <!-- Formulário de Registro -->
    <div v-else class="w-full max-w-md">
      <AuthForm
        title="Criar conta"
        description="Preencha os dados abaixo para começar a controlar suas finanças."
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
          <p v-if="errorMsg" class="text-sm text-destructive mt-2">{{ errorMsg }}</p>
        </template>
        
        <template #actions>
          <AuthButton :loading="loading">Cadastrar</AuthButton>
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