# AgentForge — Architecture

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) | Server/client components, API routes, SSR |
| Styling | Tailwind CSS v4, IBM Plex Sans | Dark-first monotone design system |
| Auth | Clerk (Google sign-in) | Authentication, session management |
| Database | Neon PostgreSQL + Prisma ORM | User data, agents, chat history, sandbox state |
| Sandboxes | E2B SDK (`@e2b/sdk`) | Isolated Linux microVMs per agent |
| Agent Runtime | OpenAI Agents SDK (Python) | LLM orchestration with tool calling |
| Model | GPT-4o-mini (default) | Chat completions via OpenAI API |
| MCP | Model Context Protocol via `MCPServerStdio` | Standardized tool integration (HubSpot, GitHub, etc.) |
| Streaming | Server-Sent Events (SSE) | Real-time token-by-token chat responses |

---

## How E2B Works

### What is E2B?

E2B (Environment-to-Binary) provides **cloud sandboxes** — lightweight, isolated Linux microVMs that spin up in ~150ms. Each sandbox is a full Linux environment with its own filesystem, network, and process tree. Think of it as a Docker container but purpose-built for AI agents.

### Sandbox Lifecycle

```
Create → Provision → Running → (Timeout/Kill) → Destroyed
```

1. **Create**: `Sandbox.create()` spins up a fresh Linux microVM via E2B's API. Returns a sandbox instance with a unique ID.

2. **Provision**: We install dependencies and write files into the sandbox:
   - Install Node.js (for MCP servers that use `npx`)
   - Install Python packages (`openai-agents`, `fastapi`, `uvicorn`)
   - Write the relay server and agent runner Python files
   - Write the agent configuration JSON

3. **Running**: The sandbox runs a FastAPI server that wraps the OpenAI Agents SDK. It's reachable via a public URL provided by `sandbox.getHost(port)`.

4. **Timeout/Kill**: Sandboxes auto-terminate after a configurable timeout (default 10 min). We can also explicitly kill them via `sandbox.kill()`.

### Key E2B APIs We Use

```typescript
// Create a new sandbox
const sandbox = await Sandbox.create({
  apiKey: process.env.E2B_API_KEY,
  timeoutMs: 600_000, // 10 minutes
});

// Reconnect to an existing sandbox by ID
const sandbox = await Sandbox.connect(sandboxId, { apiKey });

// Run a command (waits for exit)
const result = await sandbox.commands.run("pip install fastapi", {
  timeoutMs: 180_000,
});

// Run a long-lived process in background (returns immediately)
await sandbox.commands.run("python server.py", { background: true });

// Write/read files
await sandbox.files.write("/home/user/config.json", jsonString);
const content = await sandbox.files.read("/home/user/relay.log");

// Get public URL for a port
const host = sandbox.getHost(8080); // → "abc123-8080.e2b.dev"

// Terminate
await sandbox.kill();
```

### Why E2B?

- **Isolation**: Each agent runs in its own VM. A rogue MCP tool can't affect other agents or the host.
- **Security**: User API keys (OpenAI, HubSpot, etc.) live only inside the sandbox process environment — never written to disk.
- **Reproducibility**: Every sandbox starts from the same base image. No state leaks between sessions.
- **Ephemerality**: Sandboxes are disposable. If something breaks, kill it and create a new one.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ Dashboard │  │ Agent Detail  │  │      Chat Interface       │ │
│  │ (agents)  │  │ (MCP tools)  │  │ (SSE streaming messages)  │ │
│  └─────┬─────┘  └──────┬───────┘  └─────────────┬─────────────┘ │
└────────┼───────────────┼────────────────────────┼───────────────┘
         │               │                        │
         ▼               ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                           │
