# PRD - Sistema de Gestão Financeira

## 1. Visão Geral do Produto

### 1.1 Objetivo
Sistema web de gestão financeira pessoal que permite aos usuários organizar suas finanças através de workspaces (espaços de trabalho), categorias personalizadas e contas múltiplas, com visualização de dados através de dashboards interativos.

### 1.2 Público-Alvo
- Pessoas físicas que desejam controlar suas finanças pessoais
- Usuários que gerenciam múltiplas contas bancárias
- Pessoas que precisam separar finanças por contextos (pessoal, trabalho, projetos)

### 1.3 Proposta de Valor
- Organização financeira através de workspaces independentes
- Visão global e segmentada das finanças
- Interface intuitiva e responsiva
- Categorização flexível de receitas e despesas
- Dashboards com gráficos e KPIs em tempo real

---

## 2. Stack Tecnológica

### 2.1 Frontend
- **Framework**: Nuxt 4.2.2 (Vue 3.5.26)
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **UI Components**: Componentes customizados baseados em shadcn/ui

### 2.2 Backend
- **Runtime**: Nitro 2.13.0
- **API**: RESTful API com Nuxt Server Routes
- **Autenticação**: Supabase Auth

### 2.3 Banco de Dados
- **Database**: PostgreSQL (Supabase)
- **ORM**: Supabase Client
- **Migrations**: SQL migrations em `supabase_migrations/`

### 2.4 Infraestrutura
- **Hosting**: Vercel (produção)
- **Database Hosting**: Supabase Cloud
- **Environment**: Node.js

---

## 3. Arquitetura do Sistema

### 3.1 Estrutura de Diretórios
```
controle_financeiro/
├── app/
│   ├── components/     # Componentes Vue reutilizáveis
│   ├── composables/    # Composables Vue (lógica reutilizável)
│   ├── pages/          # Páginas da aplicação (rotas)
│   ├── middleware/     # Middleware de autenticação
│   ├── server/         # API endpoints (Nitro)
│   ├── types/          # TypeScript types
│   └── assets/         # CSS e assets estáticos
├── server/
│   └── api/            # API endpoints adicionais
├── supabase_migrations/ # Migrations do banco
├── public/             # Arquivos públicos estáticos
└── docs/               # Documentação
```

### 3.2 Fluxo de Dados
1. **Cliente** → Requisição HTTP → **Nuxt Server API**
2. **API** → Validação de autenticação → **Supabase Auth**
3. **API** → Query/Mutation → **Supabase Database**
4. **Database** → Resposta → **API** → **Cliente**

---

## 4. Modelo de Dados

### 4.1 Entidades Principais

#### Users (Gerenciado pelo Supabase Auth)
- `id` (UUID, PK)
- `email` (string, unique)
- `created_at` (timestamp)

#### Workspaces
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (string)
- `color` (string, hex color)
- `created_at` (timestamp)

#### Categories
- `id` (UUID, PK)
- `workspace_id` (UUID, FK → workspaces.id)
- `name` (string)
- `type` (enum: 'income' | 'expense')
- `created_at` (timestamp)

#### Accounts
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (string)
- `type` (string)
- `month` (string, formato: YYYY-MM)
- `created_at` (timestamp)

#### Transactions
- `id` (UUID, PK)
- `workspace_id` (UUID, FK → workspaces.id)
- `category_id` (UUID, FK → categories.id)
- `account_id` (UUID, FK → accounts.id)
- `description` (string)
- `amount` (decimal)
- `date` (date)
- `created_at` (timestamp)

### 4.2 Relacionamentos
- Um usuário pode ter múltiplos workspaces (1:N)
- Um usuário pode ter múltiplas contas (1:N)
- Um workspace pode ter múltiplas categorias (1:N)
- Um workspace pode ter múltiplas transações (1:N)
- Uma categoria pode ter múltiplas transações (1:N)
- Uma conta pode ter múltiplas transações (1:N)

### 4.3 Regras de Negócio
- **Contas são globais**: Pertencem ao usuário, não ao workspace
- **Categorias são por workspace**: Cada workspace tem suas próprias categorias
- **Transações pertencem a um workspace**: Mas podem usar qualquer conta do usuário
- **Dashboard global**: Mostra todas as transações de todos os workspaces
- **Dashboard do workspace**: Mostra valores globais (todas contas) mas transações filtradas por workspace

