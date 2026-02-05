<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const mensagem = ref('')
const carregando = ref(false)

async function cadastrar() {
  console.log('🔧 Função cadastrar chamada')
  console.log('📧 Email:', email.value)
  console.log('🔒 Senha:', password.value)
  
  if (!email.value || !password.value) {
    mensagem.value = '❌ Preencha todos os campos'
    return
  }
  
  carregando.value = true
  mensagem.value = '⏳ Cadastrando...'
  
  try {
    console.log('🌐 Fazendo requisição...')
    
    const resposta = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })
    
    console.log('📡 Resposta recebida:', resposta.status)
    
    const dados = await resposta.json()
    console.log('📄 Dados:', dados)
    
    if (resposta.ok) {
      mensagem.value = '✅ Cadastro realizado com sucesso!'
      console.log('✅ Sucesso!')
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigateTo('/login')
      }, 2000)
    } else {
      mensagem.value = `❌ Erro: ${dados.statusMessage || 'Erro desconhecido'}`
      console.error('❌ Erro:', dados)
    }
    
  } catch (erro: any) {
    console.error('💥 Erro na requisição:', erro)
    mensagem.value = `💥 Erro: ${erro.message}`
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5; padding: 20px;">
    <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
      <h1 style="text-align: center; margin-bottom: 30px; color: #333;">
        📝 Cadastro Simples
      </h1>
      
      <form @submit.prevent="cadastrar" style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #555;">
            E-mail:
          </label>
          <input
            v-model="email"
            type="email"
            required
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #555;">
            Senha:
          </label>
          <input
            v-model="password"
            type="password"
            required
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          :disabled="carregando"
          style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: 500; cursor: pointer;"
          :style="{ opacity: carregando ? 0.6 : 1 }"
        >
          {{ carregando ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>
      
      <div v-if="mensagem" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px; text-align: center;">
        {{ mensagem }}
      </div>
      
      <p style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
        Já tem uma conta?
        <NuxtLink to="/login" style="color: #007bff; text-decoration: none;">
          Fazer login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>