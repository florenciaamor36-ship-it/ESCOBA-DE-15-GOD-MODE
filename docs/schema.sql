-- Supabase Database Schema for Zapía IA Orchestration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Agents Table: Core registry for all Zapía instances
CREATE TYPE agent_status AS ENUM ('green', 'yellow', 'red', 'blue');
CREATE TYPE agent_type AS ENUM ('orchestrator', 'subordinate');

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type agent_type NOT NULL DEFAULT 'subordinate',
    status agent_status NOT NULL DEFAULT 'red',
    sub_agent_count INTEGER NOT NULL DEFAULT 0,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Agent Metadata Table: Detailed configuration and identity
CREATE TABLE agent_metadata (
    agent_id UUID PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
    whatsapp_number TEXT,
    google_account TEXT,
    active_integrations JSONB DEFAULT '[]'::jsonb, -- e.g., ["slack", "trello", "instagram"]
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Status Logs: History of status changes for analytics/monitoring
CREATE TABLE status_logs (
    id BIGSERIAL PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    old_status agent_status,
    new_status agent_status NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Commands Table: Orchestrator -> Subordinate communication
CREATE TYPE command_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    issuer_agent_id UUID NOT NULL REFERENCES agents(id),
    command_name TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status command_status DEFAULT 'pending',
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_metadata;
ALTER PUBLICATION supabase_realtime ADD TABLE status_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE commands;

-- Indexes for performance
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_commands_target_agent ON commands(target_agent_id, status);
CREATE INDEX idx_status_logs_agent ON status_logs(agent_id, created_at DESC);

-- Trigger to automatically update last_seen on any update to the agents table
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
