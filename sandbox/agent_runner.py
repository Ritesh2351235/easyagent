"""
Agent runner wrapping OpenAI Agents SDK with MCP support.
Loaded by relay_server.py inside E2B sandboxes.

Uses the official async-with context manager pattern from:
https://openai.github.io/openai-agents-python/mcp/
"""
import json
import os
from typing import AsyncIterator

try:
    from agents import Agent, Runner
    from agents.mcp import MCPServerStdio
    HAS_SDK = True
except ImportError:
    HAS_SDK = False


def fix_array_schemas(schema):
    """Recursively add 'items' to array schemas that are missing it.

    Some MCP servers (e.g. HubSpot) expose array properties without the
    required 'items' field, which causes OpenAI to reject them with a 400.
    Returns the number of fields fixed.
    """
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
        self.config: dict = {}
        self.agent = None
        self.mcp_servers: list = []
        self.ready = False

    async def initialize(self):
        """Load config and set up the agent with MCP tools."""
        try:
            with open(self.config_path, "r") as f:
                self.config = json.load(f)
        except FileNotFoundError:
            print(f"Config not found at {self.config_path}, using defaults")
            self.config = {
                "name": "Assistant",
                "instructions": "You are a helpful assistant.",
                "model": "gpt-4o-mini",
                "mcp_tools": [],
            }

        if not HAS_SDK:
            print("WARNING: openai-agents not installed, agent will echo messages")
            self.ready = True
            return

        # Create and connect MCP servers using the SDK's connect() method.
        # The official pattern is `async with MCPServerStdio(...) as server`
        # but since we need long-lived servers, we call connect/cleanup manually.
        mcp_tools = self.config.get("mcp_tools", [])
        for tool_config in mcp_tools:
            if not tool_config.get("enabled", True):
                continue
            try:
                server = MCPServerStdio(
                    name=tool_config["name"],
                    params={
                        "command": tool_config["command"],
                        "args": tool_config.get("args", []),
                        "env": {**os.environ, **tool_config.get("env", {})},
                    },
                    cache_tools_list=True,
                )
                await server.connect()
                self.mcp_servers.append(server)
                print(f"Connected MCP server: {tool_config['name']}")

                # Fix schemas that OpenAI would reject.
                # Since cache_tools_list=True, list_tools() caches the result.
                # We modify inputSchema dicts in-place so the cached objects
                # retain our fixes on subsequent SDK calls.
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

    async def run(self, message: str, history: list[dict]) -> AsyncIterator[str]:
        """Run the agent with streaming output."""
        if not HAS_SDK or self.agent is None:
            yield f"Echo: {message}"
            return

        input_messages = []
        for msg in history:
            input_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
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
        """Clean up MCP server connections."""
        for server in self.mcp_servers:
            try:
                await server.cleanup()
            except Exception:
                pass
        self.mcp_servers.clear()
