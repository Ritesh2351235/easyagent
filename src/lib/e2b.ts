import { Sandbox } from "@e2b/sdk";
import { db } from "./db";
import { SANDBOX_CONFIG } from "./constants";
import type { AgentWithTools } from "@/types/agent";

const RELAY_SERVER_CODE = `
"""FastAPI relay server inside E2B sandbox."""
import json, os, sys
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
import uvicorn

sys.path.insert(0, os.path.dirname(__file__))
from agent_runner import AgentRunner

app = FastAPI()
runner: AgentRunner | None = None

@app.on_event("startup")
async def startup():
    global runner
    config_path = os.environ.get("AGENT_CONFIG_PATH", "/home/user/agent_config.json")
    runner = AgentRunner(config_path)
    await runner.initialize()

@app.on_event("shutdown")
async def shutdown():
    if runner:
        await runner.cleanup()

@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "agent_ready": runner is not None and runner.ready})

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    message = body.get("message", "")
    history = body.get("history", [])
    if not message:
        return JSONResponse({"error": "message is required"}, status_code=400)
    if not runner or not runner.ready:
        return JSONResponse({"error": "Agent not ready"}, status_code=503)

    async def event_stream():
        try:
            async for chunk in runner.run(message, history):
                data = json.dumps({"type": "delta", "content": chunk})
                yield f"data: {data}\\n\\n"
            yield f"data: {json.dumps({'type': 'done'})}\\n\\n"
        except Exception as e:
            error_data = json.dumps({"type": "error", "error": str(e)})
            yield f"data: {error_data}\\n\\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
`;

const AGENT_RUNNER_CODE = `
"""Agent runner wrapping OpenAI Agents SDK with MCP support."""
import json, os
from typing import AsyncIterator

try:
    from agents import Agent, Runner
    from agents.mcp import MCPServerStdio
    HAS_SDK = True
except ImportError:
    HAS_SDK = False

def fix_array_schemas(schema):
    """Recursively add 'items' to array schemas missing it (OpenAI rejects these)."""
    if not isinstance(schema, dict):
        return 0
    count = 0
    if schema.get("type") == "array" and "items" not in schema:
        schema["items"] = {}
        count += 1
    for value in schema.values():
        if isinstance(value, dict):
            count += fix_array_schemas(value)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    count += fix_array_schemas(item)
    return count

class AgentRunner:
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.config = {}
        self.agent = None
        self.mcp_servers = []
        self.ready = False

    async def initialize(self):
        try:
            with open(self.config_path, "r") as f:
                self.config = json.load(f)
        except FileNotFoundError:
            self.config = {"name": "Assistant", "instructions": "You are a helpful assistant.", "model": "gpt-4o-mini", "mcp_tools": []}

        if not HAS_SDK:
            print("WARNING: openai-agents not installed, agent will echo messages")
            self.ready = True
            return

        mcp_tools = self.config.get("mcp_tools", [])
        for tool_config in mcp_tools:
            if not tool_config.get("enabled", True):
                continue
            try:
                server = MCPServerStdio(
                    name=tool_config["name"],
                    params={"command": tool_config["command"], "args": tool_config.get("args", []), "env": {**os.environ, **tool_config.get("env", {})}},
                    cache_tools_list=True,
                )
                await server.connect()
                self.mcp_servers.append(server)
                print(f"Connected MCP server: {tool_config['name']}")

                # Fix schemas that OpenAI would reject.
                # cache_tools_list=True means list_tools() caches the result.
                # We modify inputSchema dicts in-place so cached objects
                # retain fixes on subsequent SDK calls. Do NOT invalidate cache.
                try:
                    tools = await server.list_tools()
                    fixed = 0
                    for tool in tools:
                        if hasattr(tool, "inputSchema") and tool.inputSchema:
                            fixed += fix_array_schemas(tool.inputSchema)
                    print(f"Schema fix for {tool_config['name']}: patched {fixed} array fields across {len(tools)} tools")
                except Exception as e:
                    print(f"Schema fix warning for {tool_config['name']}: {e}")

            except Exception as e:
                print(f"Failed to start MCP server {tool_config['name']}: {e}")

        self.agent = Agent(
            name=self.config.get("name", "Assistant"),
            instructions=self.config.get("instructions", "You are a helpful assistant."),
            model=self.config.get("model", "gpt-4o-mini"),
            mcp_servers=self.mcp_servers,
        )
        self.ready = True
        print(f"Agent initialized: {self.config.get('name')} with {len(self.mcp_servers)} MCP servers")

    async def run(self, message: str, history: list) -> AsyncIterator[str]:
        if not HAS_SDK or self.agent is None:
            yield f"Echo: {message}"
            return

        input_messages = []
        for msg in history:
            input_messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        input_messages.append({"role": "user", "content": message})

        try:
            result = Runner.run_streamed(self.agent, input=input_messages)
            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if hasattr(event.data, "delta") and event.data.delta:
                        yield event.data.delta
        except Exception as e:
            yield f"Error: {str(e)}"

    async def cleanup(self):
        for server in self.mcp_servers:
            try:
                await server.cleanup()
            except Exception:
                pass
        self.mcp_servers.clear()
`;

