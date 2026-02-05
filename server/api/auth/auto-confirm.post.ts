import { createClient } from '@supabase/supabase-js'

/**
 * 🔧 API para auto-confirmação de novos usuários
 * 
 * Esta API confirma automaticamente novos usuários para evitar
 * o problema "Email not confirmed" durante o desenvolvimento
 */

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente admin com permissões especiais
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        
        if (!body.email) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Email é obrigatório' 
            })
        }



        // Buscar o usuário pelo email
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
            throw createError({ 
                statusCode: 500, 
                statusMessage: `Erro ao listar usuários: ${listError.message}` 
            })
        }

        const user = users.users.find(u => u.email === body.email)
        
        if (!user) {
            throw createError({ 
                statusCode: 404, 
                statusMessage: 'Usuário não encontrado' 
            })
        }

        // Se já está confirmado, retornar sucesso
        if (user.email_confirmed_at) {

            return { 
                success: true, 
                message: 'Usuário já confirmado',
                confirmed_at: user.email_confirmed_at
            }
        }

        // Confirmar o email automaticamente
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            user.sub,
            { 
                email_confirmed_at: new Date().toISOString()
            }
        )

        if (error) {
            throw createError({ 
                statusCode: 500, 
                statusMessage: `Erro ao confirmar email: ${error.message}` 
            })
        }



        return { 
            success: true, 
            message: 'Email confirmado automaticamente',
            user_id: user.sub,
            confirmed_at: new Date().toISOString()
        }

    } catch (error: any) {
        console.error('❌ Erro na auto-confirmação:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Erro interno do servidor' 
        })
    }
})
