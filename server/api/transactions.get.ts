import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // CORREÇÃO: Usar user.id ou user.sub como fallback
    const userId = user.id || user.sub
    
    if (!userId) {
        console.error('❌ ERRO CRÍTICO: nem user.id nem user.sub estão disponíveis')
        throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
    }

    const query = getQuery(event)
    const workspaceId = query.workspace_id as string

    // Primeiro, buscar apenas as contas do usuário autenticado
    let accountsQuery = client
        .from('accounts')
        .select('id')
        .eq('user_id', userId)

    const { data: userAccounts, error: accountsError } = await accountsQuery

    if (accountsError) {
        throw createError({ statusCode: 500, message: accountsError.message })
    }

    const userAccountIds = (userAccounts || []).map(acc => acc.id)

    if (userAccountIds.length === 0) {
        return []
    }

    // Agora buscar transações apenas das contas do usuário
    let dbQuery = client.from('transactions').select(`
        *,
        accounts!inner(id, workspace_id, user_id)
    `)
    .in('account_id', userAccountIds)

    // Se houver workspace_id, filtramos também por ele
    if (workspaceId) {
        dbQuery = dbQuery.eq('accounts.workspace_id', workspaceId)
    }

    const { data, error } = await dbQuery
        .order('date', { ascending: false })
        .limit(50)

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})
