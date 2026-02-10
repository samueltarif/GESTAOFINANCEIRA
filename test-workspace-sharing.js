// Teste de compartilhamento de workspaces
const BASE_URL = 'http://localhost:3000'

async function testarCompartilhamento() {
  console.log('🧪 Testando funcionalidade de compartilhamento de workspaces...\n')

  try {
    // 1. Buscar workspaces
    console.log('1️⃣ Buscando workspaces...')
    const workspacesResponse = await fetch(`${BASE_URL}/api/workspaces`, {
      credentials: 'include'
    })
    const workspaces = await workspacesResponse.json()
    console.log(`✅ ${workspaces.length} workspaces encontrados`)
    
    if (workspaces.length === 0) {
      console.log('❌ Nenhum workspace encontrado. Crie um workspace primeiro.')
      return
    }

    const workspaceId = workspaces[0].id
    console.log(`📁 Usando workspace: ${workspaces[0].name} (${workspaceId})\n`)

    // 2. Buscar membros do workspace
    console.log('2️⃣ Buscando membros do workspace...')
    const membersResponse = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/members`, {
      credentials: 'include'
    })
    const members = await membersResponse.json()
    console.log(`✅ ${members.length} membro(s) encontrado(s)`)
    members.forEach(m => {
      console.log(`   - ${m.email} (${m.role}) - Status: ${m.status}`)
    })
    console.log('')

    // 3. Buscar convites pendentes
    console.log('3️⃣ Buscando convites pendentes...')
    const invitesResponse = await fetch(`${BASE_URL}/api/workspace-invites`, {
      credentials: 'include'
    })
    const invites = await invitesResponse.json()
    console.log(`✅ ${invites.length} convite(s) pendente(s)`)
    invites.forEach(i => {
      console.log(`   - Workspace: ${i.workspace_name} (${i.role})`)
      console.log(`     Convidado por: ${i.invited_by_email}`)
    })
    console.log('')

    // 4. Testar convite (comentado para não enviar convites reais)
    console.log('4️⃣ Teste de convite (simulado)')
    console.log('   Para testar convite, use:')
    console.log(`   POST ${BASE_URL}/api/workspaces/${workspaceId}/members`)
    console.log('   Body: { "email": "usuario@exemplo.com", "role": "member" }')
    console.log('')

    // 5. Verificar estrutura da tabela
    console.log('5️⃣ Estrutura esperada da tabela workspace_members:')
    console.log('   - id (UUID)')
    console.log('   - workspace_id (UUID)')
    console.log('   - user_id (UUID)')
    console.log('   - role (owner/admin/member/viewer)')
    console.log('   - status (pending/accepted/rejected)')
    console.log('   - invited_by (UUID)')
    console.log('   - invited_at (timestamp)')
    console.log('   - accepted_at (timestamp)')
    console.log('')

    console.log('✅ Teste concluído!')
    console.log('\n📝 Próximos passos:')
    console.log('   1. Execute a migration: supabase_migrations/003_workspace_sharing.sql')
    console.log('   2. Teste convidar um usuário pela interface')
    console.log('   3. Aceite o convite com o usuário convidado')
    console.log('   4. Verifique se o workspace compartilhado aparece na lista')

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Mensagem:', await error.response.text())
    }
  }
}

testarCompartilhamento()
