import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Atualizar role de um compartilhamento
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const userId = user.id || user.sub
    const shareId = getRouterParam(event, 'shareId')
    const body = await readBody(event)

    if (!shareId) {
        throw createError({ statusCode: 400, message: 'ID do compartilhamento não fornecido' })
    }

    const { role } = body

    if (!role) {
        throw createError({ statusCode: 400, message: 'Role é obrigatório' })
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
        throw createError({ statusCode: 400, message: 'Role inválido. Use: viewer, editor ou admin' })
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
        throw createError({ statusCode: 403, message: 'Sem permissão para atualizar este compartilhamento' })
    }

    // Atualizar role
    const { data: updatedShare, error: updateError } = await client
        .from('workspace_shares')
        .update({ role })
        .eq('id', shareId)
        .select(`
            id,
            workspace_id,
            shared_with_user_id,
            role,
            created_at,
            shared_with:users!workspace_shares_shared_with_user_id_fkey(id, email)
        `)
        .single()

    if (updateError) {
        throw createError({ statusCode: 500, message: updateError.message })
    }

    return updatedShare
})
