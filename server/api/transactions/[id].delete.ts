import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  console.log('🗑️ DELETE /api/transactions/[id] - Iniciando')
  
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)

  console.log('🗑️ User completo:', JSON.stringify(user, null, 2))

  if (!user) {
    console.error('❌ Usuário não autenticado')
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  // Usar user.id ou user.sub como fallback
  const userId = user.id || user.sub
  
  console.log('🗑️ User ID final:', userId)
  
  if (!userId) {
    console.error('❌ ID do usuário não encontrado')
    throw createError({
      statusCode: 401,
      message: 'ID do usuário não encontrado'
    })
  }

  const transactionId = getRouterParam(event, 'id')
  
  console.log('🗑️ Transaction ID:', transactionId)
  console.log('🗑️ User ID completo:', { id: user.id, sub: user.sub, userId })

  if (!transactionId) {
    throw createError({
      statusCode: 400,
      message: 'ID da transação não fornecido'
    })
  }

  // Verificar se a transação pertence ao usuário
  console.log('🗑️ Buscando transação no banco...')
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('id, account_id')
    .eq('id', transactionId)
    .single()

  console.log('🗑️ Resultado da busca:', { transaction, fetchError })

  if (fetchError || !transaction) {
    console.error('❌ Transação não encontrada:', fetchError)
    throw createError({
      statusCode: 404,
      message: 'Transação não encontrada'
    })
  }

  // Verificar se a conta pertence ao usuário
  console.log('🗑️ Verificando se a conta pertence ao usuário...')
  const { data: account } = await supabase
    .from('accounts')
    .select('user_id')
    .eq('id', transaction.account_id!)
    .single()

  console.log('🗑️ Account:', account)
  console.log('🗑️ User ID:', userId, 'Account User ID:', account?.user_id)

  if (!account || account.user_id! !== userId) {
    console.error('❌ Sem permissão - User ID:', userId, 'Account User ID:', account?.user_id)
    throw createError({
      statusCode: 403,
      message: 'Sem permissão para excluir esta transação'
    })
  }

  // Excluir a transação
  console.log('🗑️ Excluindo transação do banco...')
  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)

  if (deleteError) {
    console.error('❌ Erro ao excluir:', deleteError)
    throw createError({
      statusCode: 500,
      message: 'Erro ao excluir transação: ' + deleteError.message
    })
  }

  console.log('✅ Transação excluída com sucesso')
  return { success: true, message: 'Transação excluída com sucesso' }
})
