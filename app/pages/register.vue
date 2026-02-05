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
        <!-- Ícone de Email -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>

        <!-- Título -->
        <h2 class="text-3xl font-bold text-gray-900 mb-3">📧 Verifique seu Email!</h2>
        
        <!-- Mensagem de Sucesso -->
        <div class="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
          <p class="text-green-800 font-bold text-lg mb-2">✅ Cadastro realizado com sucesso!</p>
          <p class="text-green-700 text-sm">
            Enviamos um email de confirmação para:
          </p>
          <p class="text-green-900 font-bold text-lg mt-2 break-all">{{ email }}</p>
        </div>

        <!-- Instruções Passo a Passo -->
        <div class="text-left bg-blue-50 border-2 border-blue-300 rounded-lg p-5 mb-6">
          <h3 class="font-bold text-blue-900 mb-3 flex items-center text-lg">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Próximos passos:
          </h3>
          <ol class="text-sm text-blue-800 space-y-2">
            <li class="flex items-start">
              <span class="font-bold mr-2">1.</span>
              <span>Abra sua caixa de entrada de email</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">2.</span>
              <span>Procure por um email de confirmação</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">3.</span>
              <span><strong>Verifique também a pasta de SPAM/LIXO ELETRÔNICO</strong></span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">4.</span>
              <span>Clique no link de confirmação no email</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold mr-2">5.</span>
              <span>Após confirmar, faça login com suas credenciais</span>
            </li>
          </ol>
        </div>

        <!-- Aviso Importante -->
        <div class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
          <p class="text-yellow-800 font-bold mb-2 flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            ⚠️ Não recebeu o email?
          </p>
          <ul class="text-sm text-yellow-700 space-y-1 text-left">
            <li>• Aguarde alguns minutos (pode demorar até 5 minutos)</li>
            <li>• <strong>Verifique a pasta de SPAM</strong></li>
            <li>• Verifique se o email está correto</li>
          </ul>
        </div>

        <!-- Botão -->
        <NuxtLink 
          to="/login"
          class="inline-block w-full px-6 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors shadow-lg"
        >
          Ir para a Página de Login
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