<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const router = useRouter()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('')

onMounted(async () => {
  const token_hash = route.query.token_hash as string
  const type = route.query.type as string

  if (!token_hash || type !== 'email') {
    status.value = 'error'
    message.value = 'Link de confirmação inválido'
    return
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email'
    })

    if (error) {
      console.error('Erro ao confirmar email:', error)
      status.value = 'error'
      message.value = error.message || 'Erro ao confirmar email'
    } else {
      status.value = 'success'
      message.value = 'Email confirmado com sucesso!'
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  } catch (err: any) {
    console.error('Erro:', err)
    status.value = 'error'
    message.value = 'Erro ao processar confirmação'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <!-- Loading -->
      <div v-if="status === 'loading'" class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Confirmando email...</h2>
        <p class="text-gray-600">Aguarde um momento</p>
      </div>

      <!-- Success -->
      <div v-if="status === 'success'" class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Email Confirmado!</h2>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <p class="text-sm text-gray-500">Redirecionando para o login...</p>
        
        <NuxtLink 
          to="/login"
          class="mt-6 inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Ir para Login
        </NuxtLink>
      </div>

      <!-- Error -->
      <div v-if="status === 'error'" class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Erro na Confirmação</h2>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        
        <div class="space-y-3">
          <NuxtLink 
            to="/register"
            class="block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Criar Nova Conta
          </NuxtLink>
          <NuxtLink 
            to="/login"
            class="block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Voltar para Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
