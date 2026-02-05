import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // Buscar todos os workspaces do usuário
    const { data: workspaces } = await client
        .from('workspaces')
        .select('id')
        .eq('user_id', user.id)

    const workspaceIds = workspaces?.map(w => w.id) || []

    if (workspaceIds.length === 0) {
        return {
            totalBalance: 0,
            totalRevenue: 0,
            totalExpenses: 0,
            profit: 0,
            expensesByCategory: { labels: [], data: [], colors: [] },
            monthlyEvolution: { labels: [], revenues: [], expenses: [] },
            recentTransactions: []
        }
    }

    // Buscar todas as contas dos workspaces
    const { data: accounts } = await client
        .from('accounts')
        .select('id, balance')
        .in('workspace_id', workspaceIds)

    const accountIds = accounts?.map(a => a.id) || []
    const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

    // Buscar todas as transações
    const { data: transactions } = await client
        .from('transactions')
        .select('id, date, type, amount, description, category_id, account_id')
        .in('account_id', accountIds)
        .order('date', { ascending: false })

    // Calcular totais
    let totalRevenue = 0
    let totalExpenses = 0

    transactions?.forEach(tx => {
        if (tx.type === 'revenue') totalRevenue += tx.amount
        else totalExpenses += tx.amount
    })

    const profit = totalRevenue - totalExpenses

    // Buscar categorias para o gráfico de pizza
    const { data: categories } = await client
        .from('categories')
        .select('id, name, color')
        .in('workspace_id', workspaceIds)
        .eq('type', 'expense')

    const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])

    // Agregar despesas por categoria
    const expensesByCat: Record<string, number> = {}
    transactions?.filter(tx => tx.type === 'expense').forEach(tx => {
        const catId = tx.category_id
        expensesByCat[catId] = (expensesByCat[catId] || 0) + tx.amount
    })

    const expenseLabels: string[] = []
    const expenseData: number[] = []
    const expenseColors: string[] = []

    Object.entries(expensesByCat).forEach(([catId, total]) => {
        const cat = categoryMap.get(catId)
        expenseLabels.push(cat?.name || 'Outros')
        expenseData.push(total)
        expenseColors.push(cat?.color || '#6b7280')
    })

    // Evolução mensal (últimos 6 meses)
    const now = new Date()
    const monthLabels: string[] = []
    const monthlyRevenues: number[] = []
    const monthlyExpenses: number[] = []

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }))

        let rev = 0, exp = 0
        transactions?.forEach(tx => {
            if (tx.date.startsWith(monthKey)) {
                if (tx.type === 'revenue') rev += tx.amount
                else exp += tx.amount
            }
        })
        monthlyRevenues.push(rev)
        monthlyExpenses.push(exp)
    }

    // Transações recentes (top 10)
    const recentTransactions = (transactions || []).slice(0, 10).map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description || '',
        category: categoryMap.get(tx.category_id)?.name || 'Sem categoria',
        type: tx.type,
        amount: tx.amount
    }))

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
        recentTransactions
    }
})
