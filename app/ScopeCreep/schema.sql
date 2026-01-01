-- Copy and paste this into your Supabase SQL Editor to create the tables

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_name TEXT,
  client_name TEXT,
  client_email TEXT,
  project_price DECIMAL,
  hourly_rate DECIMAL DEFAULT 100,
  currency TEXT DEFAULT '$',
  timeline TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Deliverables Table
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT,
  category TEXT,
  status TEXT,
  scope_type TEXT
);

-- 4. Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  request_text TEXT,
  request_date DATE,
  category TEXT,
  scope_status TEXT,
  estimated_hours DECIMAL,
  estimated_cost DECIMAL,
  timeline_impact TEXT,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
