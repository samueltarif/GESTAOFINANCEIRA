<script setup lang="ts">
import AuthForm from '@/components/auth/AuthForm.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      console.error('Erro no login:', error)
      
      // Se o erro for "Email not confirmed", tentar auto-confirmação
      if (error.message.includes('Email not confirmed')) {
        console.log('🔧 Tentando auto-confirmação para:', email.value)
        
        try {
          // Chamar API de auto-confirmação
          await $fetch('/api/auth/auto-confirm', {
            method: 'POST',
            body: { email: email.value }
          })
          
          console.log('✅ Auto-confirmação realizada, tentando login novamente...')
          
          // Tentar login novamente após confirmação
          const { error: retryError, data: retryData } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value,
          })
          
          if (retryError) {
            console.error('❌ Erro no segundo login:', retryError)
            errorMsg.value = 'Erro após confirmação automática. Tente novamente em alguns segundos.'
          } else {
            console.log('✅ Login realizado após auto-confirmação:', retryData)
            navigateTo('/dashboard')
            return
          }
        } catch (confirmError) {
          console.error('❌ Erro na auto-confirmação:', confirmError)
          errorMsg.value = 'Email não confirmado. Entre em contato com o suporte para ativar sua conta.'
        }
      } else if (error.message.includes('Invalid login credentials')) {
        errorMsg.value = 'Email ou senha incorretos. Verifique seus dados.'
      } else {
        errorMsg.value = error.message
      }
      
      loading.value = false
    } else {
      console.log('Login realizado:', data)
      navigateTo('/dashboard')
    }
  } catch (error) {
    console.error('Erro inesperado no login:', error)
    errorMsg.value = 'Erro inesperado. Tente novamente.'
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
    <AuthForm
      title="Bem-vindo de volta"
      description="Entre com seu e-mail e senha para acessar sua conta."
      @submit="handleLogin"
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
        <AuthButton :loading="loading">Entrar</AuthButton>
      </template>

      <template #footer>
        <p class="text-sm text-center text-muted-foreground">
          Não tem uma conta?
          <NuxtLink to="/register" class="text-primary hover:underline font-medium">
            Cadastre-se
          </NuxtLink>
        </p>
      </template>
    </AuthForm>
  </div>
</template>
