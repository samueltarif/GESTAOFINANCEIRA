import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Listar compartilhamentos de um workspace
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const userId = user.id || user.sub
    const workspaceId = getRouterParam(event, 'id')

    if (!workspaceId) {
        throw createError({ statusCode: 400, message: 'ID do workspace não fornecido' })
    }

    // Verificar se o usuário é dono do workspace
    const { data: workspace, error: workspaceError } = await client
        .from('workspaces')
        .select('user_id')
        .eq('id', workspaceId)
        .single()

    if (workspaceError || !workspace) {
        throw createError({ statusCode: 404, message: 'Workspace não encontrado' })
    }

    if (workspace.user_id !== userId) {
        throw createError({ statusCode: 403, message: 'Sem permissão para ver compartilhamentos' })
    }

    // Buscar compartilhamentos com informações dos usuários
    const { data: shares, error } = await client
        .from('workspace_shares')
        .select(`
            id,
            workspace_id,
            shared_with_user_id,
            shared_by_user_id,
            role,
            created_at,
            shared_with:users!workspace_shares_shared_with_user_id_fkey(id, email),
            shared_by:users!workspace_shares_shared_by_user_id_fkey(id, email)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return shares || []
})
