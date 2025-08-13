-- Creates the 'users' table for PostgreSQL
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    mobile_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- This line has been corrected for consistency
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Creates the 'otps' table for PostgreSQL
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    mobile_number TEXT NOT NULL, -- This line has been corrected for consistency
    otp TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

-- Creates the 'sessions' table for PostgreSQL
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- NEW DATA TABLES FOR MULTI-USER SUPPORT
-- Each table is linked to the 'users' table via user_id

-- Persons Table
CREATE TABLE IF NOT EXISTS persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'lent' or 'borrowed'
    amount NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL,
    interest_type TEXT NOT NULL, -- 'simple' or 'compound'
    payment_schedule TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    start_date DATE NOT NULL,
    due_date DATE,
    status TEXT NOT NULL, -- 'active', 'paid', 'overdue'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL, -- 'principal' or 'interest'
    method TEXT NOT NULL, -- 'cash', 'gpay', etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persons_user_id ON persons(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
