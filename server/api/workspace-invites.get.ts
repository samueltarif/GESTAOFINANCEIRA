import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Buscar convites pendentes do usuário
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const userId = user.id || user.sub

    // Buscar convites pendentes
    const { data: invites, error } = await client
        .from('workspace_members')
        .select(`
            id,
            workspace_id,
            role,
            invited_at,
            workspaces!workspace_members_workspace_id_fkey (
                id,
                name,
                type,
                user_id
            ),
            invited_by_user:users!workspace_members_invited_by_fkey (
                email
            )
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false })

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    // Formatar resposta
    const formattedInvites = (invites || []).map((invite: any) => ({
        id: invite.id,
        workspace_id: invite.workspace_id,
        workspace_name: invite.workspaces?.name || '',
        workspace_type: invite.workspaces?.type || '',
        role: invite.role,
        invited_at: invite.invited_at,
        invited_by_email: invite.invited_by_user?.email || ''
    }))

    return formattedInvites
})
