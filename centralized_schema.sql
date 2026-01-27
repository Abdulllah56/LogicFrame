
-- Centralized Auth & Subscriptions Schema

-- Tools Registry
CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans for each tool
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  tool_id INTEGER NOT NULL REFERENCES tools(id),
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- stored in cents
  paddle_price_id TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id),
  status TEXT NOT NULL,
  paddle_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_tool_id ON plans(tool_id);

-- Seed Initial Tools
INSERT INTO tools (slug, name, description) VALUES
('finance-friend', 'FinanceFriend', 'AI-powered financial tracking and insights.'),
('scope-creep', 'ScopeCreep', 'Project management and scope tracking.'),
('invoice-chase', 'InvoiceChase', 'Automated invoice follow-ups.'),
('object-extractor', 'Object Extractor', 'AI image object extraction.'),
('screenshot-beautifier', 'Screenshot Beautifier', 'Turn screenshots into beautiful assets.'),
('invoice-maker', 'InvoiceMaker', 'Make professional invoices.')
ON CONFLICT (slug) DO NOTHING;

-- Seed Free Plans (Assumes tool IDs 1-5 based on insertion order, or use subqueries for safety)
INSERT INTO plans (tool_id, name, price, features, is_active)
SELECT id, 'Free', 0, '{"limit": "basic"}'::jsonb, true
FROM tools
ON CONFLICT DO NOTHING;
