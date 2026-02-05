import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const body = await readBody(event)

    if (!body.account_id || !body.amount || !body.type) {
        throw createError({ statusCode: 400, message: 'Campos obrigatórios faltando' })
    }

    // 1. Criar transação
    const { data: transaction, error: txError } = await client
        .from('transactions')
        .insert({
            account_id: body.account_id,
            category_id: body.category_id,
            date: body.date || new Date().toISOString().split('T')[0],
            type: body.type,
            amount: body.amount,
            description: body.description
        })
        .select()
        .single()

    if (txError) {
        throw createError({ statusCode: 500, message: txError.message })
    }

    // 2. Atualizar saldo da conta
    const amountChange = body.type === 'revenue' ? body.amount : -body.amount

    const { error: accError } = await client.rpc('update_account_balance', {
        target_account_id: body.account_id,
        amount_change: amountChange
    })

    // Se a RPC não existir, fazemos manual (menos seguro contra concorrência mas ok para MVP)
    if (accError) {
        const { data: account } = await client
            .from('accounts')
            .select('balance')
            .eq('id', body.account_id)
            .single()

        if (account) {
            await client
                .from('accounts')
                .update({ balance: (account.balance || 0) + amountChange })
                .eq('id', body.account_id)
        }
    }

    return transaction
})
