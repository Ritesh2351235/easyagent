import { NextResponse } from "next/server";
import { mcpCatalog } from "@/lib/mcp-catalog";

export async function GET() {
  return NextResponse.json(mcpCatalog);
}
