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

  const transactionId = getRouterParam(event, 'id')
  
  if (!transactionId) {
    throw createError({
      statusCode: 400,
      message: 'ID da transação não fornecido'
    })
  }

  const body = await readBody(event)

  console.log('📝 PUT /api/transactions/[id] - Iniciando')
  console.log('📝 Transaction ID:', transactionId)
  console.log('📝 Body recebido:', body)
  console.log('📝 User:', user.email)

  const { description, amount, date, type, category_id, account_id } = body

  if (!description || !amount || !date || !type || !category_id || !account_id) {
    console.log('❌ Dados incompletos:', { description, amount, date, type, category_id, account_id })
    throw createError({
      statusCode: 400,
      message: 'Dados incompletos'
    })
  }

  const userId = user.id || user.sub
  
  if (!userId) {
    console.log('❌ User ID não encontrado')
    throw createError({
      statusCode: 401,
      message: 'ID do usuário não encontrado'
    })
  }

  console.log('📝 User ID:', userId)

  // Verificar se a transação pertence ao usuário
  console.log('📝 Verificando permissões...')
  const { data: existingTransaction, error: checkError } = await supabase
    .from('transactions')
    .select('id, account_id')
    .eq('id', transactionId)
    .single()

  console.log('📝 Transação existente:', JSON.stringify(existingTransaction, null, 2))
  console.log('📝 Erro de verificação:', checkError)

  if (checkError || !existingTransaction) {
    console.log('❌ Transação não encontrada ou erro:', checkError?.message)
    throw createError({
      statusCode: 404,
      message: 'Transação não encontrada'
    })
  }

  // Verificar se a conta pertence ao usuário
  const { data: account } = await supabase
    .from('accounts')
    .select('workspace_id')
    .eq('id', existingTransaction.account_id!)
    .single()

  if (!account) {
    console.log('❌ Conta não encontrada')
    throw createError({
      statusCode: 404,
      message: 'Conta não encontrada'
    })
  }

  // Verificar se o workspace pertence ao usuário
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('user_id')
    .eq('id', account.workspace_id!)
    .single()

  console.log('📝 Workspace user_id:', workspace?.user_id)
  
  if (!workspace || workspace.user_id! !== userId) {
    console.log('❌ Sem permissão - User ID:', userId, 'Workspace User ID:', workspace?.user_id)
    throw createError({
      statusCode: 403,
      message: 'Sem permissão para editar esta transação'
    })
  }

  // Atualizar a transação
  console.log('📝 Atualizando transação...')
  const { data, error } = await supabase
    .from('transactions')
    .update({
      description,
      amount,
      date,
      type,
      category_id,
      account_id
    })
    .eq('id', transactionId)
    .select()
    .single()

  if (error) {
    console.log('❌ Erro ao atualizar:', error)
    console.log('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
    throw createError({
      statusCode: 500,
      message: `Erro ao atualizar transação: ${error.message || 'Erro desconhecido'}`
    })
  }

  console.log('✅ Transação atualizada com sucesso:', data)
  return data
})
