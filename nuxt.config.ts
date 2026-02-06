// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',
  css: ['./app/assets/css/main.css'],
  
  // Otimizações de Performance
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    viewTransition: true
  },
  
  // Configuração de Roteamento para SPA-like
  router: {
    options: {
      hashMode: false,
      scrollBehaviorType: 'smooth'
    }
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxtjs/supabase'
  ],
  
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/']
    },
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: false
    }
  },
  
  // Otimizações Vite
  vite: {
    optimizeDeps: {
      include: ['cookie']
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'chart': ['chart.js']
          }
        }
      }
    }
  },
  
  build: {
    transpile: ['@supabase/ssr', 'cookie']
  },
  
  // Otimizações de App
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      link: [
        { rel: 'preconnect', href: 'https://ifftngadjtwgjsadqvep.supabase.co' }
      ]
    }
  },
  
  // Nitro Optimizations
  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  }
})
