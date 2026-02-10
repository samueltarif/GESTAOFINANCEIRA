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

  const categoryId = getRouterParam(event, 'id')
  
  if (!categoryId) {
    throw createError({
      statusCode: 400,
      message: 'ID da categoria não fornecido'
    })
  }

  const userId = user.id || user.sub

  // Verificar se a categoria pertence ao usuário
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('id, workspace_id')
    .eq('id', categoryId)
    .single()

  if (checkError || !existingCategory) {
    throw createError({
      statusCode: 404,
      message: 'Categoria não encontrada'
    })
  }

  // Verificar se a categoria pertence ao workspace do usuário
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('user_id')
    .eq('id', existingCategory.workspace_id!)
    .single()

  if (!workspace || workspace.user_id! !== userId) {
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
