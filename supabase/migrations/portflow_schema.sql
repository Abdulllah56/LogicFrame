-- =============================================
-- PORTFLOW — Supabase Schema Migration
-- =============================================
-- All tables reference auth.users(id) for the freelancer.
-- Magic tokens: proposals.magic_token + projects.portal_token
-- are UUIDs for secure unauthenticated client portal access.
-- =============================================

-- 1. CLIENTS
CREATE TABLE portflow_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portflow_clients_user ON portflow_clients(user_id);

-- 2. PROJECTS
CREATE TABLE portflow_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES portflow_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  budget NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  deadline TIMESTAMPTZ,
  portal_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portflow_projects_user ON portflow_projects(user_id);
CREATE INDEX idx_portflow_projects_client ON portflow_projects(client_id);
CREATE INDEX idx_portflow_projects_portal_token ON portflow_projects(portal_token);

-- 3. PROPOSALS
CREATE TABLE portflow_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES portflow_projects(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES portflow_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired')),
  magic_token UUID UNIQUE DEFAULT gen_random_uuid(),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  client_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portflow_proposals_user ON portflow_proposals(user_id);
CREATE INDEX idx_portflow_proposals_client ON portflow_proposals(client_id);
CREATE INDEX idx_portflow_proposals_magic_token ON portflow_proposals(magic_token);
CREATE INDEX idx_portflow_proposals_status ON portflow_proposals(status);

-- 4. MILESTONES
CREATE TABLE portflow_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portflow_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portflow_milestones_project ON portflow_milestones(project_id);

-- 5. MESSAGES
CREATE TABLE portflow_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portflow_projects(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('freelancer', 'client')),
  sender_name TEXT,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portflow_messages_project ON portflow_messages(project_id);

-- 6. FILES
CREATE TABLE portflow_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portflow_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  mime_type TEXT,
  uploaded_by TEXT CHECK (uploaded_by IN ('freelancer', 'client')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portflow_files_project ON portflow_files(project_id);

-- 7. VOICE SAMPLES
CREATE TABLE portflow_voice_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sample_text TEXT NOT NULL,
  context TEXT DEFAULT 'past_proposal',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portflow_voice_samples_user ON portflow_voice_samples(user_id);

-- 8. NOTIFICATIONS
CREATE TABLE portflow_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  linked_id UUID,
  linked_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portflow_notifications_user ON portflow_notifications(user_id);
CREATE INDEX idx_portflow_notifications_unread ON portflow_notifications(user_id) WHERE read = false;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE portflow_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portflow_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portflow_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portflow_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE portflow_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portflow_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE portflow_voice_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE portflow_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own clients"
  ON portflow_clients FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects"
  ON portflow_projects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own proposals"
  ON portflow_proposals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage milestones of their projects"
  ON portflow_milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portflow_projects
      WHERE portflow_projects.id = portflow_milestones.project_id
        AND portflow_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage messages of their projects"
  ON portflow_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portflow_projects
      WHERE portflow_projects.id = portflow_messages.project_id
        AND portflow_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage files of their projects"
  ON portflow_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portflow_projects
      WHERE portflow_projects.id = portflow_files.project_id
        AND portflow_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own voice samples"
  ON portflow_voice_samples FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notifications"
  ON portflow_notifications FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION portflow_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_portflow_clients_updated
  BEFORE UPDATE ON portflow_clients
  FOR EACH ROW EXECUTE FUNCTION portflow_update_updated_at();

CREATE TRIGGER trg_portflow_projects_updated
  BEFORE UPDATE ON portflow_projects
  FOR EACH ROW EXECUTE FUNCTION portflow_update_updated_at();

CREATE TRIGGER trg_portflow_proposals_updated
  BEFORE UPDATE ON portflow_proposals
  FOR EACH ROW EXECUTE FUNCTION portflow_update_updated_at();
