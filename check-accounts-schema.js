// Verificar schema da tabela accounts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 VERIFICANDO SCHEMA DA TABELA ACCOUNTS\n')

  // Login como admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'samuel.tarif@gmail.com',
    password: 'Feliz2022'
  })

  if (authError) {
    console.error('❌ Erro no login:', authError.message)
    return
  }

  console.log('✅ Login realizado!\n')

  // Buscar uma conta existente para ver a estrutura
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Erro ao buscar contas:', error.message)
    return
  }

  if (!accounts || accounts.length === 0) {
    console.log('⚠️ Nenhuma conta encontrada no banco')
    console.log('💡 Vou tentar criar uma conta para ver quais campos são necessários\n')
    
    // Tentar criar com workspace_id
    console.log('Tentando criar com workspace_id...')
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('*')
      .limit(1)
    
    if (workspaces && workspaces.length > 0) {
      const { data: newAccount, error: createError } = await supabase
        .from('accounts')
        .insert({
          workspace_id: workspaces[0].id,
          name: 'Teste',
          type: 'checking',
          balance: 0
        })
        .select()
      
      if (createError) {
        console.log('❌ Erro com workspace_id:', createError.message)
        console.log('Detalhes:', createError.details)
        console.log('Hint:', createError.hint)
      } else {
        console.log('✅ Conta criada com workspace_id!')
        console.log('Estrutura:', newAccount)
      }
    }
    
    return
  }

  console.log('✅ Conta encontrada! Estrutura:')
  console.log(JSON.stringify(accounts[0], null, 2))
  console.log('\n📋 Campos disponíveis:')
  Object.keys(accounts[0]).forEach(key => {
    console.log(`   - ${key}: ${typeof accounts[0][key]}`)
  })
}

checkSchema()