---

## 5. Funcionalidades

### 5.1 Autenticação e Autorização

#### 5.1.1 Registro de Usuário
- **Endpoint**: `POST /api/auth/register`
- **Campos**: email, password
- **Validações**:
  - Email válido e único
  - Senha mínima de 6 caracteres
- **Fluxo**:
  1. Usuário preenche formulário de registro
  2. Sistema cria conta no Supabase Auth
  3. Email de confirmação é enviado (opcional)
  4. Usuário é redirecionado para login

#### 5.1.2 Login
- **Endpoint**: Supabase Auth (client-side)
- **Campos**: email, password
- **Fluxo**:
  1. Usuário preenche formulário de login
  2. Sistema valida credenciais
  3. Session é criada
  4. Usuário é redirecionado para dashboard

#### 5.1.3 Logout
- **Componente**: `LogoutButton.vue`
- **Fluxo**:
  1. Usuário clica em logout
  2. Session é destruída
  3. Usuário é redirecionado para home

#### 5.1.4 Proteção de Rotas
- **Middleware**: `auth.ts`
- **Rotas protegidas**:
  - `/dashboard`
  - `/workspaces/*`
  - `/settings`
- **Comportamento**: Redireciona para `/login` se não autenticado

### 5.2 Gestão de Workspaces

#### 5.2.1 Listar Workspaces
- **Endpoint**: `GET /api/workspaces`
- **Página**: `/workspaces/index.vue`
- **Funcionalidades**:
  - Grid de cards com workspaces do usuário
  - Exibe nome e cor de cada workspace
  - Botão para criar novo workspace
  - Botão para editar workspace
  - Botão para acessar workspace

#### 5.2.2 Criar Workspace
- **Endpoint**: `POST /api/workspaces`
- **Modal**: `CreateWorkspaceModal.vue`
- **Campos**:
  - Nome (obrigatório)
  - Cor (8 opções predefinidas + color picker customizado)
- **Validações**:
  - Nome não pode estar vazio
  - Cor deve ser hex válido
- **Feedback**: Toast notification de sucesso/erro

#### 5.2.3 Editar Workspace
- **Endpoint**: `PUT /api/workspaces/[id]`
- **Modais**: 
  - `EditWorkspaceModal.vue` (página de listagem)
  - `ui/EditWorkspaceModal.vue` (página de detalhes)
- **Campos**:
  - Nome (obrigatório)
  - Cor (8 opções predefinidas + color picker customizado)
- **Features**:
  - Preview em tempo real da cor
  - Validação de campos
  - Toast notification de sucesso/erro

#### 5.2.4 Deletar Workspace
- **Endpoint**: `DELETE /api/workspaces/[id]`
- **Comportamento**:
  - Deleta workspace e todas suas categorias e transações (cascade)
  - Confirmação antes de deletar
  - Toast notification de sucesso/erro

#### 5.2.5 Visualizar Workspace
- **Endpoint**: `GET /api/workspaces/[id]`
- **Página**: `/workspaces/[id].vue`
- **Funcionalidades**:
  - Dashboard específico do workspace
  - KPIs: Receitas, Despesas, Lucro/Sobra
  - Gráfico de pizza (distribuição por categoria)
  - Gráfico de barras (receitas vs despesas)
  - Tabela de transações recentes
  - Botões para criar transação, categoria, conta

### 5.3 Gestão de Categorias

#### 5.3.1 Listar Categorias
- **Endpoint**: `GET /api/categories?workspace_id={id}`
- **Contexto**: Dentro da página de settings ou workspace
- **Exibição**: Lista de categorias com tipo (receita/despesa)

#### 5.3.2 Criar Categoria
- **Endpoint**: `POST /api/categories`
- **Modal**: `CreateCategoryModal.vue`
- **Campos**:
  - Nome (obrigatório)
  - Tipo (income/expense)
  - Workspace (seleção)
- **Validações**:
  - Nome não pode estar vazio
  - Tipo deve ser income ou expense
  - Workspace deve existir

