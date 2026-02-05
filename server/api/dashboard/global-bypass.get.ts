// API permanente para dashboard global do usuário autenticado
// Substitui a API dashboard/global-bypass.get.ts

export default defineEventHandler(async (event) => {
    try {
        // Obter usuário autenticado
        const user = await serverSupabaseUser(event)
        
        if (!user) {
            throw createError({ 
                statusCode: 401, 
                statusMessage: 'Usuário não autenticado' 
            })
        }

        const supabase = serverSupabaseClient(event)

        // 1. Buscar todos os workspaces do usuário autenticado
        const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id')
            .eq('user_id', user.id)

        const workspaceIds = (workspaces || []).map(w => w.id)

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

        // 2. Buscar todas as contas GLOBAIS do usuário (após migração)
        const { data: accounts } = await supabase
            .from('accounts')
            .select('id, balance')
            .eq('user_id', userId) // Usar user_id em vez de workspace_id

        const accountIds = (accounts || []).map(a => a.id)
        const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

        // 3. Buscar todas as categorias dos workspaces
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, color, type')
            .in('workspace_id', workspaceIds)

        const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])

        // 4. Buscar todas as transações através das contas
        let transactions: any[] = []
        if (accountIds.length > 0) {
            const { data: txs } = await supabase
                .from('transactions')
                .select('*')
                .in('account_id', accountIds)
                .order('date', { ascending: false })

            transactions = txs || []
        }

        // 5. Cálculos globais
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
    } catch (error) {
        console.error('❌ Erro na API dashboard:', error)
        throw createError({ statusCode: 500, message: 'Erro interno do servidor' })
    }
})
