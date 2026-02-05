export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  const transactionId = getRouterParam(event, 'id')
  const userId = user.id || user.sub

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'ID do usuário não encontrado'
    })
  }

  // Verificar se a transação pertence ao usuário
  const { data: existingTransaction, error: checkError } = await supabase
    .from('transactions')
    .select('id, account_id, accounts!inner(user_id)')
    .eq('id', transactionId)
    .single()

  if (checkError || !existingTransaction) {
    throw createError({
      statusCode: 404,
      message: 'Transação não encontrada'
    })
  }

  // Verificar se o usuário tem permissão
  if (existingTransaction.accounts.user_id !== userId) {
    throw createError({
      statusCode: 403,
      message: 'Sem permissão para excluir esta transação'
    })
  }

  // Excluir a transação
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao excluir transação'
    })
  }

  return { success: true }
})