#### 5.3.3 Editar Categoria
- **Endpoint**: `PUT /api/categories/[id]`
- **Modal**: `EditCategoryModal.vue`
- **Campos**: Nome, Tipo
- **Validações**: Mesmas da criação

#### 5.3.4 Deletar Categoria
- **Endpoint**: `DELETE /api/categories/[id]`
- **Comportamento**:
  - Deleta categoria e todas suas transações (cascade)
  - Confirmação antes de deletar

### 5.4 Gestão de Contas

#### 5.4.1 Listar Contas
- **Endpoint**: `GET /api/accounts`
- **Contexto**: Settings ou modais de transação
- **Exibição**: Lista de contas com nome, tipo e mês

#### 5.4.2 Criar Conta
- **Endpoint**: `POST /api/accounts`
- **Modal**: `CreateAccountModal.vue`
- **Campos**:
  - Nome (obrigatório)
  - Tipo (ex: Corrente, Poupança, Cartão)
  - Mês (formato YYYY-MM)
- **Validações**:
  - Nome não pode estar vazio
  - Mês deve estar no formato correto

#### 5.4.3 Editar Conta
- **Endpoint**: `PUT /api/accounts/[id]`
- **Modal**: `EditAccountModal.vue`
- **Campos**: Nome, Tipo, Mês
- **Validações**: Mesmas da criação

#### 5.4.4 Deletar Conta
- **Endpoint**: `DELETE /api/accounts/[id]`
- **Comportamento**:
  - Deleta conta e todas suas transações (cascade)
  - Confirmação antes de deletar

### 5.5 Gestão de Transações

#### 5.5.1 Listar Transações
- **Endpoint**: `GET /api/transactions?workspace_id={id}`
- **Contexto**: Dashboard global ou do workspace
- **Exibição**: Tabela com descrição, categoria, conta, valor, data
- **Ordenação**: Por data (mais recente primeiro)
- **Limite**: 10 transações mais recentes

#### 5.5.2 Criar Transação
- **Endpoint**: `POST /api/transactions`
- **Modal**: `CreateTransactionModal.vue`
- **Campos**:
  - Descrição (obrigatório)
  - Categoria (seleção)
  - Conta (seleção)
  - Valor (obrigatório, decimal)
  - Data (obrigatório)
- **Validações**:
  - Descrição não pode estar vazia
  - Valor deve ser maior que 0
  - Categoria e conta devem existir
  - Data deve ser válida

#### 5.5.3 Editar Transação
- **Endpoint**: `PUT /api/transactions/[id]`
- **Modal**: `EditTransactionModal.vue`
- **Campos**: Mesmos da criação
- **Validações**: Mesmas da criação

#### 5.5.4 Deletar Transação
- **Endpoint**: `DELETE /api/transactions/[id]`
- **Comportamento**:
  - Deleta transação
  - Confirmação antes de deletar
  - Toast notification de sucesso/erro

### 5.6 Dashboards

#### 5.6.1 Dashboard Global
- **Endpoint**: `GET /api/dashboard/global`
- **Página**: `/dashboard.vue`
- **KPIs**:
  - Total de Receitas (soma de todas transações de categorias tipo income)
  - Total de Despesas (soma de todas transações de categorias tipo expense)
  - Lucro/Sobra (receitas - despesas)
- **Gráficos**:
  - Gráfico de Pizza: Distribuição de despesas por categoria
  - Gráfico de Barras: Receitas vs Despesas
- **Tabela**: 10 transações mais recentes de todos os workspaces
- **Filtros**: Por período (implementação futura)

#### 5.6.2 Dashboard do Workspace
- **Endpoint**: `GET /api/workspaces/[id]/dashboard`
- **Página**: `/workspaces/[id].vue`
- **KPIs**:
  - Total de Receitas (GLOBAL - todas categorias do usuário)
  - Total de Despesas (GLOBAL - todas categorias do usuário)
  - Lucro/Sobra (receitas - despesas globais)
- **Gráficos**:
  - Gráfico de Pizza: Distribuição por categoria (apenas do workspace)
  - Gráfico de Barras: Receitas vs Despesas (globais)
- **Tabela**: 10 transações mais recentes do workspace específico
- **Nota**: Valores globais garantem consistência entre dashboards

