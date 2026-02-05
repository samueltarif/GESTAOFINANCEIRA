import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default defineEventHandler(async (event) => {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const workspaceId = getRouterParam(event, 'id')
        
        if (!workspaceId) {
            throw createError({ statusCode: 400, statusMessage: 'ID do workspace é obrigatório' })
        }

        // Validar se é um UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(workspaceId)) {
            throw createError({ statusCode: 400, statusMessage: 'ID do workspace inválido' })
        }

        // 1. Verificar se o workspace existe
        const { data: workspace } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', workspaceId)
            .single()

        if (!workspace) {
            throw createError({ statusCode: 404, statusMessage: 'Workspace não encontrado' })
        }

        // 2. Buscar todas as contas GLOBAIS do usuário (após migração)
        const { data: accounts } = await supabase
            .from('accounts')
            .select('id, balance')
            .eq('user_id', workspace.user_id) // Usar user_id em vez de workspace_id

        const accountIds = (accounts || []).map(a => a.id)
        const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

        // 3. Buscar todas as categorias do workspace
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, color, type')
            .eq('workspace_id', workspaceId)

        const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])

        // 4. Buscar transações das contas globais, mas filtrar por categorias do workspace
        let transactions: any[] = []
        if (accountIds.length > 0) {
            const categoryIds = (categories || []).map(c => c.id)
            
            if (categoryIds.length > 0) {
                const { data: txs } = await supabase
                    .from('transactions')
                    .select('*')
                    .in('account_id', accountIds)
                    .in('category_id', categoryIds) // Filtrar por categorias do workspace
                    .order('date', { ascending: false })

                transactions = txs || []
            }
        }

        // 5. Cálculos do workspace
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
        console.error('❌ Erro na API dashboard workspace:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})