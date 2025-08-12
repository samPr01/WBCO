import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  wallet_address: string;
  user_id: string;
  last_login: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  wallet_address: string;
  amount: number;
  type: 'deposit' | 'transfer';
  timestamp: string;
  created_at: string;
}

export interface SupportRequest {
  id: string;
  wallet_address: string;
  message: string;
  timestamp: string;
  created_at: string;
  status?: 'pending' | 'resolved';
  response?: string;
}

// Helper function to generate user ID
export const generateUserId = () => Math.random().toString(36).substring(2, 7).toUpperCase();
