import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Criar compartilhamento de workspace
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const userId = user.id || user.sub
    const workspaceId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!workspaceId) {
        throw createError({ statusCode: 400, message: 'ID do workspace não fornecido' })
    }

    const { email, role } = body

    if (!email || !role) {
        throw createError({ statusCode: 400, message: 'Email e role são obrigatórios' })
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
        throw createError({ statusCode: 400, message: 'Role inválido. Use: viewer, editor ou admin' })
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
        throw createError({ statusCode: 403, message: 'Sem permissão para compartilhar este workspace' })
    }

    // Buscar usuário pelo email
    const { data: targetUser, error: userError } = await client
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single()

    if (userError || !targetUser) {
        throw createError({ statusCode: 404, message: 'Usuário não encontrado com este email' })
    }

    // Não permitir compartilhar com si mesmo
    if (targetUser.id === userId) {
        throw createError({ statusCode: 400, message: 'Você não pode compartilhar um workspace consigo mesmo' })
    }

    // Verificar se já existe compartilhamento
    const { data: existingShare } = await client
        .from('workspace_shares')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('shared_with_user_id', targetUser.id)
        .single()

    if (existingShare) {
        throw createError({ statusCode: 409, message: 'Este workspace já está compartilhado com este usuário' })
    }

    // Criar compartilhamento
    const { data: share, error: shareError } = await client
        .from('workspace_shares')
        .insert({
            workspace_id: workspaceId,
            shared_with_user_id: targetUser.id,
            shared_by_user_id: userId,
            role
        })
        .select(`
            id,
            workspace_id,
            shared_with_user_id,
            shared_by_user_id,
            role,
            created_at,
            shared_with:users!workspace_shares_shared_with_user_id_fkey(id, email)
        `)
        .single()

    if (shareError) {
        throw createError({ statusCode: 500, message: shareError.message })
    }

    return share
})
