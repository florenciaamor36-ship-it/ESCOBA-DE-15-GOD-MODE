# Zapía IA: Orchestration System Architecture (v1.1)

## 1. System Overview
Hierarchical orchestration system for Zapía IA agents using Supabase.

## 2. Security & RLS
- **Supabase Auth:** Each agent belongs to a `user_id`.
- **Row Level Security:** Agents can only access their own records and commands.
- **Service Role:** Use only for backend/orchestrator tasks. Agents must use restricted tokens.

## 3. Communication Logic
### 3.1 Downstream (Command Flow)
- Commands are inserted into the `commands` table.
- **DLQ (Dead Letter Queue):** If a command exceeds `max_retries`, its status is set to `dlq`.
- **Retry Logic:** Automatic retries for failed commands (configurable per command).

### 3.2 Upstream (Status & Heartbeat)
- **Semaphore:** Green (Active), Yellow (Warning), Red (Disconnected), Blue (Executing).
- **Heartbeat:** Automatic `last_seen` updates via database triggers.
- **Catch-up:** Agents fetch missed `pending` commands upon reconnection.

## 4. Components
- **`index.html`:** Real-time Dashboard (Base de Operaciones).
- **`docs/schema.sql`:** Enhanced database schema with RLS and triggers.
- **`blueprints/agent_connection.py`:** Python template for subordinate agents.

## 5. Deployment
The Dashboard is deployed to GitHub Pages via the `.github/workflows/deploy.yml` workflow.
