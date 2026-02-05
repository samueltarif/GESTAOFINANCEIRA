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

  const categoryId = getRouterParam(event, 'id')
  const userId = user.id || user.sub

  // Verificar se a categoria pertence ao usuário
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('id, workspace_id, workspaces!inner(user_id)')
    .eq('id', categoryId)
    .single()

  if (checkError || !existingCategory) {
    throw createError({
      statusCode: 404,
      message: 'Categoria não encontrada'
    })
  }

  if ((existingCategory.workspaces as any)?.user_id !== userId) {
    throw createError({
      statusCode: 403,
      message: 'Sem permissão para deletar esta categoria'
    })
  }

  // Deletar a categoria
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Erro ao deletar categoria: ${error.message}`
    })
  }

  return { success: true, message: 'Categoria deletada com sucesso' }
})
