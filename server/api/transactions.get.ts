import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const userId = user.id || user.sub
    
    if (!userId) {
        console.error('❌ ERRO CRÍTICO: nem user.id nem user.sub estão disponíveis')
        throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
    }

    const query = getQuery(event)
    
    // Parâmetros de filtro
    const search = query.search as string
    const type = query.type as string
    const categoryId = query.category_id as string
    const accountId = query.account_id as string
    const workspaceId = query.workspace_id as string
    const startDate = query.start_date as string
    const endDate = query.end_date as string
    const minAmount = query.min_amount ? parseFloat(query.min_amount as string) : null
    const maxAmount = query.max_amount ? parseFloat(query.max_amount as string) : null
    
    // Parâmetros de ordenação e paginação
    const sortBy = (query.sort_by as string) || 'date'
    const sortOrder = (query.sort_order as string) || 'desc'
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20

    // Buscar contas do usuário
    const { data: userAccounts, error: accountsError } = await client
        .from('accounts')
        .select('id')
        .eq('user_id', userId)

    if (accountsError) {
        throw createError({ statusCode: 500, message: accountsError.message })
    }

    const userAccountIds = (userAccounts || []).map((acc: any) => acc.id)

    if (userAccountIds.length === 0) {
        return { transactions: [], total: 0 }
    }

    // Query base com joins para pegar nomes
    let dbQuery = client
        .from('transactions')
        .select(`
            *,
            categories!inner(id, name, workspace_id),
            accounts!inner(id, name, user_id)
        `, { count: 'exact' })
        .in('account_id', userAccountIds)

    // Aplicar filtros
    if (search) {
        dbQuery = dbQuery.ilike('description', `%${search}%`)
    }

    if (type && type !== 'all') {
        dbQuery = dbQuery.eq('type', type)
    }

    if (categoryId) {
        dbQuery = dbQuery.eq('category_id', categoryId)
    }

    if (accountId) {
        dbQuery = dbQuery.eq('account_id', accountId)
    }

    if (workspaceId) {
        dbQuery = dbQuery.eq('categories.workspace_id', workspaceId)
    }

    if (startDate) {
        dbQuery = dbQuery.gte('date', startDate)
    }

    if (endDate) {
        dbQuery = dbQuery.lte('date', endDate)
    }

    if (minAmount !== null) {
        dbQuery = dbQuery.gte('amount', minAmount)
    }

    if (maxAmount !== null) {
        dbQuery = dbQuery.lte('amount', maxAmount)
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc'
    dbQuery = dbQuery.order(sortBy, { ascending })

    // Aplicar paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    dbQuery = dbQuery.range(from, to)

    const { data, error, count } = await dbQuery

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    // Formatar dados para incluir nomes de categoria e conta e workspace_id
    const transactions = (data || []).map((tx: any) => ({
        ...tx,
        category_name: tx.categories?.name || '',
        account_name: tx.accounts?.name || '',
        workspace_id: tx.categories?.workspace_id || ''
    }))

    return {
        transactions,
        total: count || 0
    }
})