function buildAgentConfig(agent: AgentWithTools) {
  const mcpTools = agent.mcpTools
    .filter((t) => t.enabled)
    .map((t) => {
      const config = t.config as Record<string, unknown>;
      return {
        name: t.toolName,
        enabled: t.enabled,
        command: config.command || t.toolName,
        args: config.args || [],
        env: config.env || {},
      };
    });

  return {
    name: agent.name,
    instructions: agent.instructions,
    model: agent.model,
    mcp_tools: mcpTools,
  };
}

export class SandboxManager {
  /**
   * Get or create a sandbox for an agent.
   */
  static async getOrCreateSandbox(agent: AgentWithTools): Promise<{
    sandbox: Sandbox;
    host: string;
  }> {
    const existing = await db.sandbox.findUnique({
      where: { agentId: agent.id },
    });

    if (existing) {
      // If currently starting, wait for it instead of nuking it
      if (existing.status === "STARTING") {
        console.log(`[E2B] Sandbox for agent ${agent.id} is STARTING, waiting...`);
        try {
          const sandbox = await Sandbox.connect(existing.e2bId, {
            apiKey: process.env.E2B_API_KEY!,
          });
          const host = sandbox.getHost(SANDBOX_CONFIG.port);
          await this.waitForRelay(host);

          await db.sandbox.update({
            where: { id: existing.id },
            data: { status: "RUNNING", host, lastActive: new Date() },
          });
          await db.agent.update({
            where: { id: agent.id },
            data: { status: "RUNNING" },
          });

          return { sandbox, host };
        } catch {
          console.log(`[E2B] STARTING sandbox failed, cleaning up and recreating`);
          await this.cleanupSandboxRecord(existing.id, existing.e2bId);
        }
      }

      // If running, try to reconnect
      if (existing.status === "RUNNING") {
        try {
          const sandbox = await Sandbox.connect(existing.e2bId, {
            apiKey: process.env.E2B_API_KEY!,
          });
          const host = sandbox.getHost(SANDBOX_CONFIG.port);

          const healthRes = await fetch(`https://${host}/health`, {
            signal: AbortSignal.timeout(5000),
          });
          if (healthRes.ok) {
            await db.sandbox.update({
              where: { id: existing.id },
              data: { lastActive: new Date() },
            });
            return { sandbox, host };
          }

          // Relay dead, kill and recreate
          await sandbox.kill();
        } catch {
          // Connection failed
        }
        await this.cleanupSandboxRecord(existing.id, existing.e2bId);
      }

      // ERROR or STOPPED — just clean up the DB record
      if (existing.status === "ERROR" || existing.status === "STOPPED") {
        await this.cleanupSandboxRecord(existing.id, existing.e2bId);
      }
    }

    return await this.createSandbox(agent);
  }

  private static async cleanupSandboxRecord(id: string, e2bId: string) {
    try {
      const sandbox = await Sandbox.connect(e2bId, {
        apiKey: process.env.E2B_API_KEY!,
      });
      await sandbox.kill();
    } catch {
      // Already dead
    }
    try {
      await db.sandbox.delete({ where: { id } });
    } catch {
      // Already deleted (race condition)
    }
  }

