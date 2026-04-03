-- YallaCoins Database Schema
-- Supabase PostgreSQL
-- Created: April 2, 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Admin users)
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'support_agent',
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS "withdrawal_request" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "appId" VARCHAR(50) NOT NULL,
  "accountId" VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  "payoutCountry" VARCHAR(100),
  "payoutMethod" VARCHAR(100),
  "assignedTo" UUID,
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("assignedTo") REFERENCES "user"(id) ON DELETE SET NULL
);

-- 3. Request Snapshots Table (Immutable historical data)
CREATE TABLE IF NOT EXISTS "request_snapshot" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "requestId" UUID NOT NULL UNIQUE,
  "conversionLogic" TEXT,
  "payoutRate" DECIMAL(15, 6),
  fee DECIMAL(15, 2),
  "estimatedPayout" DECIMAL(15, 2),
  "payoutMethod" VARCHAR(100),
  "payoutFields" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("requestId") REFERENCES "withdrawal_request"(id) ON DELETE CASCADE
);

-- 4. App Rates Table
CREATE TABLE IF NOT EXISTS "app_rate" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "appId" VARCHAR(50) NOT NULL UNIQUE,
  "appName" VARCHAR(255),
  rate DECIMAL(15, 6) NOT NULL,
  fee DECIMAL(5, 2) NOT NULL DEFAULT 2.5,
  "minWithdrawal" DECIMAL(15, 2),
  eta VARCHAR(100),
  version INT DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Countries Table
CREATE TABLE IF NOT EXISTS "country" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(2) NOT NULL UNIQUE,
  flag VARCHAR(10),
  "sortOrder" INT,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payout Methods Table
CREATE TABLE IF NOT EXISTS "payout_method" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "countryId" UUID NOT NULL,
  method VARCHAR(100) NOT NULL,
  fee DECIMAL(5, 2),
  "feeType" VARCHAR(20),
  recommended BOOLEAN DEFAULT false,
  "sortOrder" INT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("countryId") REFERENCES "country"(id) ON DELETE CASCADE,
  UNIQUE("countryId", method)
);

-- 7. File Uploads Table
CREATE TABLE IF NOT EXISTS "file_upload" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "requestId" UUID,
  "userId" UUID,
  filename VARCHAR(255) NOT NULL,
  "originalName" VARCHAR(255),
  mimetype VARCHAR(100),
  size INT,
  path VARCHAR(500),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("requestId") REFERENCES "withdrawal_request"(id) ON DELETE SET NULL,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE SET NULL
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS "audit_log" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  "entityId" VARCHAR(255),
  changes JSONB,
  "ipAddress" VARCHAR(50),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE SET NULL
);

-- Create Indexes for Performance
CREATE INDEX idx_withdrawal_request_status ON "withdrawal_request"(status);
CREATE INDEX idx_withdrawal_request_app ON "withdrawal_request"("appId");
CREATE INDEX idx_withdrawal_request_country ON "withdrawal_request"("payoutCountry");
CREATE INDEX idx_withdrawal_request_created ON "withdrawal_request"("createdAt");
CREATE INDEX idx_audit_log_user ON "audit_log"("userId");
CREATE INDEX idx_audit_log_entity ON "audit_log"(entity, "entityId");
CREATE INDEX idx_file_upload_request ON "file_upload"("requestId");
CREATE INDEX idx_payout_method_country ON "payout_method"("countryId");

-- Insert Sample Data

-- 1. Sample Admin Users
INSERT INTO "user" (email, password, name, role) VALUES
  ('admin@yallacoins.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'super_admin'),
  ('ops@yallacoins.com', '$2a$10$YourHashedPasswordHere', 'Operations Admin', 'operations_admin'),
  ('finance@yallacoins.com', '$2a$10$YourHashedPasswordHere', 'Finance Admin', 'finance_admin'),
  ('rates@yallacoins.com', '$2a$10$YourHashedPasswordHere', 'Rate Manager', 'rate_manager'),
  ('support@yallacoins.com', '$2a$10$YourHashedPasswordHere', 'Support Agent', 'support_agent'),
  ('auditor@yallacoins.com', '$2a$10$YourHashedPasswordHere', 'Auditor', 'auditor')
ON CONFLICT DO NOTHING;

-- 2. Sample App Rates
INSERT INTO "app_rate" ("appId", "appName", rate, fee, "minWithdrawal", eta) VALUES
  ('bigo', 'Bigo Live', 0.015, 2.5, 100, '1-2 hours'),
  ('kiti', 'Kiti', 0.018, 2.5, 100, '2-4 hours'),
  ('xena', 'Xena', 0.016, 2.5, 100, '1-2 hours')
ON CONFLICT ("appId") DO NOTHING;

-- 3. Sample Countries
INSERT INTO "country" (name, code, flag, "sortOrder") VALUES
  ('Egypt', 'EG', '🇪🇬', 1),
  ('United Arab Emirates', 'AE', '🇦🇪', 2),
  ('Saudi Arabia', 'SA', '🇸🇦', 3),
  ('Kuwait', 'KW', '🇰🇼', 4),
  ('Qatar', 'QA', '🇶🇦', 5),
  ('Bahrain', 'BH', '🇧🇭', 6),
  ('Oman', 'OM', '🇴🇲', 7),
  ('Jordan', 'JO', '🇯🇴', 8),
  ('Lebanon', 'LB', '🇱🇧', 9),
  ('Palestine', 'PS', '🇵🇸', 10),
  ('Syria', 'SY', '🇸🇾', 11),
  ('Iraq', 'IQ', '🇮🇶', 12),
  ('Morocco', 'MA', '🇲🇦', 13),
  ('Algeria', 'DZ', '🇩🇿', 14),
  ('Tunisia', 'TN', '🇹🇳', 15),
  ('Libya', 'LY', '🇱🇾', 16),
  ('Sudan', 'SD', '🇸🇩', 17),
  ('Yemen', 'YE', '🇾🇪', 18)
ON CONFLICT (code) DO NOTHING;

-- 4. Sample Payout Methods
-- For each country, add common payout methods
INSERT INTO "payout_method" ("countryId", method, fee, "feeType", recommended, "sortOrder")
SELECT id, 'Bank Transfer', 1.5, 'Fixed', true, 1 FROM "country" WHERE code = 'EG'
UNION ALL
SELECT id, 'Wallet', 0.5, 'Fixed', false, 2 FROM "country" WHERE code = 'EG'
UNION ALL
SELECT id, 'Cash Pickup', 2.0, 'Fixed', false, 3 FROM "country" WHERE code = 'EG'
UNION ALL
SELECT id, 'Bank Transfer', 2.0, 'Fixed', true, 1 FROM "country" WHERE code = 'AE'
UNION ALL
SELECT id, 'Wallet', 1.0, 'Fixed', false, 2 FROM "country" WHERE code = 'AE'
UNION ALL
SELECT id, 'Bank Transfer', 1.5, 'Fixed', true, 1 FROM "country" WHERE code = 'SA'
UNION ALL
SELECT id, 'Wallet', 0.5, 'Fixed', false, 2 FROM "country" WHERE code = 'SA'
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
