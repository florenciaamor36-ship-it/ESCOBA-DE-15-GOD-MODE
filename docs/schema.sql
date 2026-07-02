-- Supabase Database Schema for Zapía IA Orchestration (Enhanced)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Agents Table: Core registry for all Zapía instances
CREATE TYPE agent_status AS ENUM ('green', 'yellow', 'red', 'blue');
CREATE TYPE agent_type AS ENUM ('orchestrator', 'subordinate');

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Owner of the agent for RLS
    name TEXT NOT NULL,
    type agent_type NOT NULL DEFAULT 'subordinate',
    status agent_status NOT NULL DEFAULT 'red',
    sub_agent_count INTEGER NOT NULL DEFAULT 0,
    version TEXT DEFAULT '1.0.0',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Agent Metadata Table
CREATE TABLE agent_metadata (
    agent_id UUID PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
    whatsapp_number TEXT,
    google_account TEXT,
    active_integrations JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Status Logs: History of status changes
CREATE TABLE status_logs (
    id BIGSERIAL PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    old_status agent_status,
    new_status agent_status NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Commands Table: Orchestrator -> Subordinate communication (with DLQ support)
CREATE TYPE command_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'dlq');

CREATE TABLE commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    issuer_agent_id UUID REFERENCES agents(id),
    command_name TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status command_status DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ENABLE RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Agents: Can see and update themselves
CREATE POLICY "Agents can manage themselves" ON agents
    FOR ALL USING (auth.uid() = user_id);

-- Commands: Target agent can see and update their commands
CREATE POLICY "Agents can see their commands" ON commands
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM agents WHERE id = target_agent_id));

CREATE POLICY "Agents can update their command status" ON commands
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM agents WHERE id = target_agent_id));

CREATE POLICY "Users can insert commands for their agents" ON commands
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM agents WHERE id = target_agent_id));

-- Metadata: Agent can manage its metadata
CREATE POLICY "Agents can manage their metadata" ON agent_metadata
    FOR ALL USING (auth.uid() = (SELECT user_id FROM agents WHERE id = agent_id));

-- Realtime configuration
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_metadata;
ALTER PUBLICATION supabase_realtime ADD TABLE status_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE commands;

-- Indexes
CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_commands_dlq ON commands(status) WHERE status = 'dlq';

-- Triggers
CREATE OR REPLACE FUNCTION update_last_seen_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_last_seen
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE PROCEDURE update_last_seen_column();

-- Log Cleanup Function (to be called via Cron)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM status_logs WHERE created_at < now() - interval '7 days';
END;
$$ language 'plpgsql';
