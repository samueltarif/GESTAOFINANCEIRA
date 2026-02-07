import { createClient } from '@supabase/supabase-js'

/**
 * 🚀 API ULTRA-OTIMIZADA para registro instantâneo
 * Cria usuário já confirmado para login imediato
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
        const body = await readBody(event)
        
        if (!body.email || !body.password) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Email e senha são obrigatórios' 
            })
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Email inválido' 
            })
        }

        // Validar senha
        if (body.password.length < 6) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Senha deve ter pelo menos 6 caracteres' 
            })
        }

        const startTime = Date.now()
        console.log('🚀 [INSTANT] Criando usuário:', body.email)

        // Criar usuário JÁ CONFIRMADO
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: body.email,
            password: body.password,
            email_confirm: true,
            user_metadata: {
                created_via: 'register_instant_api',
                created_at: new Date().toISOString()
            }
        })

        if (error) {
            console.error('❌ Erro:', error)
            
            if (error.message.includes('already registered') || 
                error.message.includes('duplicate')) {
                throw createError({ 
                    statusCode: 409, 
                    statusMessage: 'Email já cadastrado' 
                })
            }
            
            throw createError({ 
                statusCode: 500, 
                statusMessage: `Erro: ${error.message}` 
            })
        }

        const totalTime = Date.now() - startTime
        console.log(`✅ [INSTANT] Criado em ${totalTime}ms:`, data.user?.email)

        return { 
            success: true, 
            message: 'Usuário criado!',
            user: {
                id: data.user?.id,
                email: data.user?.email,
                email_confirmed: true
            },
            performance: {
                total_time_ms: totalTime
            }
        }

    } catch (error: any) {
        console.error('❌ Erro no registro:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Erro interno' 
        })
    }
})
