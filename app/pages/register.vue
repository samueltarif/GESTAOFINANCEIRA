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

async function handleRegister() {
  loading.value = true
  errorMsg.value = ''
  
  try {
    console.log('🔧 Registrando usuário com auto-confirmação:', email.value)
    
    // Usar a nova API de registro que já confirma automaticamente
    const result = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { 
        email: email.value, 
        password: password.value 
      }
    })
    
    console.log('✅ Usuário registrado e confirmado:', result)
    
    // Fazer login automático após registro
    const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    if (signInError) {
      console.error('❌ Erro no login automático:', signInError)
      errorMsg.value = 'Conta criada com sucesso! Faça login para continuar.'
      loading.value = false
    } else {
      console.log('✅ Login automático realizado:', signInData)
      navigateTo('/dashboard')
    }
    
  } catch (error: any) {
    console.error('❌ Erro no registro:', error)
    
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
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
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
          <NuxtLink to="/login" class="text-primary hover:underline font-medium">
            Fazer login
          </NuxtLink>
        </p>
      </template>
    </AuthForm>
  </div>
</template>
