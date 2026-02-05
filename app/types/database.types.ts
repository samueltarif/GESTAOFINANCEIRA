export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            workspaces: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    type: 'personal' | 'business' | 'investment'
                    currency: string
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    type: 'personal' | 'business' | 'investment'
                    currency?: string
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    type?: 'personal' | 'business' | 'investment'
                    currency?: string
                    color?: string | null
                    created_at?: string
                }
            }
            accounts: {
                Row: {
                    id: string
                    workspace_id: string
                    name: string
                    type: 'checking' | 'savings' | 'cash' | 'credit_card'
                    balance: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    name: string
                    type: 'checking' | 'savings' | 'cash' | 'credit_card'
                    balance?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    name?: string
                    type?: 'checking' | 'savings' | 'cash' | 'credit_card'
                    balance?: number
                    created_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    workspace_id: string
                    name: string
                    type: 'revenue' | 'expense'
                    icon: string | null
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    name: string
                    type: 'revenue' | 'expense'
                    icon?: string | null
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    name?: string
                    type?: 'revenue' | 'expense'
                    icon?: string | null
                    color?: string | null
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    account_id: string
                    category_id: string
                    date: string
                    type: 'revenue' | 'expense'
                    amount: number
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    account_id: string
                    category_id: string
                    date: string
                    type: 'revenue' | 'expense'
                    amount: number
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    account_id?: string
                    category_id?: string
                    date?: string
                    type?: 'revenue' | 'expense'
                    amount?: number
                    description?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
