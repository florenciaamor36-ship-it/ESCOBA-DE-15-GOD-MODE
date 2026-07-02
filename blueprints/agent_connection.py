import os
import asyncio
from supabase import create_client, Client

# Agent Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL")
# Agents should use an individual JWT/Login.
# Here we use an API Key for the blueprint example.
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
AGENT_ID = os.environ.get("AGENT_ID")
AGENT_NAME = os.environ.get("AGENT_NAME", "Subordinate-Agent-01")
AGENT_VERSION = "1.0.1"

class ZapiaAgent:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.sub_agent_count = 0
        self.is_running = True

    async def connect(self):
        print(f"Agent {AGENT_ID} (v{AGENT_VERSION}) connecting...")

        # 1. Registration / Heartbeat Check-in
        self.register_agent()
        self.sync_metadata()

        # 2. Catch-up: Process missed commands while offline
        await self.catch_up_commands()

        # 3. Set status and start real-time loop
        self.update_status("green")

        await asyncio.gather(
            self.listen_for_commands(),
            self.heartbeat()
        )

    def register_agent(self):
        # En producción, user_id se asigna automáticamente vía RLS/Auth
        # pero aquí lo mostramos como parte de la lógica de registro.
        user_id = os.environ.get("USER_ID")

        self.supabase.table("agents").upsert({
            "id": AGENT_ID,
            "user_id": user_id,
            "name": AGENT_NAME,
            "version": AGENT_VERSION,
            "type": "subordinate"
        }).execute()

    def sync_metadata(self):
        metadata = {
            "agent_id": AGENT_ID,
            "whatsapp_number": os.environ.get("WHATSAPP", "+54..."),
            "google_account": os.environ.get("GOOGLE_EMAIL", "agent@gmail.com"),
            "active_integrations": ["whatsapp", "google_calendar"]
        }
        self.supabase.table("agent_metadata").upsert(metadata).execute()

    async def catch_up_commands(self):
        print("Catching up with missed commands...")
        res = self.supabase.table("commands") \
            .select("*") \
            .eq("target_agent_id", AGENT_ID) \
            .eq("status", "pending") \
            .execute()

        for cmd in res.data:
            await self.execute_command(cmd)

    def update_status(self, status, message=None):
        self.supabase.table("agents").update({
            "status": status,
            "sub_agent_count": self.sub_agent_count
        }).eq("id", AGENT_ID).execute()

        self.supabase.table("status_logs").insert({
            "agent_id": AGENT_ID,
            "new_status": status,
            "message": message
        }).execute()

    async def heartbeat(self):
        while self.is_running:
            self.supabase.table("agents").update({
                "sub_agent_count": self.sub_agent_count
            }).eq("id", AGENT_ID).execute()
            await asyncio.sleep(30)

    async def listen_for_commands(self):
        # Real-time subscription logic would go here
        # For the blueprint, we simulate polling or wait for event
        print("Listening for real-time commands...")
        pass

    async def execute_command(self, command):
        cmd_id = command['id']
        retries = command.get('retry_count', 0)
        max_retries = command.get('max_retries', 3)

        print(f"Executing command: {command['command_name']} (Attempt {retries + 1})")
        self.update_status("blue", f"Processing {command['command_name']}")

        try:
            self.supabase.table("commands").update({"status": "processing"}).eq("id", cmd_id).execute()

            # --- SIMULATE LOGIC ---
            await asyncio.sleep(2)
            # ----------------------

            self.supabase.table("commands").update({
                "status": "completed",
                "result": {"message": "Success"}
            }).eq("id", cmd_id).execute()

        except Exception as e:
            new_retries = retries + 1
            if new_retries >= max_retries:
                status = "dlq" # Move to Dead Letter Queue
                print(f"Command {cmd_id} failed permanently. Moving to DLQ.")
            else:
                status = "pending" # Retry later
                print(f"Command {cmd_id} failed. Will retry.")

            self.supabase.table("commands").update({
                "status": status,
                "retry_count": new_retries,
                "result": {"error": str(e)}
            }).eq("id", cmd_id).execute()

        self.update_status("green")

if __name__ == "__main__":
    agent = ZapiaAgent()
    asyncio.run(agent.connect())
