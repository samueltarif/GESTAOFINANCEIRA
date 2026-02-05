import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  const accountId = getRouterParam(event, 'id')
  const userId = user.id || user.sub

  // Verificar se a conta pertence ao usuário
  const { data: existingAccount, error: checkError } = await supabase
    .from('accounts')
    .select('id, user_id')
    .eq('id', accountId)
    .single()

  if (checkError || !existingAccount) {
    throw createError({
      statusCode: 404,
      message: 'Conta não encontrada'
    })
  }

  if (existingAccount.user_id !== userId) {
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
