// @ts-nocheck
// API Types - Replacing @shared/api imports to reduce bundle size
export interface User {
  id: string;
  email: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  wallet_address?: string;
}

export interface BalanceResponse {
  balance: string;
  currency: string;
}

export interface CreateTransactionRequest {
  amount: string;
  type: 'deposit' | 'withdraw';
  currency: string;
}

export interface Transaction {
  id: string;
  amount: string;
  type: string;
  status: string;
  created_at: string;
  wallet_address: string;
  tx_hash?: string;
  gas_used?: string;
  gas_price?: string;
  token_symbol?: string;
  token_address?: string;
}

export interface CryptoPricesResponse {
  prices: Record<string, number>;
  timestamp: number;
}

export interface CryptoChartData {
  timestamp: number;
  price: number;
  volume: number;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: string;
}

export interface TradingSignalsResponse {
  signals: TradingSignal[];
}

export interface OrdersResponse {
  orders: Order[];
}

export interface CreateOrderRequest {
  symbol: string;
  type: 'MARKET' | 'LIMIT';
  side: 'BUY' | 'SELL';
  amount: string;
  price?: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: string;
  side: string;
  amount: string;
  price: string;
  status: string;
  created_at: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  min_amount: string;
  max_amount: string;
  duration_days: number;
  expected_return: number;
}

export interface InvestmentsResponse {
  investments: Investment[];
}

export interface CreateInvestmentRequest {
  plan_id: string;
  amount: string;
}

export interface Investment {
  id: string;
  plan_id: string;
  amount: string;
  status: string;
  created_at: string;
  expected_return: string;
}

export interface WatchlistResponse {
  items: WatchlistItem[];
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  added_at: string;
}

