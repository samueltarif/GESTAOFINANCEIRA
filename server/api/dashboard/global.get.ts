import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient<Database>(event)
        const user = await serverSupabaseUser(event)

        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Usuário não autenticado' })
        }

        const userId = user.id || user.sub
        
        if (!userId) {
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Pegar o mês e ano da query string (formato: YYYY-MM)
        const query = getQuery(event)
        const monthFilter = query.month as string
        
        let startDate: string
        let endDate: string
        
        if (monthFilter) {
            const [year, month] = monthFilter.split('-')
            startDate = `${year}-${month}-01`
            // Calcular o primeiro dia do próximo mês
            const nextMonth = new Date(parseInt(year), parseInt(month), 1)
            endDate = nextMonth.toISOString().split('T')[0]
        } else {
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            startDate = `${year}-${month}-01`
            const nextMonth = new Date(year, now.getMonth() + 1, 1)
            endDate = nextMonth.toISOString().split('T')[0]
        }

        // 1. Buscar todos os workspaces do usuário
        const { data: workspaces } = await client
            .from('workspaces')
            .select('id')
            .eq('user_id', userId)

        const workspaceIds = (workspaces || []).map(w => w.id)

        if (workspaceIds.length === 0) {
            return {
                currentAccountBalance: 0,
                totalRevenue: 0,
                totalExpenses: 0,
                profit: 0,
                expensesByCategory: { labels: [], data: [], colors: [] },
                monthlyEvolution: { labels: [], revenues: [], expenses: [] },
                recentTransactions: []
            }
        }

        // 2. SALDO ATUAL = soma de account.balance (filtrado por mês)
        const { data: accounts } = await client
            .from('accounts')
            .select('balance')
            .eq('user_id', userId)
            .eq('month', monthFilter || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

        const currentAccountBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

        // 3. Buscar todas as categorias dos workspaces
        const { data: categories } = await client
            .from('categories')
            .select('id, name, color, type')
            .in('workspace_id', workspaceIds)

        const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])

        // 4. RECEITAS DO MÊS = transações do tipo 'revenue' no período [startDate, endDate)
        const { data: revenueTransactions } = await client
            .from('transactions')
            .select('amount, category_id')
            .ilike('type', 'revenue')
            .gte('date', startDate)
            .lt('date', endDate)

        let totalRevenue = 0
        revenueTransactions?.forEach(tx => {
            // Apenas contar se a categoria pertence a algum workspace do usuário
            if (categoryMap.has(tx.category_id)) {
                totalRevenue += tx.amount || 0
            }
        })

        // 5. DESPESAS DO MÊS = transações do tipo 'expense' no período [startDate, endDate)
        const { data: expenseTransactions } = await client
            .from('transactions')
            .select('amount, category_id')
            .ilike('type', 'expense')
            .gte('date', startDate)
            .lt('date', endDate)

        let totalExpenses = 0
        const expensesByCategory: Record<string, number> = {}

        expenseTransactions?.forEach(tx => {
            // Apenas contar se a categoria pertence a algum workspace do usuário
            if (categoryMap.has(tx.category_id)) {
                totalExpenses += tx.amount || 0
                const catId = tx.category_id || 'unassigned'
                expensesByCategory[catId] = (expensesByCategory[catId] || 0) + (tx.amount || 0)
            }
        })

        // 6. LUCRO/SOBRA = Saldo Atual + Receitas do Mês - Despesas do Mês
        const profit = currentAccountBalance + totalRevenue - totalExpenses

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

        // 7. Evolução mensal (últimos 6 meses)
        const now = new Date()
        const monthLabels: string[] = []
        const monthlyRevenues: number[] = []
        const monthlyExpenses: number[] = []

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split('T')[0]
            
            monthLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }))

            // Receitas do mês
            const { data: monthRevenues } = await client
                .from('transactions')
                .select('amount, category_id')
                .ilike('type', 'revenue')
                .gte('date', monthStart)
                .lt('date', monthEnd)

            let rev = 0
            monthRevenues?.forEach(tx => {
                if (categoryMap.has(tx.category_id)) {
                    rev += tx.amount || 0
                }
            })
            monthlyRevenues.push(rev)

            // Despesas do mês
            const { data: monthExpenses } = await client
                .from('transactions')
                .select('amount, category_id')
                .ilike('type', 'expense')
                .gte('date', monthStart)
                .lt('date', monthEnd)

            let exp = 0
            monthExpenses?.forEach(tx => {
                if (categoryMap.has(tx.category_id)) {
                    exp += tx.amount || 0
                }
            })
            monthlyExpenses.push(exp)
        }

        // 8. Transações recentes do mês
        const { data: recentTxs } = await client
            .from('transactions')
            .select('id, date, description, category_id, type, amount')
            .gte('date', startDate)
            .lt('date', endDate)
            .order('date', { ascending: false })
            .limit(10)

        const recentTransactions = (recentTxs || [])
            .filter(tx => categoryMap.has(tx.category_id))
            .map(tx => ({
                id: tx.id,
                date: tx.date,
                description: tx.description || '',
                category: categoryMap.get(tx.category_id)?.name || 'Sem categoria',
                type: tx.type,
                amount: tx.amount
            }))

        return {
            currentAccountBalance,
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
    } catch (error: any) {
        console.error('❌ Erro na API dashboard:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
