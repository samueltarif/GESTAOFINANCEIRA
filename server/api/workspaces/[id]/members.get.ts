import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Buscar membros de um workspace
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

    // Verificar se o usuário tem acesso ao workspace
    const { data: workspace, error: workspaceError } = await client
        .from('workspaces')
        .select('id, user_id')
        .eq('id', workspaceId)
        .single()

    if (workspaceError || !workspace) {
        throw createError({ statusCode: 404, message: 'Workspace não encontrado' })
    }

    // Verificar se é owner ou membro
    const { data: membership } = await client
        .from('workspace_members')
        .select('role, status')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single()

    const isOwner = workspace.user_id === userId
    const isMember = membership && membership.status === 'accepted'

    if (!isOwner && !isMember) {
        throw createError({ statusCode: 403, message: 'Sem permissão para acessar este workspace' })
    }

    // Buscar membros com informações do usuário
    const { data: members, error } = await client
        .from('workspace_members')
        .select(`
            id,
            workspace_id,
            user_id,
            role,
            status,
            invited_at,
            accepted_at,
            users!workspace_members_user_id_fkey (
                id,
                email
            )
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    // Formatar resposta
    const formattedMembers = (members || []).map((member: any) => ({
        id: member.id,
        workspace_id: member.workspace_id,
        user_id: member.user_id,
        email: member.users?.email || '',
        role: member.role,
        status: member.status,
        invited_at: member.invited_at,
        accepted_at: member.accepted_at
    }))

    return formattedMembers
})