  private static async createSandbox(agent: AgentWithTools) {
    console.log(`[E2B] Creating sandbox for agent ${agent.id}...`);

    const sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY!,
      timeoutMs: SANDBOX_CONFIG.timeout,
    });

    console.log(`[E2B] Sandbox created: ${sandbox.sandboxId}`);

    // Upsert so we don't crash on unique constraint from a stale record
    const dbSandbox = await db.sandbox.upsert({
      where: { agentId: agent.id },
      update: {
        e2bId: sandbox.sandboxId,
        status: "STARTING",
        host: null,
        port: SANDBOX_CONFIG.port,
        lastActive: new Date(),
      },
      create: {
        e2bId: sandbox.sandboxId,
        agentId: agent.id,
        status: "STARTING",
        port: SANDBOX_CONFIG.port,
      },
    });

    try {
      await this.provisionSandbox(sandbox, agent);

      const host = sandbox.getHost(SANDBOX_CONFIG.port);
      console.log(`[E2B] Waiting for relay at https://${host}/health`);
      await this.waitForRelay(host);

      await db.sandbox.update({
        where: { id: dbSandbox.id },
        data: { status: "RUNNING", host, lastActive: new Date() },
      });
      await db.agent.update({
        where: { id: agent.id },
        data: { status: "RUNNING" },
      });

      console.log(`[E2B] Sandbox ready for agent ${agent.id}`);
      return { sandbox, host };
    } catch (error) {
      console.error(`[E2B] Sandbox provisioning failed:`, error);

      // Resilient cleanup — don't throw if DB record already gone
      try {
        await db.sandbox.update({
          where: { id: dbSandbox.id },
          data: { status: "ERROR" },
        });
      } catch {
        // Record already deleted by concurrent request
      }
      try {
        await db.agent.update({
          where: { id: agent.id },
          data: { status: "ERROR" },
        });
      } catch {
        // Agent might be deleted
      }

      await sandbox.kill();
      throw error;
    }
  }

  private static async provisionSandbox(sandbox: Sandbox, agent: AgentWithTools) {
    // Check what's available in the sandbox
    const nodeCheck = await sandbox.commands.run("which node && node --version && which npx 2>&1", { timeoutMs: 10000 });
    console.log(`[E2B] Node check: ${nodeCheck.stdout.trim() || "not found"}`);

    // Install Node.js if not present (needed for MCP servers that use npx)
    if (nodeCheck.exitCode !== 0) {
      console.log(`[E2B] Installing Node.js...`);
      const nodeInstall = await sandbox.commands.run(
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs 2>&1",
        { timeoutMs: 120000 }
      );
      if (nodeInstall.exitCode !== 0) {
        console.error("[E2B] Node.js install failed:", nodeInstall.stderr);
        throw new Error(`Failed to install Node.js: ${nodeInstall.stderr}`);
      }
      console.log(`[E2B] Node.js installed`);
    }

    // Install Python dependencies
    console.log(`[E2B] Installing Python dependencies...`);
    const installResult = await sandbox.commands.run(
      "pip install openai-agents fastapi uvicorn 2>&1",
      { timeoutMs: 180000 }
    );
    if (installResult.exitCode !== 0) {
      console.error("[E2B] pip install stdout:", installResult.stdout);
      console.error("[E2B] pip install stderr:", installResult.stderr);
      throw new Error(`pip install failed (exit ${installResult.exitCode}): ${installResult.stderr || installResult.stdout}`);
    }
    console.log(`[E2B] Python dependencies installed`);

    // Write files
    await sandbox.files.write("/home/user/relay_server.py", RELAY_SERVER_CODE);
    await sandbox.files.write("/home/user/agent_runner.py", AGENT_RUNNER_CODE);

    const config = buildAgentConfig(agent);
    const configJson = JSON.stringify(config, null, 2);
    await sandbox.files.write("/home/user/agent_config.json", configJson);
    console.log(`[E2B] Agent config:`, configJson);

    // Start relay as a background process — { background: true } returns immediately
    const openaiKey = process.env.OPENAI_API_KEY || "";
    await sandbox.commands.run(
      `cd /home/user && OPENAI_API_KEY='${openaiKey}' AGENT_CONFIG_PATH=/home/user/agent_config.json python relay_server.py > /home/user/relay.log 2>&1`,
      { background: true },
    );

    // Give uvicorn a moment to bind
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify the process is alive
    const psResult = await sandbox.commands.run("pgrep -f relay_server.py", { timeoutMs: 5000 });
    if (psResult.exitCode !== 0) {
      const logContent = await sandbox.files.read("/home/user/relay.log").catch(() => "no log file");
      console.error("[E2B] Relay server not running. Log:", logContent);
      throw new Error(`Relay server failed to start. Log: ${logContent}`);
    }
    console.log(`[E2B] Relay server process started`);
  }

  private static async waitForRelay(host: string) {
    const { healthCheckAttempts, healthCheckInterval } = SANDBOX_CONFIG;

    for (let i = 0; i < healthCheckAttempts; i++) {
      try {
        const res = await fetch(`https://${host}/health`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.agent_ready) {
            console.log(`[E2B] Health check passed on attempt ${i + 1}`);
            return;
          }
        }
      } catch {
        // Retry
      }
      if (i > 0 && i % 5 === 0) {
        console.log(`[E2B] Health check attempt ${i + 1}/${healthCheckAttempts}...`);
      }
      await new Promise((resolve) => setTimeout(resolve, healthCheckInterval));
    }

    throw new Error(`Relay health check failed after ${healthCheckAttempts} attempts at https://${host}/health`);
  }

  /**
   * Stop and clean up a sandbox.
   */
  static async stopSandbox(agentId: string) {
    const existing = await db.sandbox.findUnique({
      where: { agentId },
    });

    if (existing) {
      await this.cleanupSandboxRecord(existing.id, existing.e2bId);
    }

    try {
      await db.agent.update({
        where: { id: agentId },
        data: { status: "IDLE" },
      });
    } catch {
      // Agent might already be deleted
    }
  }
}
