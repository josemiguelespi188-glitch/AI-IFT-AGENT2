-- ─── IFT AI Agent – Initial Schema ──────────────────────────────────────────
-- Run this in your Supabase SQL editor to initialize the database.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Investors ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investors (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  deal_ids      TEXT[] DEFAULT '{}',
  accredited    BOOLEAN DEFAULT FALSE,
  kyc_status    TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Clients (Sponsors) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                   TEXT UNIQUE NOT NULL,
  portal_url             TEXT,
  sponsor_contact        TEXT NOT NULL,
  sponsor_email          TEXT,
  tax_document_type      TEXT DEFAULT '1099-DIV' CHECK (tax_document_type IN ('1099-DIV', 'K-1', '1099-INT', '1099-B', 'other')),
  distribution_schedule  TEXT,
  reinvestment_policy    BOOLEAN DEFAULT FALSE,
  redemption_rules       TEXT,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Deals ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           UUID REFERENCES clients(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
  investment_type     TEXT,
  regulation_type     TEXT CHECK (regulation_type IN ('reg_d_506b', 'reg_d_506c', 'reg_a', 'reg_cf')),
  minimum_investment  NUMERIC,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Inquiries ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id          UUID REFERENCES investors(id) ON DELETE SET NULL,
  investor_email       TEXT,
  investor_name        TEXT,
  client_id            UUID REFERENCES clients(id) ON DELETE SET NULL,
  deal_id              UUID REFERENCES deals(id) ON DELETE SET NULL,
  channel              TEXT NOT NULL CHECK (channel IN ('portal', 'email', 'zendesk', 'phone')),
  category             TEXT NOT NULL CHECK (category IN (
    'distributions', 'tax_documents', 'account_activation', 'banking_changes',
    'accreditation', 'investment_status', 'redemption_request',
    'technical_portal_help', 'other_unknown'
  )),
  original_text        TEXT NOT NULL,
  subject              TEXT,
  status               TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'escalated', 'duplicate')),
  ai_response          TEXT,
  escalation_summary   JSONB,
  duplicate_of         UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  confidence_score     NUMERIC CHECK (confidence_score BETWEEN 0 AND 1),
  processing_time_ms   INTEGER,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  resolved_at          TIMESTAMPTZ
);

-- ─── Knowledge Base ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_base (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  source      TEXT DEFAULT 'general' CHECK (source IN ('general', 'client_specific', 'approved_response')),
  approved_by TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Approved Responses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approved_responses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id  UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  deal_id     UUID REFERENCES deals(id) ON DELETE SET NULL,
  category    TEXT NOT NULL,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  approved_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_channel ON inquiries(channel);
CREATE INDEX IF NOT EXISTS idx_inquiries_category ON inquiries(category);
CREATE INDEX IF NOT EXISTS idx_inquiries_investor ON inquiries(investor_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_client ON knowledge_base(client_id);

-- ─── Seed Data: Clients ───────────────────────────────────────────────────────
INSERT INTO clients (name, sponsor_contact, sponsor_email, tax_document_type, distribution_schedule, reinvestment_policy, redemption_rules, notes)
VALUES
  (
    'Phoenix American Hospitality',
    'Katie Ginther',
    'katie@phoenixamerican.com',
    '1099-DIV',
    'Monthly, on the 15th',
    FALSE,
    'Redemptions handled case by case. Contact Katie Ginther directly.',
    'Does not allow reinvestment. Distributions on the 15th of each month.'
  ),
  (
    'Rastegar',
    'Diego Traversari',
    'diego@rastegar.com',
    'K-1',
    'Quarterly updates; distributions vary by deal',
    TRUE,
    'Redemptions processed via Diego Traversari. Submit request 30 days in advance.',
    'Allows reinvestment or cash distributions. Quarterly investor updates.'
  )
ON CONFLICT (name) DO NOTHING;

-- ─── Seed Data: Knowledge Base ────────────────────────────────────────────────
INSERT INTO knowledge_base (category, question, answer, source)
VALUES
  (
    'account_activation',
    'How do I activate my investor account on the Axiskey portal?',
    'To activate your Axiskey investor account: 1) Check your email for the invitation from Industry FinTech. 2) Click the activation link (valid 72 hours). 3) Set a secure password. 4) Complete your investor profile. 5) Upload your ID or driver license for KYC verification. If you did not receive the email, check your spam folder or contact Investor Support.',
    'general'
  ),
  (
    'tax_documents',
    'When will my tax documents be available?',
    'Tax documents (1099s and K-1s) are typically available by March 15th for the prior tax year. You can find them in your portal under Documents > Tax. If you have not received them by March 31st, please contact Investor Support with your full name and the deal name.',
    'general'
  ),
  (
    'banking_changes',
    'How do I update my bank account for distributions?',
    'To update your banking information: 1) Log in to your Axiskey portal. 2) Go to Settings > Banking. 3) Click "Add New Account" and follow the verification steps. Note: Banking changes require identity verification and may take 5-7 business days to process. For security reasons, we cannot process banking changes over email.',
    'general'
  ),
  (
    'accreditation',
    'What is an accredited investor and how do I verify my status?',
    'An accredited investor meets SEC requirements under Regulation D: net worth over $1M (excluding primary residence) OR annual income over $200K ($300K joint) for the past 2 years with reasonable expectation of same. To verify: upload supporting documents in your portal under Profile > Accreditation. Third-party verification services may be used for Reg D 506c offerings.',
    'general'
  ),
  (
    'distributions',
    'How are distributions calculated and when are they paid?',
    'Distribution schedules vary by deal and client. Distributions are calculated based on your pro-rata ownership interest in the deal. Specific timing and amounts are outlined in your investment documents. Log in to your portal under Portfolio > Distributions to view your distribution history and upcoming payments.',
    'general'
  ),
  (
    'investment_status',
    'How can I check the status of my investment?',
    'You can view your investment status at any time in your Axiskey portal: 1) Log in at your portal URL. 2) Navigate to Portfolio > My Investments. 3) Select the specific deal to view detailed status, documents, and updates. For questions about a specific deal, contact the sponsor directly.',
    'general'
  ),
  (
    'technical_portal_help',
    'I cannot log in to the portal. What should I do?',
    'If you are having trouble logging in: 1) Use the "Forgot Password" link on the login page. 2) Check that you are using the email address registered with IFT. 3) Clear your browser cache and cookies. 4) Try a different browser. If issues persist, contact Investor Support at support@industryfintech.com with your registered email address.',
    'general'
  ),
  (
    'redemption_request',
    'How do I submit a redemption request?',
    'Redemption requests are subject to the terms outlined in your investment documents. To submit: 1) Log in to your Axiskey portal. 2) Go to Portfolio > Redemptions. 3) Select the investment and follow the request form. Note: Redemptions are subject to deal-specific lock-up periods, fees, and approval processes. Review your subscription documents for specific terms.',
    'general'
  )
ON CONFLICT DO NOTHING;
