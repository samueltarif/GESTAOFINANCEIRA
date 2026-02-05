import { createClient } from '@supabase/supabase-js'

/**
 * 🔧 API para registro de novos usuários com auto-confirmação
 * 
 * Esta API cria novos usuários e os confirma automaticamente
 * para evitar problemas de confirmação de email
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
        
        if (!body.email || !body.password) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Email e senha são obrigatórios' 
            })
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Formato de email inválido' 
            })
        }

        // Validar força da senha
        if (body.password.length < 6) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Senha deve ter pelo menos 6 caracteres' 
            })
        }

        console.log(`🔧 Criando usuário com auto-confirmação: ${body.email}`)

        // Criar usuário já confirmado
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: body.email,
            password: body.password,
            email_confirmed_at: new Date().toISOString(), // Confirmar automaticamente
            user_metadata: {
                created_via: 'auto_register_api',
                created_at: new Date().toISOString()
            }
        })

        if (error) {
            console.error('❌ Erro ao criar usuário:', error)
            
            if (error.message.includes('already registered')) {
                throw createError({ 
                    statusCode: 409, 
                    statusMessage: 'Este email já está cadastrado' 
                })
            }
            
            throw createError({ 
                statusCode: 500, 
                statusMessage: `Erro ao criar usuário: ${error.message}` 
            })
        }

        console.log(`✅ Usuário criado e confirmado automaticamente: ${body.email}`)

        // Criar entrada na tabela users (se necessário)
        try {
            const { error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: data.user.sub,
                    email: data.user.email
                })

            if (insertError && !insertError.message.includes('duplicate key')) {
                console.error('⚠️ Erro ao criar entrada na tabela users:', insertError)
            }
        } catch (userTableError) {
            console.error('⚠️ Erro na tabela users (não crítico):', userTableError)
        }

        return { 
            success: true, 
            message: 'Usuário criado e confirmado automaticamente',
            user: {
                id: data.user.sub,
                email: data.user.email,
                confirmed_at: data.user.email_confirmed_at
            }
        }

    } catch (error: any) {
        console.error('❌ Erro no registro:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Erro interno do servidor' 
        })
    }
})