### 5.7 Settings
- **Página**: `/settings.vue`
- **Funcionalidades**:
  - Gerenciar contas
  - Gerenciar categorias
  - Configurações de perfil (futuro)

---

## 6. Interface do Usuário

### 6.1 Design System

#### 6.1.1 Cores
- **Primary**: Verde (#10B981)
- **Secondary**: Azul (#3B82F6)
- **Success**: Verde (#22C55E)
- **Error**: Vermelho (#EF4444)
- **Warning**: Amarelo (#F59E0B)
- **Neutral**: Cinza (#6B7280)

#### 6.1.2 Tipografia
- **Font Family**: System fonts (sans-serif)
- **Tamanhos**:
  - Heading 1: 2.5rem
  - Heading 2: 2rem
  - Heading 3: 1.5rem
  - Body: 1rem
  - Small: 0.875rem

#### 6.1.3 Espaçamento
- **Base**: 4px
- **Escala**: 4, 8, 12, 16, 24, 32, 48, 64px

### 6.2 Componentes UI

#### 6.2.1 Componentes Base
- **Button**: Botão com variantes (primary, secondary, danger)
- **Input**: Campo de texto com label e validação
- **Card**: Container para conteúdo
- **Modal/Dialog**: Overlay para formulários
- **Toast**: Notificações temporárias

#### 6.2.2 Componentes Compostos
- **KpiCard**: Card com KPI (valor + label)
- **BarChart**: Gráfico de barras (Chart.js)
- **PieChart**: Gráfico de pizza (Chart.js)
- **RecentTransactionsTable**: Tabela de transações
- **Header**: Cabeçalho com navegação e logout

#### 6.2.3 Componentes de Formulário
- **MoneyInput**: Input formatado para valores monetários
- **AccountSelect**: Select de contas
- **CategorySelect**: Select de categorias
- **AuthInput**: Input para autenticação
- **AuthForm**: Formulário de login/registro

### 6.3 Navegação

#### 6.3.1 Estrutura de Rotas
```
/                       → Landing page
/login                  → Login
/register               → Registro
/dashboard              → Dashboard global (protegido)
/workspaces             → Lista de workspaces (protegido)
/workspaces/new         → Criar workspace (protegido)
/workspaces/[id]        → Dashboard do workspace (protegido)
/settings               → Configurações (protegido)
/auth/confirm           → Confirmação de email
```

#### 6.3.2 Header
- **Logo/Nome**: Link para dashboard
- **Navegação**:
  - Dashboard
  - Workspaces
  - Settings
- **User Menu**: Logout

### 6.4 Responsividade
- **Mobile First**: Design otimizado para mobile
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Adaptações**:
  - Grid de workspaces: 1 coluna (mobile) → 2 colunas (tablet) → 3 colunas (desktop)
  - Gráficos: Stack vertical (mobile) → Side by side (desktop)
  - Tabelas: Scroll horizontal (mobile) → Full width (desktop)

---

## 7. API Endpoints

### 7.1 Autenticação
```
POST   /api/auth/register              # Criar conta
POST   /api/auth/confirm-email         # Confirmar email
POST   /api/auth/auto-confirm          # Auto-confirmar (dev)
POST   /api/auth/confirm-all-users     # Confirmar todos (admin)
POST   /api/auth/register-instant      # Registro instantâneo
```

### 7.2 Workspaces
```
GET    /api/workspaces                 # Listar workspaces do usuário
POST   /api/workspaces                 # Criar workspace
GET    /api/workspaces/[id]            # Obter workspace específico
PUT    /api/workspaces/[id]            # Atualizar workspace
DELETE /api/workspaces/[id]            # Deletar workspace
GET    /api/workspaces/[id]/dashboard  # Dashboard do workspace
GET    /api/workspaces/preview         # Preview de workspaces
POST   /api/workspaces/delete-multiple # Deletar múltiplos
```

### 7.3 Categorias
```
GET    /api/categories                 # Listar categorias
POST   /api/categories                 # Criar categoria
PUT    /api/categories/[id]            # Atualizar categoria
DELETE /api/categories/[id]            # Deletar categoria
```

### 7.4 Contas
```
GET    /api/accounts                   # Listar contas
POST   /api/accounts                   # Criar conta
PUT    /api/accounts/[id]              # Atualizar conta
DELETE /api/accounts/[id]              # Deletar conta
```

### 7.5 Transações
```
GET    /api/transactions               # Listar transações
POST   /api/transactions               # Criar transação
PUT    /api/transactions/[id]          # Atualizar transação
DELETE /api/transactions/[id]          # Deletar transação
```

### 7.6 Dashboard
```
GET    /api/dashboard/global           # Dashboard global
GET    /api/dashboard/global-bypass    # Dashboard global (bypass RLS)
```

---

## 8. Segurança

### 8.1 Autenticação
- **Provider**: Supabase Auth
- **Método**: JWT (JSON Web Tokens)
- **Storage**: Cookies HTTP-only
- **Expiração**: Configurável no Supabase

### 8.2 Autorização
- **Row Level Security (RLS)**: Habilitado em todas as tabelas
- **Políticas**:
  - Usuários só podem ver/editar seus próprios dados
  - Workspaces: `user_id = auth.uid()`
  - Categorias: Via workspace ownership
  - Contas: `user_id = auth.uid()`
  - Transações: Via workspace ownership

### 8.3 Validação
- **Frontend**: Validação de formulários antes do envio
- **Backend**: Validação de dados em todos os endpoints
- **Database**: Constraints e foreign keys

### 8.4 Proteção contra Ataques
- **SQL Injection**: Uso de prepared statements (Supabase Client)
- **XSS**: Sanitização de inputs (Vue automático)
- **CSRF**: Tokens em formulários (implementação futura)
- **Rate Limiting**: Configurável no Supabase

---

## 9. Performance

### 9.1 Otimizações Frontend
- **Code Splitting**: Automático pelo Vite
- **Lazy Loading**: Componentes e rotas carregados sob demanda
- **Tree Shaking**: Remoção de código não utilizado
- **Minificação**: CSS e JS minificados em produção
- **Caching**: Assets com cache headers

### 9.2 Otimizações Backend
- **Database Indexes**: Em colunas frequentemente consultadas
- **Query Optimization**: Queries otimizadas com joins eficientes
- **Connection Pooling**: Gerenciado pelo Supabase
- **Caching**: Cache de queries frequentes (implementação futura)

### 9.3 Métricas de Performance
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Bundle Size**: ~800 KB (comprimido)

---

## 10. Testes

### 10.1 Testes Manuais
- **Arquivos de teste**:
  - `test-api-register.js`
  - `test-auth-session.html`
  - `test-browser.html`
  - `test-dashboard-comparison.js`
  - `test-delete-transaction.js`
  - `test-full-transaction-flow.js`
  - `test-login-complete.js`
  - `test-register-api.html`
  - `test-transaction-direct.js`

### 10.2 Cenários de Teste
1. **Autenticação**:
   - Registro de novo usuário
   - Login com credenciais válidas
   - Login com credenciais inválidas
   - Logout
   - Proteção de rotas

2. **Workspaces**:
   - Criar workspace
   - Editar workspace (nome e cor)
   - Deletar workspace
   - Listar workspaces

3. **Categorias**:
   - Criar categoria de receita
   - Criar categoria de despesa
   - Editar categoria
   - Deletar categoria

4. **Contas**:
   - Criar conta
   - Editar conta
   - Deletar conta
   - Listar contas

5. **Transações**:
   - Criar transação de receita
   - Criar transação de despesa
   - Editar transação
   - Deletar transação
   - Listar transações

6. **Dashboards**:
   - Visualizar dashboard global
   - Visualizar dashboard do workspace
   - Verificar cálculos de KPIs
   - Verificar gráficos
   - Verificar tabela de transações

### 10.3 Testes Futuros
- **Unit Tests**: Jest + Vue Test Utils
- **Integration Tests**: Playwright
- **E2E Tests**: Cypress
- **Performance Tests**: Lighthouse CI

---

## 11. Deploy e Infraestrutura

### 11.1 Ambiente de Desenvolvimento
- **URL**: http://localhost:3000 (ou 3001, 3002)
- **Hot Reload**: Habilitado
- **DevTools**: Vue DevTools + Nuxt DevTools
- **Database**: Supabase Cloud (desenvolvimento)

### 11.2 Ambiente de Produção
- **Hosting**: Vercel
- **URL**: A definir
- **Database**: Supabase Cloud (produção)
- **CDN**: Vercel Edge Network
- **SSL**: Automático (Vercel)

### 11.3 CI/CD
- **Git**: GitHub
- **Repository**: git@github.com:samueltarif/GESTAOFINANCEIRA.git
- **Branch**: master
- **Deploy**: Automático via Vercel (push to master)

### 11.4 Variáveis de Ambiente
```env
SUPABASE_URL=https://ifftngadjtwgjsadqvep.supabase.co
SUPABASE_KEY=<anon_key>
SUPABASE_SERVICE_KEY=<service_key>
```

### 11.5 Build
- **Comando**: `npm run build`
- **Output**: `.output/`
- **Tamanho**: ~4.81 MB (1.12 MB gzip)
- **Tempo**: ~25s (client + server + prerender)

---

## 12. Manutenção e Suporte

### 12.1 Logs
- **Frontend**: Console do navegador
- **Backend**: Logs do Nitro (stdout)
- **Database**: Logs do Supabase Dashboard

### 12.2 Monitoramento
- **Uptime**: Vercel Analytics
- **Errors**: Console logs (implementar Sentry futuramente)
- **Performance**: Vercel Speed Insights

### 12.3 Backup
- **Database**: Backups automáticos do Supabase (diários)
- **Code**: Git (GitHub)

### 12.4 Atualizações
- **Dependencies**: Verificar mensalmente
- **Security Patches**: Aplicar imediatamente
- **Features**: Conforme roadmap

---

## 13. Roadmap Futuro

### 13.1 Curto Prazo (1-3 meses)
- [ ] Filtros de data nos dashboards
- [ ] Exportação de dados (CSV, PDF)
- [ ] Gráficos adicionais (linha do tempo, tendências) ok
- [ ] Busca e filtros avançados de transações
- [ ] Categorias com ícones personalizados
- [ ] Temas (dark mode)

### 13.2 Médio Prazo (3-6 meses)
- [ ] Orçamentos por categoria
- [ ] Metas financeiras
- [ ] Notificações e alertas
- [ ] Relatórios mensais automáticos
- [ ] Importação de extratos bancários
- [ ] Multi-moeda

### 13.3 Longo Prazo (6-12 meses)
- [ ] App mobile (React Native ou PWA)
- [ ] Compartilhamento de workspaces
- [ ] Integração com bancos (Open Banking)
- [ ] IA para categorização automática
- [ ] Previsões e insights financeiros
- [ ] Planos premium

---

## 14. Glossário

- **Workspace**: Espaço de trabalho isolado para organizar finanças por contexto
- **Categoria**: Classificação de transações (ex: Salário, Alimentação, Transporte)
- **Conta**: Conta bancária ou meio de pagamento (ex: Conta Corrente, Cartão de Crédito)
- **Transação**: Registro de receita ou despesa
- **KPI**: Key Performance Indicator (Indicador-chave de desempenho)
- **Dashboard**: Painel com visualização de dados e métricas
- **RLS**: Row Level Security (Segurança em nível de linha)
- **JWT**: JSON Web Token (Token de autenticação)
- **SSR**: Server-Side Rendering (Renderização no servidor)
- **SPA**: Single Page Application (Aplicação de página única)

---

## 15. Contatos e Recursos

### 15.1 Equipe
- **Desenvolvedor**: Samuel Tarif
- **Email**: samuel.tarif@gmail.com

### 15.2 Links Úteis
- **Repositório**: https://github.com/samueltarif/GESTAOFINANCEIRA
- **Supabase Dashboard**: https://ifftngadjtwgjsadqvep.supabase.co
- **Documentação Nuxt**: https://nuxt.com
- **Documentação Supabase**: https://supabase.com/docs
- **Documentação Vue**: https://vuejs.org
- **Documentação Tailwind**: https://tailwindcss.com

---

**Versão**: 1.0  
**Data**: 10/02/2026  
**Status**: Produção
