import os
import asyncio
from supabase import create_client, Client

# Agent Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL")
# IMPORTANT: In production, agents should use their own JWT obtained via Supabase Auth.
# Using the SERVICE_ROLE_KEY is only for development/orchestrator-level access.
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
AGENT_ID = os.environ.get("AGENT_ID")
AGENT_NAME = os.environ.get("AGENT_NAME", "Subordinate-Agent-01")

class ZapiaAgent:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.sub_agent_count = 0

    async def connect(self):
        print(f"Agent {AGENT_ID} connecting to Zapía Base of Operations...")

        # 0. Ensure agent exists (Registration)
        self.register_agent()

        # 1. Update Metadata on Startup
        self.sync_metadata()

        # 2. Set initial status to Green (Operative)
        self.update_status("green")

        # 3. Start Command Listener and Heartbeat
        await asyncio.gather(
            self.listen_for_commands(),
            self.heartbeat()
        )

    def register_agent(self):
        # Ensure the agent is in the 'agents' table before metadata upsert
        self.supabase.table("agents").upsert({
            "id": AGENT_ID,
            "name": AGENT_NAME,
            "type": "subordinate"
        }).execute()
        print("Agent registered.")

    def sync_metadata(self):
        metadata = {
            "agent_id": AGENT_ID,
            "whatsapp_number": "+54911...",
            "google_account": "agent.zapia@gmail.com",
            "active_integrations": ["whatsapp", "google_calendar", "trello"]
        }
        self.supabase.table("agent_metadata").upsert(metadata).execute()
        print("Metadata synchronized.")

    def update_status(self, status, message=None):
        # We omit last_seen as the DB handles it via DEFAULT timezone(...)
        self.supabase.table("agents").update({
            "status": status,
            "sub_agent_count": self.sub_agent_count
        }).eq("id", AGENT_ID).execute()

        # Log status change
        self.supabase.table("status_logs").insert({
            "agent_id": AGENT_ID,
            "new_status": status,
            "message": message
        }).execute()

    async def heartbeat(self):
        while True:
            # The database trigger 'update_agents_last_seen' will refresh 'last_seen'
            # automatically on any update. We perform a 'no-op' update to trigger it.
            self.supabase.table("agents").update({
                "sub_agent_count": self.sub_agent_count
            }).eq("id", AGENT_ID).execute()
            await asyncio.sleep(30)

    async def listen_for_commands(self):
        # In a real implementation, use Supabase Realtime (Websockets)
        # Here we simulate a subscription loop
        print("Listening for commands...")

        def on_command(payload):
            command = payload['new']
            if command['status'] == 'pending':
                self.execute_command(command)

        # Mocking the realtime subscription logic
        # supabase.channel('commands').on('postgres_changes', ...).subscribe()
        pass

    def execute_command(self, command):
        print(f"Executing command: {command['command_name']}")
        # Update status to Blue (Executing)
        self.update_status("blue", f"Executing {command['command_name']}")

        # ... logic ...

        # Return to Green after completion
        self.update_status("green")

if __name__ == "__main__":
    agent = ZapiaAgent()
    asyncio.run(agent.connect())
