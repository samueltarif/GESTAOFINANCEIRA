import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Adicionar membro ao workspace (enviar convite)
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

    const { email, role = 'member' } = body

    if (!email) {
        throw createError({ statusCode: 400, message: 'Email não fornecido' })
    }

    // Validar role
    const validRoles = ['admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
        throw createError({ statusCode: 400, message: 'Role inválido' })
    }

    // Verificar se o usuário tem permissão (owner ou admin)
    const { data: workspace, error: workspaceError } = await client
        .from('workspaces')
        .select('id, user_id')
        .eq('id', workspaceId)
        .single()

    if (workspaceError || !workspace) {
        throw createError({ statusCode: 404, message: 'Workspace não encontrado' })
    }

    const isOwner = workspace.user_id === userId

    if (!isOwner) {
        // Verificar se é admin
        const { data: membership } = await client
            .from('workspace_members')
            .select('role, status')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .single()

        if (!membership || membership.status !== 'accepted' || membership.role !== 'admin') {
            throw createError({ statusCode: 403, message: 'Sem permissão para adicionar membros' })
        }
    }

    // Buscar usuário pelo email
    const { data: invitedUser, error: userError } = await client
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single()

    if (userError || !invitedUser) {
        throw createError({ statusCode: 404, message: 'Usuário não encontrado' })
    }

    // Verificar se já é membro
    const { data: existingMember } = await client
        .from('workspace_members')
        .select('id, status')
        .eq('workspace_id', workspaceId)
        .eq('user_id', invitedUser.id)
        .single()

    if (existingMember) {
        if (existingMember.status === 'accepted') {
            throw createError({ statusCode: 400, message: 'Usuário já é membro deste workspace' })
        } else if (existingMember.status === 'pending') {
            throw createError({ statusCode: 400, message: 'Convite já enviado para este usuário' })
        }
    }

    // Adicionar membro
    const { data: newMember, error } = await client
        .from('workspace_members')
        .insert({
            workspace_id: workspaceId,
            user_id: invitedUser.id,
            role,
            invited_by: userId,
            status: 'pending'
        })
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return {
        success: true,
        member: {
            ...newMember,
            email: invitedUser.email
        }
    }
})
