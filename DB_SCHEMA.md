# DB_SCHEMA - PLANO 1 (MVP PESSOA FÍSICA)

## TABELAS OBRIGATÓRIAS

### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` (UUID, PK) - Identificador único do usuário
- `email` (VARCHAR) - Email do usuário (único)
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (id)
- UNIQUE INDEX (email)

---

### 2. workspaces
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('personal', 'business', 'investment')),
  currency VARCHAR(3) DEFAULT 'BRL',
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` (UUID, PK) - Identificador único do workspace
- `user_id` (UUID, FK) - Referência ao usuário proprietário
- `name` (VARCHAR) - Nome do workspace
- `type` (VARCHAR) - Tipo: personal, business, investment
- `currency` (VARCHAR) - Moeda (padrão BRL)
- `color` (VARCHAR) - Cor hexadecimal para identificação visual
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (type)

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE

---

### 3. accounts (CONTAS GLOBAIS)
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('checking', 'savings', 'cash', 'credit_card')),
  balance DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` (UUID, PK) - Identificador único da conta
- `user_id` (UUID, FK) - Referência ao usuário (GLOBAL POR USUÁRIO)
- `name` (VARCHAR) - Nome da conta
- `type` (VARCHAR) - Tipo: checking, savings, cash, credit_card
- `balance` (DECIMAL) - Saldo atual da conta
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (type)

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE

**MUDANÇA IMPORTANTE**: Contas agora são globais por usuário, não por workspace!

---

### 4. categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'expense')),
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` (UUID, PK) - Identificador único da categoria
- `workspace_id` (UUID, FK) - Referência ao workspace
- `name` (VARCHAR) - Nome da categoria
- `type` (VARCHAR) - Tipo: revenue, expense
- `icon` (VARCHAR) - Ícone da categoria
- `color` (VARCHAR) - Cor hexadecimal para identificação visual
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (id)
- INDEX (workspace_id)
- INDEX (type)

**Foreign Keys:**
- workspace_id → workspaces(id) ON DELETE CASCADE

---

### 5. transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'expense')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` (UUID, PK) - Identificador único da transação
- `account_id` (UUID, FK) - Referência à conta
- `category_id` (UUID, FK) - Referência à categoria
- `type` (VARCHAR) - Tipo: revenue, expense
- `amount` (DECIMAL) - Valor da transação
- `description` (TEXT) - Descrição da transação
- `date` (DATE) - Data da transação
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (id)
- INDEX (workspace_id)
- INDEX (account_id)
- INDEX (category_id)
- INDEX (type)
- INDEX (date)

**Foreign Keys:**
- workspace_id → workspaces(id) ON DELETE CASCADE
- account_id → accounts(id) ON DELETE CASCADE
- category_id → categories(id) ON DELETE CASCADE

---

## RESUMO DO SCHEMA

**Total de Tabelas:** 5
- users (base de autenticação)
- workspaces (espaços de trabalho)
- accounts (contas financeiras)
- categories (categorias de transações)
- transactions (transações financeiras)

**Relacionamentos:**
- 1 user → N workspaces
- 1 workspace → N accounts
- 1 workspace → N categories
- 1 workspace → N transactions
- 1 account → N transactions
- 1 category → N transactions

**Constraints:**
- Todos os IDs são UUID
- Tipos são validados via CHECK constraints
- Cascata de deleção para manter integridade
- Timestamps automáticos para auditoria