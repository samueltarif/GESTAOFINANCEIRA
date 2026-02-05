<script setup lang="ts">
definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()

// Estado das abas
const activeTab = ref<'login' | 'register'>('login')

// Estados do Login
const loginEmail = ref('')
const loginPassword = ref('')
const loginLoading = ref(false)
const loginError = ref('')

// Estados do Cadastro
const registerEmail = ref('')
const registerPassword = ref('')
const registerLoading = ref(false)
const registerError = ref('')

// Função de Login
async function handleLogin() {
  loginLoading.value = true
  loginError.value = ''
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPassword.value,
    })

    if (error) {
      // Se o erro for de email não confirmado, tenta confirmar automaticamente
      if (error.message.includes('Email not confirmed')) {
        try {
          await $fetch('/api/auth/auto-confirm', {
            method: 'POST',
            body: { email: loginEmail.value }
          })
          
          // Tenta fazer login novamente
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: loginEmail.value,
            password: loginPassword.value,
          })
          
          if (retryError) {
            loginError.value = 'Email ou senha incorretos'
            loginLoading.value = false
          } else {
            navigateTo('/dashboard')
          }
        } catch (confirmError) {
          loginError.value = 'Erro ao confirmar email. Entre em contato com o suporte.'
          loginLoading.value = false
        }
      } else if (error.message.includes('Invalid login credentials')) {
        loginError.value = 'Email ou senha incorretos'
        loginLoading.value = false
      } else {
        loginError.value = error.message
        loginLoading.value = false
      }
    } else {
      navigateTo('/dashboard')
    }
  } catch (error) {
    loginError.value = 'Erro inesperado. Tente novamente.'
    loginLoading.value = false
  }
}



// Função de Cadastro
async function handleRegister() {
  registerLoading.value = true
  registerError.value = ''
  
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { 
        email: registerEmail.value, 
        password: registerPassword.value 
      }
    })
    
    // Login automático após cadastro
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: registerEmail.value,
      password: registerPassword.value,
    })
    
    if (signInError) {
      registerError.value = 'Conta criada! Faça login para continuar.'
      activeTab.value = 'login'
      loginEmail.value = registerEmail.value
      registerLoading.value = false
    } else {
      navigateTo('/dashboard')
    }
    
  } catch (error: any) {
    if (error.data?.statusMessage) {
      registerError.value = error.data.statusMessage
    } else {
      registerError.value = 'Erro ao criar conta. Tente novamente.'
    }
    registerLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Abas -->
      <div class="flex border-b">
        <button
          @click="activeTab = 'login'"
          :class="[
            'flex-1 py-4 px-6 text-center font-medium transition-colors',
            activeTab === 'login' 
              ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
              : 'text-muted-foreground hover:bg-muted/50'
          ]"
        >
          Entrar
        </button>
        <button
          @click="activeTab = 'register'"
          :class="[
            'flex-1 py-4 px-6 text-center font-medium transition-colors',
            activeTab === 'register' 
              ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
              : 'text-muted-foreground hover:bg-muted/50'
          ]"
        >
          Cadastrar
        </button>
      </div>

      <!-- Conteúdo das Abas -->
      <div class="p-6">
        <!-- Aba de Login -->
        <div v-if="activeTab === 'login'" class="space-y-4">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold">Bem-vindo de volta</h2>
            <p class="text-muted-foreground text-sm mt-1">
              Entre com seu e-mail e senha
            </p>
          </div>



          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="login-email" class="block text-sm font-medium mb-1">
                E-mail
              </label>
              <input
                id="login-email"
                v-model="loginEmail"
                type="email"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label for="login-password" class="block text-sm font-medium mb-1">
                Senha
              </label>
              <input
                id="login-password"
                v-model="loginPassword"
                type="password"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <p v-if="loginError" class="text-sm text-destructive">
              {{ loginError }}
            </p>

            <button
              type="submit"
              :disabled="loginLoading"
              class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              {{ loginLoading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </div>

        <!-- Aba de Cadastro -->
        <div v-if="activeTab === 'register'" class="space-y-4">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold">Criar conta</h2>
            <p class="text-muted-foreground text-sm mt-1">
              Preencha os dados para começar
            </p>
          </div>



          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label for="register-email" class="block text-sm font-medium mb-1">
                E-mail
              </label>
              <input
                id="register-email"
                v-model="registerEmail"
                type="email"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label for="register-password" class="block text-sm font-medium mb-1">
                Senha
              </label>
              <input
                id="register-password"
                v-model="registerPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
              <p class="text-xs text-muted-foreground mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            <p v-if="registerError" class="text-sm text-destructive">
              {{ registerError }}
            </p>

            <button
              type="submit"
              :disabled="registerLoading"
              class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              {{ registerLoading ? 'Cadastrando...' : 'Cadastrar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>