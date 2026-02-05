import { createClient } from '@supabase/supabase-js'

/**
 * 🔧 API para confirmar TODOS os usuários não confirmados
 */

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export default defineEventHandler(async (event) => {
    try {
        console.log('🔧 Iniciando confirmação em massa de usuários...')

        // Buscar todos os usuários
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
            throw createError({ 
                statusCode: 500, 
                statusMessage: `Erro ao listar usuários: ${listError.message}` 
            })
        }

        console.log(`📊 Total de usuários encontrados: ${users.users.length}`)

        // Filtrar usuários não confirmados
        const unconfirmedUsers = users.users.filter(u => !u.email_confirmed_at)
        
        console.log(`📧 Usuários não confirmados: ${unconfirmedUsers.length}`)

        if (unconfirmedUsers.length === 0) {
            return {
                success: true,
                message: 'Todos os usuários já estão confirmados',
                total: users.users.length,
                confirmed: 0
            }
        }

        // Confirmar todos os usuários não confirmados
        const results = []
        for (const user of unconfirmedUsers) {
            try {
                const { error } = await supabaseAdmin.auth.admin.updateUserById(
                    user.id,
                    { 
                        email_confirmed_at: new Date().toISOString()
                    }
                )

                if (error) {
                    console.error(`❌ Erro ao confirmar ${user.email}:`, error.message)
                    results.push({ email: user.email, success: false, error: error.message })
                } else {
                    console.log(`✅ Confirmado: ${user.email}`)
                    results.push({ email: user.email, success: true })
                }
            } catch (err: any) {
                console.error(`❌ Erro ao confirmar ${user.email}:`, err.message)
                results.push({ email: user.email, success: false, error: err.message })
            }
        }

        const successCount = results.filter(r => r.success).length

        console.log(`✅ Confirmação concluída: ${successCount}/${unconfirmedUsers.length}`)

        return {
            success: true,
            message: `${successCount} usuários confirmados com sucesso`,
            total: users.users.length,
            confirmed: successCount,
            failed: unconfirmedUsers.length - successCount,
            details: results
        }

    } catch (error: any) {
        console.error('❌ Erro na confirmação em massa:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Erro interno do servidor' 
        })
    }
})
