import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Atualizar membro (role ou aceitar convite)
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const userId = user.id || user.sub
    const workspaceId = getRouterParam(event, 'id')
    const memberId = getRouterParam(event, 'memberId')
    const body = await readBody(event)

    if (!workspaceId || !memberId) {
        throw createError({ statusCode: 400, message: 'IDs não fornecidos' })
    }

    const { role, status } = body

    // Buscar o membro
    const { data: member, error: memberError } = await client
        .from('workspace_members')
        .select('user_id, role, status')
        .eq('id', memberId)
        .eq('workspace_id', workspaceId)
        .single()

    if (memberError || !member) {
        throw createError({ statusCode: 404, message: 'Membro não encontrado' })
    }

    // Se for aceitar/rejeitar convite, só o próprio usuário pode fazer
    if (status) {
        if (member.user_id !== userId) {
            throw createError({ statusCode: 403, message: 'Você só pode aceitar/rejeitar seus próprios convites' })
        }

        const validStatuses = ['accepted', 'rejected']
        if (!validStatuses.includes(status)) {
            throw createError({ statusCode: 400, message: 'Status inválido' })
        }

        const updateData: any = { status }
        if (status === 'accepted') {
            updateData.accepted_at = new Date().toISOString()
        }

        const { data, error } = await client
            .from('workspace_members')
            .update(updateData)
            .eq('id', memberId)
            .select()
            .single()

        if (error) {
            throw createError({ statusCode: 500, message: error.message })
        }

        return { success: true, member: data }
    }

    // Se for alterar role, precisa ser owner ou admin
    if (role) {
        const validRoles = ['admin', 'member', 'viewer']
        if (!validRoles.includes(role)) {
            throw createError({ statusCode: 400, message: 'Role inválido' })
        }

        // Não pode alterar role do owner
        if (member.role === 'owner') {
            throw createError({ statusCode: 403, message: 'Não é possível alterar o papel do dono' })
        }

        // Verificar permissões
        const { data: workspace } = await client
            .from('workspaces')
            .select('user_id')
            .eq('id', workspaceId)
            .single()

        const isOwner = workspace?.user_id === userId

        if (!isOwner) {
            const { data: currentMembership } = await client
                .from('workspace_members')
                .select('role, status')
                .eq('workspace_id', workspaceId)
                .eq('user_id', userId)
                .single()

            const isAdmin = currentMembership?.role === 'admin' && currentMembership?.status === 'accepted'

            if (!isAdmin) {
                throw createError({ statusCode: 403, message: 'Sem permissão para alterar papéis' })
            }
        }

        const { data, error } = await client
            .from('workspace_members')
            .update({ role })
            .eq('id', memberId)
            .select()
            .single()

        if (error) {
            throw createError({ statusCode: 500, message: error.message })
        }

        return { success: true, member: data }
    }

    throw createError({ statusCode: 400, message: 'Nenhuma atualização fornecida' })
})
