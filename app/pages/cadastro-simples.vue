<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const mensagem = ref('')
const carregando = ref(false)
const sucesso = ref(false)

async function cadastrar() {
  if (!email.value || !password.value) {
    mensagem.value = '❌ Preencha todos os campos'
    return
  }
  
  carregando.value = true
  sucesso.value = false
  mensagem.value = '⏳ Cadastrando...'
  
  try {
    // Criar usuário
    const resposta = await fetch('/api/auth/register-instant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const dados = await resposta.json()
    
    if (!resposta.ok) {
      mensagem.value = `❌ ${dados.statusMessage || 'Erro'}`
      carregando.value = false
      return
    }
    
    // Mostrar sucesso
    sucesso.value = true
    mensagem.value = '✅ Cadastro realizado com sucesso! Redirecionando para login...'
    
    // Aguardar e redirecionar
    await new Promise(resolve => setTimeout(resolve, 1500))
    navigateTo('/login?registered=true&email=' + encodeURIComponent(email.value))
    
  } catch (erro: any) {
    mensagem.value = `💥 Erro: ${erro.message}`
    carregando.value = false
  }
}
</script>

<template>
  <div style="min-h: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5; padding: 20px;">
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
            :disabled="carregando"
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
            :disabled="carregando"
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
      
      <div 
        v-if="mensagem" 
        style="margin-top: 20px; padding: 10px; border-radius: 4px; text-align: center;"
        :style="{ 
          background: sucesso ? '#d4edda' : '#f0f0f0',
          color: sucesso ? '#155724' : '#333',
          border: sucesso ? '1px solid #c3e6cb' : 'none'
        }"
      >
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
