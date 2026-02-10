import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Remover compartilhamento de workspace
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const userId = user.id || user.sub
    const shareId = getRouterParam(event, 'shareId')

    if (!shareId) {
        throw createError({ statusCode: 400, message: 'ID do compartilhamento não fornecido' })
    }

    // Buscar compartilhamento e verificar permissão
    const { data: share, error: shareError } = await client
        .from('workspace_shares')
        .select(`
            id,
            workspace_id,
            workspaces!inner(user_id)
        `)
        .eq('id', shareId)
        .single()

    if (shareError || !share) {
        throw createError({ statusCode: 404, message: 'Compartilhamento não encontrado' })
    }

    // Verificar se o usuário é dono do workspace
    if (share.workspaces.user_id !== userId) {
        throw createError({ statusCode: 403, message: 'Sem permissão para remover este compartilhamento' })
    }

    // Deletar compartilhamento
    const { error: deleteError } = await client
        .from('workspace_shares')
        .delete()
        .eq('id', shareId)

    if (deleteError) {
        throw createError({ statusCode: 500, message: deleteError.message })
    }

    return { success: true, message: 'Compartilhamento removido com sucesso' }
})
