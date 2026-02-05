import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)
    const workspaceId = getRouterParam(event, 'id')

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // 1. Validar acesso ao workspace
    const { data: workspace, error: wsError } = await client
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId || '')
        .eq('user_id', user.id)
        .single()

    if (wsError || !workspace) {
        throw createError({ statusCode: 404, message: 'Workspace não encontrado' })
    }

    // 2. Buscar contas deste workspace
    const { data: accounts } = await client
        .from('accounts')
        .select('id, balance')
        .eq('workspace_id', workspaceId)

    const accountIds = (accounts || []).map(a => a.id)
    const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

    // 3. Buscar categorias do workspace
    const { data: categories } = await client
        .from('categories')
        .select('id, name, color, type')
        .eq('workspace_id', workspaceId)

    const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])

    // 4. Buscar transações
    let transactions: any[] = []
    if (accountIds.length > 0) {
        const { data: txs } = await client
            .from('transactions')
            .select('*')
            .in('account_id', accountIds)
            .order('date', { ascending: false })

        transactions = txs || []
    }

    // 5. Cálculos
    let totalRevenue = 0
    let totalExpenses = 0
    const expensesByCategory: Record<string, number> = {}

    transactions.forEach(tx => {
        if (tx.type === 'revenue') {
            totalRevenue += tx.amount
        } else {
            totalExpenses += tx.amount
            const catId = tx.category_id || 'unassigned'
            expensesByCategory[catId] = (expensesByCategory[catId] || 0) + tx.amount
        }
    })

    const profit = totalRevenue - totalExpenses

    // Preparar dados para o gráfico de pizza
    const expenseLabels: string[] = []
    const expenseData: number[] = []
    const expenseColors: string[] = []

    Object.entries(expensesByCategory).forEach(([catId, total]) => {
        const cat = categoryMap.get(catId)
        expenseLabels.push(cat?.name || 'Vários')
        expenseData.push(total)
        expenseColors.push(cat?.color || '#94a3b8')
    })

    // 6. Evolução mensal (últimos 6 meses)
    const now = new Date()
    const monthLabels: string[] = []
    const monthlyRevenues: number[] = []
    const monthlyExpenses: number[] = []

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }))

        let rev = 0, exp = 0
        transactions.forEach(tx => {
            if (tx.date.startsWith(monthKey)) {
                if (tx.type === 'revenue') rev += tx.amount
                else exp += tx.amount
            }
        })
        monthlyRevenues.push(rev)
        monthlyExpenses.push(exp)
    }

    return {
        totalBalance,
        totalRevenue,
        totalExpenses,
        profit,
        expensesByCategory: {
            labels: expenseLabels,
            data: expenseData,
            colors: expenseColors
        },
        monthlyEvolution: {
            labels: monthLabels,
            revenues: monthlyRevenues,
            expenses: monthlyExpenses
        },
        recentTransactions: transactions.slice(0, 10).map(tx => ({
            id: tx.id,
            date: tx.date,
            description: tx.description || '',
            category: categoryMap.get(tx.category_id)?.name || 'Sem categoria',
            type: tx.type,
            amount: tx.amount
        }))
    }
})
