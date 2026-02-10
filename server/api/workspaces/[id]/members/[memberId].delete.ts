import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Remover membro do workspace
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const userId = user.id || user.sub
    const workspaceId = getRouterParam(event, 'id')
    const memberId = getRouterParam(event, 'memberId')

    if (!workspaceId || !memberId) {
        throw createError({ statusCode: 400, message: 'IDs não fornecidos' })
    }

    // Buscar o membro a ser removido
    const { data: memberToRemove, error: memberError } = await client
        .from('workspace_members')
        .select('user_id, role')
        .eq('id', memberId)
        .eq('workspace_id', workspaceId)
        .single()

    if (memberError || !memberToRemove) {
        throw createError({ statusCode: 404, message: 'Membro não encontrado' })
    }

    // Verificar se o usuário tem permissão
    const { data: workspace } = await client
        .from('workspaces')
        .select('user_id')
        .eq('id', workspaceId)
        .single()

    const isOwner = workspace?.user_id === userId

    // Não pode remover o owner
    if (memberToRemove.role === 'owner') {
        throw createError({ statusCode: 403, message: 'Não é possível remover o dono do workspace' })
    }

    // Verificar permissões
    if (!isOwner) {
        const { data: currentMembership } = await client
            .from('workspace_members')
            .select('role, status')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .single()

        const isAdmin = currentMembership?.role === 'admin' && currentMembership?.status === 'accepted'
        const isSelf = memberToRemove.user_id === userId

        if (!isAdmin && !isSelf) {
            throw createError({ statusCode: 403, message: 'Sem permissão para remover este membro' })
        }
    }

    // Remover membro
    const { error } = await client
        .from('workspace_members')
        .delete()
        .eq('id', memberId)

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true }
})
