-- Mock data structure for Cash Pooling POC
-- This is for reference only - data will be stored in React state for this prototype

-- Clients/Groups
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('individual', 'group')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id),
  balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'closed')),
  account_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cash Pooling Contracts
CREATE TABLE IF NOT EXISTS cash_pooling_contracts (
  id UUID PRIMARY KEY,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  master_account_id UUID REFERENCES accounts(id),
  client_id UUID REFERENCES clients(id),
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'suspended', 'terminated')),
  currency VARCHAR(3) NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Secondary Accounts in Cash Pooling
CREATE TABLE IF NOT EXISTS cash_pooling_accounts (
  id UUID PRIMARY KEY,
  contract_id UUID REFERENCES cash_pooling_contracts(id),
  account_id UUID REFERENCES accounts(id),
  added_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id UUID,
  action VARCHAR(50),
  user_email VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
