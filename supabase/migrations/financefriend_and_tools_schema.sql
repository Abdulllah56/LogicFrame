-- =============================================
-- FINANCE FRIEND & OTHER TOOLS — Supabase Schema Migration
-- =============================================
-- This migration adds the required tables for FinanceFriend,
-- Object Extractor, Screenshot Beautifier, and Time Tracking,
-- so that their activities can be tracked on the Dashboard.
-- All tables reference auth.users(id) for the user.
-- =============================================

-- 1. FINANCE FRIEND: CATEGORIES
CREATE TABLE finance_friend_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null for default global categories
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ff_categories_user ON finance_friend_categories(user_id);

-- 2. FINANCE FRIEND: EXPENSES
CREATE TABLE finance_friend_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finance_friend_categories(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  description TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ff_expenses_user ON finance_friend_expenses(user_id);
CREATE INDEX idx_ff_expenses_date ON finance_friend_expenses(date);

-- 3. FINANCE FRIEND: BILLS
CREATE TABLE finance_friend_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ff_bills_user ON finance_friend_bills(user_id);
CREATE INDEX idx_ff_bills_due_date ON finance_friend_bills(due_date);

-- 4. FINANCE FRIEND: SAVINGS GOALS
CREATE TABLE finance_friend_savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  target_date DATE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ff_goals_user ON finance_friend_savings_goals(user_id);

-- 5. FINANCE FRIEND: BUDGETS
CREATE TABLE finance_friend_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finance_friend_categories(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ff_budgets_user ON finance_friend_budgets(user_id);

-- 6. OBJECT EXTRACTOR: EXPORTS
CREATE TABLE object_extractor_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_image_url TEXT,
  extracted_image_url TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_oe_exports_user ON object_extractor_exports(user_id);

-- 7. SCREENSHOT BEAUTIFIER: EXPORTS
CREATE TABLE screenshot_beautifier_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  image_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sb_exports_user ON screenshot_beautifier_exports(user_id);

-- 8. TIME TRACKING: ENTRIES
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID, -- Can link to ScopeCreep projects
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  is_billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE finance_friend_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_friend_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_friend_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_friend_savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_friend_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE object_extractor_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshot_beautifier_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories" ON finance_friend_categories FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage their own expenses" ON finance_friend_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own bills" ON finance_friend_bills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON finance_friend_savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own budgets" ON finance_friend_budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own object extractor exports" ON object_extractor_exports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own screenshot beautifier exports" ON screenshot_beautifier_exports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own time entries" ON time_entries FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- DEFAULT CATEGORIES FOR FINANCE FRIEND
-- =============================================
-- Insert global default categories so new users have them out of the box
INSERT INTO finance_friend_categories (name, color, icon) VALUES
('Food & Dining', '#38BDF8', 'ri-restaurant-line'),
('Transportation', '#818CF8', 'ri-car-line'),
('Shopping', '#FB7185', 'ri-shopping-bag-line'),
('Entertainment', '#34D399', 'ri-movie-line'),
('Housing', '#F472B6', 'ri-home-line'),
('Utilities', '#FBBF24', 'ri-lightbulb-line'),
('Health', '#A3E635', 'ri-heart-pulse-line'),
('Income', '#22C55E', 'ri-money-dollar-circle-line'),
('Other', '#94A3B8', 'ri-price-tag-3-line');
