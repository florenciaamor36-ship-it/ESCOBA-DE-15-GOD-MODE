# Communication and Synchronization Logic

This document describes the real-time synchronization logic between the Base of Operations (Dashboard), the Orchestrator, and the Subordinate Agents.

## 1. Real-time Dashboard Synchronization
The Dashboard uses `supabase-js` to listen for changes in the `agents` and `agent_metadata` tables.

```javascript
// Example: Subscribing to agent state changes
supabase
  .channel('public:agents')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'agents' }, payload => {
    updateUI(payload.new); // Updates the semaphore color and sub-agent counter
  })
  .subscribe();
```

## 2. Orchestrator to Subordinate (Command Flow)
1. **Command Issuance:** The Orchestrator (or a user via the Dashboard) inserts a row into the `commands` table, specifying the `target_agent_id`.
2. **Command Reception:** The Subordinate agent is subscribed to the `commands` table, filtered by its own ID.
3. **Execution & Feedback:** Once the subordinate receives the command, it updates the command status to `processing`, then `completed` (or `failed`), and can attach a `result` JSON payload.

## 3. Subordinate to Panel (Metric Reporting)
- **Heartbeat:** Subordinates update their `last_seen` timestamp in the `agents` table every 30-60 seconds.
- **Status Changes:** When an internal state change occurs (e.g., error caught, task started), the agent updates its `status` field.
- **Sub-process Monitoring:** The agent maintains a local counter of active tasks and synchronizes the `sub_agent_count` field in the database whenever it changes.

## 4. Metadata Sync
Upon startup, the agent performs a "Sync Handshake":
1. Check-in with Supabase Auth using its Token.
2. Update `agent_metadata` with its WhatsApp number, Google account, and current active integrations.
3. This ensures the Dashboard always displays up-to-date identification for every instance.
