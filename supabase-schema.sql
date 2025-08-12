-- Supabase Database Schema for WalletBase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    user_id TEXT UNIQUE NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (updated with token support)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    type TEXT CHECK (type IN ('deposit', 'withdraw', 'transfer', 'deposit_token', 'withdraw_token')) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tx_hash TEXT,
    gas_used TEXT,
    gas_price TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    token_symbol TEXT,
    token_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- Support requests table
CREATE TABLE IF NOT EXISTS support_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_address ON transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_token_symbol ON transactions(token_symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_token_address ON transactions(token_address);
CREATE INDEX IF NOT EXISTS idx_support_requests_wallet_address ON support_requests(wallet_address);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for support_requests table
CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

CREATE POLICY "Users can insert their own support requests" ON support_requests
    FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Admins can update support requests" ON support_requests
    FOR UPDATE USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- Admin policies (for admin panel access)
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

CREATE POLICY "Admins can view all support requests" ON support_requests
    FOR SELECT USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- Function to update last_login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_login = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_login
CREATE TRIGGER update_user_last_login
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_last_login();

-- Function to generate user ID
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TEXT AS $$
DECLARE
    user_id TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate a 5-character alphanumeric ID
        user_id := upper(substring(md5(random()::text) from 1 for 5));
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = user_id) THEN
            RETURN user_id;
        END IF;
        
        counter := counter + 1;
        -- Prevent infinite loop
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique user ID after 100 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