│                                                                 │
│  GET/POST /api/agents          Agent CRUD                       │
│  GET/PATCH/DELETE /api/agents/[id]                               │
│  POST /api/agents/[id]/sandbox    Start sandbox                 │
│  DELETE /api/agents/[id]/sandbox  Stop sandbox                  │
│  POST /api/agents/[id]/chat       SSE streaming chat            │
│  GET /api/mcp-tools               Tool catalog                  │
│                                                                 │
│  ┌─────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │  Clerk  │  │   Prisma DB  │  │    SandboxManager (E2B)    │ │
│  │  Auth   │  │   (Neon PG)  │  │  getOrCreate / stop / etc  │ │
│  └─────────┘  └──────────────┘  └──────────────┬─────────────┘ │
└──────────────────────────────────────────────────┼──────────────┘
                                                   │
                                    HTTPS to sandbox host
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    E2B Sandbox (Linux microVM)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FastAPI Relay Server (:8080)                 │   │
│  │                                                          │   │
│  │  GET  /health    → { status, agent_ready }               │   │
│  │  POST /chat      → SSE stream of token deltas            │   │
│  └───────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    AgentRunner                            │   │
│  │                                                          │   │
│  │  • Loads agent_config.json (name, instructions, model)   │   │
│  │  • Starts MCP servers via MCPServerStdio                 │   │
│  │  • Creates OpenAI Agent with MCP tools attached          │   │
│  │  • Streams responses via Runner.run_streamed()           │   │
│  └───────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│              ┌───────────────┼───────────────┐                   │
│              ▼               ▼               ▼                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐        │
│  │   HubSpot    │ │   GitHub     │ │   Filesystem     │        │
│  │  MCP Server  │ │  MCP Server  │ │   MCP Server     │        │
│  │  (npx ...)   │ │  (npx ...)   │ │   (npx ...)      │        │
│  └──────────────┘ └──────────────┘ └──────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow: Sending a Chat Message

Here's what happens when a user sends "List my HubSpot contacts":

### 1. Browser → Next.js API

```
POST /api/agents/{agentId}/chat
Body: { message: "List my HubSpot contacts", sessionId: "abc" }
```

The chat route handler (`src/app/api/agents/[agentId]/chat/route.ts`):
- Authenticates the user via Clerk
- Loads the agent and verifies ownership
- Ensures a sandbox is running (calls `SandboxManager.getOrCreateSandbox()`)
- Creates or loads a chat session from the database
- Saves the user message to the database

### 2. Next.js API → E2B Sandbox

The API proxies the message to the FastAPI relay inside the sandbox:

```
POST https://{sandbox-host}/chat
Body: { message: "List my HubSpot contacts", history: [...] }
```

The sandbox host URL looks like `abc123-8080.e2b.dev` — a public HTTPS endpoint routed to port 8080 inside the specific sandbox.

### 3. Inside the Sandbox: Relay → Agent → MCP

The FastAPI relay receives the request and passes it to `AgentRunner.run()`:

1. **AgentRunner** builds the message history and calls `Runner.run_streamed(agent, input=messages)`
2. **OpenAI Agents SDK** sends the messages + tool definitions to **GPT-4o-mini**
3. GPT-4o-mini decides to call the `hubspot-search-contacts` tool
4. The SDK routes the tool call to the **HubSpot MCP server** (running as a subprocess via `npx @hubspot/mcp-server`)
5. The MCP server calls the HubSpot API using the configured access token
6. Results flow back: MCP → SDK → GPT-4o-mini → generates natural language response
7. Each token of the response is yielded as an SSE event

### 4. E2B Sandbox → Next.js API → Browser

The relay streams SSE events back:

```
data: {"type": "delta", "content": "Here"}
data: {"type": "delta", "content": " are"}
data: {"type": "delta", "content": " your"}
data: {"type": "delta", "content": " contacts"}
...
data: {"type": "done"}
```

The Next.js API route pipes these through a `ReadableStream` to the browser. The `useChat` hook on the client reads chunks via `reader.read()`, parses SSE lines, and updates the UI token-by-token.

When the stream completes, the API saves the full assistant message to the database.

---

## Database Schema

```
User (Clerk-synced)
 └── Agent (name, instructions, model, status)
      ├── AgentMCPTool (toolName, enabled, config JSON)
      ├── Sandbox (e2bId, status, host, port)
      └── ChatSession
           └── ChatMessage (role, content, timestamp)
```

Key relationships:
- **User → Agent**: One-to-many. Users own their agents.
- **Agent → AgentMCPTool**: One-to-many. Each tool has a JSON config blob storing `command`, `args`, and `env` vars.
- **Agent → Sandbox**: One-to-one. At most one sandbox per agent at a time.
- **Agent → ChatSession → ChatMessage**: Chat history persists in the database, surviving sandbox restarts.

