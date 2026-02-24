"""
FastAPI relay server that runs inside E2B sandboxes.
Wraps the OpenAI Agents SDK and provides HTTP endpoints for chat.
"""
import asyncio
import json
import os
import sys

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
import uvicorn

# Add sandbox dir to path
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
                yield f"data: {data}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            error_data = json.dumps({"type": "error", "error": str(e)})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
