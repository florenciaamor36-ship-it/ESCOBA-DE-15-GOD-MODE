# Zapía IA: Orchestration System Architecture

## 1. System Overview
The system is designed as a centralized "Base of Operations" for running, managing, and monitoring multiple Zapía IA instances in real-time. It uses a hierarchical structure where a main Orchestrator coordinates multiple Subordinate agents.

## 2. Hierarchical Structure
### 2.1 Agent Orchestrator (Zapía Principal)
- **Role:** Leader agent.
- **Responsibilities:**
    - Task coordination and delegation.
    - Consolidating reports from subordinates.
    - High-level decision making.
    - Global state monitoring.

### 2.2 Subordinate Agents
- **Role:** Execution units.
- **Responsibilities:**
    - Execute specific tasks delegated by the Orchestrator.
    - Report status, metrics, and metadata in real-time.
    - Self-identify and register with the panel.

## 3. Connectivity and Authentication
### 3.1 Authentication Mechanism
- **Bearer Tokens (JWT):** Each agent uses a unique JWT for authenticating requests to the Supabase backend.
- **Supabase Auth:** Used to manage agent identities and secure table access via Row Level Security (RLS).

### 3.2 Communication Flow
- **Bidirectional Real-time:** Leveraging **Supabase Realtime**.
- **Downstream (Orchestrator -> Subordinate):** Commands are inserted into a `commands` table. Subordinates subscribe to changes in this table filtered by their `agent_id`.
- **Upstream (Subordinate -> Orchestrator/Panel):** Subordinates update their status in the `agents` table and insert logs into `status_logs`. The Dashboard (Base of Operations) subscribes to these tables to reflect changes instantly.

## 4. Dashboard & Monitoring
### 4.1 Visual Status (Semaphore)
Agents report their current state which is visualized using a color-coded system:
- **Green (Operative):** Active and healthy.
- **Yellow (Warning):** High workload or minor alerts.
- **Red (Critical):** Disconnected or critical error.
- **Blue (Special):** Executing special tasks or updating.

### 4.2 Metadata & Real-time Counters
- **Metadata:** WhatsApp number, Google account, and active integrations are stored in a dedicated `agent_metadata` table.
- **Sub-agent Counter:** A real-time integer field in the `agents` table representing currently running sub-processes.
