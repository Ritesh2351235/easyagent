import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAgentSchema } from "@/lib/validations/agent";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireUser();
    const agents = await db.agent.findMany({
      where: { userId: user.id },
      include: { mcpTools: true, sandbox: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(agents);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = createAgentSchema.parse(body);

    const agent = await db.agent.create({
      data: {
        ...data,
        userId: user.id,
      },
      include: { mcpTools: true, sandbox: true },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
