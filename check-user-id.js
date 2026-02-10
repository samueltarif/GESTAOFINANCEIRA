// Script para verificar o ID do usuário no banco
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ifftngadjtwgjsadqvep.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkUserId() {
  console.log('🔍 Verificando ID do usuário samuel.tarif@gmail.com\n')
  
  // Buscar na tabela auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Erro ao buscar usuários:', authError)
    return
  }
  
  const user = authUser.users.find(u => u.email === 'samuel.tarif@gmail.com')
  
  if (!user) {
    console.error('❌ Usuário não encontrado')
    return
  }
  
  console.log('✅ Usuário encontrado em auth.users:')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('\n')
  
  // Buscar na tabela public.users
  const { data: publicUser, error: publicError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'samuel.tarif@gmail.com')
    .single()
  
  if (publicError) {
    console.error('❌ Erro ao buscar em public.users:', publicError)
  } else {
    console.log('✅ Usuário encontrado em public.users:')
    console.log('   ID:', publicUser.id)
    console.log('   Email:', publicUser.email)
    console.log('\n')
  }
  
  // Buscar contas do usuário
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
  
  if (accountsError) {
    console.error('❌ Erro ao buscar contas:', accountsError)
  } else {
    console.log('✅ Contas encontradas:', accounts?.length || 0)
    if (accounts && accounts.length > 0) {
      console.log('   Primeira conta:')
      console.log('   - ID:', accounts[0].id)
      console.log('   - Nome:', accounts[0].name)
      console.log('   - User ID:', accounts[0].user_id)
    }
  }
  
  console.log('\n📊 RESUMO:')
  console.log('   Auth User ID:', user.id)
  console.log('   Public User ID:', publicUser?.id)
  console.log('   IDs são iguais?', user.id === publicUser?.id ? '✅ SIM' : '❌ NÃO')
}

checkUserId()