---

## MCP Tool Flow

### How tools get from the UI to the sandbox

```
1. User browses catalog        → GET /api/mcp-tools (returns mcp-catalog.ts)
2. User configures & adds tool → PATCH /api/agents/{id} with mcpTools array
3. Tool config saved to DB     → AgentMCPTool record (toolName, config JSON)
4. Sandbox starts              → buildAgentConfig() reads DB, writes agent_config.json
5. AgentRunner loads config    → Creates MCPServerStdio for each tool
6. MCP server connects         → Subprocess spawned (e.g. npx @hubspot/mcp-server)
7. Agent uses tools in chat    → SDK routes tool calls to appropriate MCP server
```

### Tool config example (stored in DB as JSON)

```json
{
  "command": "npx",
  "args": ["-y", "@hubspot/mcp-server"],
  "env": {
    "PRIVATE_APP_ACCESS_TOKEN": "pat-na1-xxxxx"
  }
}
```

### Schema Compatibility Fix

Some MCP servers (notably HubSpot) expose tool schemas with `"type": "array"` but no `"items"` property. OpenAI's API requires `"items"` on all array types and rejects the request with a 400 error.

We fix this at startup: after connecting each MCP server, we call `list_tools()` with `cache_tools_list=True`, walk every `inputSchema` recursively, and add `"items": {}` where missing. Since the SDK caches the tool list, the in-place fixes persist for the lifetime of the server.

---

## Sandbox State Machine

```
         create
  IDLE ──────────► STARTING
                      │
                      │ provision + health check pass
                      ▼
                   RUNNING ◄──── reconnect (on existing sandbox)
                      │
           ┌─────────┼──────────┐
           │         │          │
        timeout   user stop   error
           │         │          │
           ▼         ▼          ▼
        (killed)   IDLE       ERROR
```

The `SandboxManager` handles all transitions:
- **STARTING**: Sandbox is provisioning. Concurrent requests wait instead of creating duplicates.
- **RUNNING**: Sandbox is healthy. Requests reconnect via `Sandbox.connect()` and verify `/health`.
- **ERROR/STOPPED**: Stale record cleaned up, new sandbox created on next request.
- **Timeout**: E2B auto-kills sandboxes after the configured timeout (10 min default).

---

## Project Structure

```
easyagent/
├── prisma/schema.prisma              # Database models
├── sandbox/
│   ├── relay_server.py               # FastAPI server (deployed into E2B)
│   └── agent_runner.py               # OpenAI Agents SDK wrapper
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (Clerk, fonts, theme)
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Tailwind v4 theme tokens
│   │   ├── (auth)/                   # Sign-in / sign-up pages
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Sidebar + content shell
│   │   │   ├── dashboard/page.tsx    # Agent listing grid
│   │   │   └── agents/[agentId]/
│   │   │       ├── page.tsx          # Agent detail + MCP tools
│   │   │       └── chat/page.tsx     # Chat interface
│   │   └── api/
│   │       ├── agents/               # Agent CRUD + sandbox + chat
│   │       └── mcp-tools/            # Tool catalog endpoint
│   ├── components/
│   │   ├── ui/                       # Design system (button, card, etc.)
│   │   ├── layout/                   # Sidebar, header
│   │   ├── agents/                   # Agent cards, forms
│   │   ├── chat/                     # Chat interface components
│   │   └── mcp/                      # Tool selector, config form
│   ├── hooks/                        # useAgents, useChat, useSandboxStatus
│   ├── lib/
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── auth.ts                   # Clerk → DB user sync
│   │   ├── e2b.ts                    # SandboxManager + inline Python code
│   │   ├── mcp-catalog.ts            # Static tool catalog
│   │   └── constants.ts              # App config, sandbox settings
│   └── types/                        # TypeScript type definitions
└── middleware.ts                      # Clerk route protection
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend key |
| `E2B_API_KEY` | E2B sandbox API key |
| `OPENAI_API_KEY` | Passed into sandboxes for the agent runtime |

The OpenAI API key is passed as a process environment variable when starting the relay server inside the sandbox — it's never written to the filesystem.
