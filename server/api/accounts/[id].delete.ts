import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  const accountId = getRouterParam(event, 'id')
  
  if (!accountId) {
    throw createError({
      statusCode: 400,
      message: 'ID da conta não fornecido'
    })
  }

  const userId = user.id || user.sub

  // Verificar se a conta pertence ao usuário
  const { data: existingAccount, error: checkError } = await supabase
    .from('accounts')
    .select('id, workspace_id')
    .eq('id', accountId)
    .single()

  if (checkError || !existingAccount) {
    throw createError({
      statusCode: 404,
      message: 'Conta não encontrada'
    })
  }

  // Verificar se a conta pertence ao workspace do usuário
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('user_id')
    .eq('id', existingAccount.workspace_id!)
    .single()

  if (!workspace || workspace.user_id! !== userId) {
    throw createError({
      statusCode: 403,
      message: 'Sem permissão para deletar esta conta'
    })
  }

  // Deletar a conta
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Erro ao deletar conta: ${error.message}`
    })
  }

  return { success: true, message: 'Conta deletada com sucesso' }
})
