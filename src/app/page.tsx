import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Bot, Cpu, Shield, Zap } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-bg">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-fg" />
          <span className="text-lg font-semibold text-fg">AgentForge</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-fg-secondary hover:text-fg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg hover:bg-accent transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-fg-secondary">
          <Zap className="h-3.5 w-3.5" />
          Powered by E2B Cloud Sandboxes
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-fg sm:text-6xl">
          Build AI Agents
          <br />
          <span className="text-fg-tertiary">in Isolated Sandboxes</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-fg-secondary">
          Create, configure, and chat with AI agents running in secure cloud
          environments. Each agent gets its own sandbox with MCP tool support.
        </p>

        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 rounded-md bg-fg px-6 py-3 text-base font-medium text-bg hover:bg-accent transition-colors"
        >
          Start Building
          <span aria-hidden="true">&rarr;</span>
        </Link>

        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Isolated Sandboxes",
              desc: "Each agent runs in its own secure E2B microVM with full Linux environment.",
            },
            {
              icon: Cpu,
              title: "MCP Tool Support",
              desc: "Connect filesystem, GitHub, databases, and more via Model Context Protocol.",
            },
            {
              icon: Zap,
              title: "Real-time Streaming",
              desc: "Chat with agents and see responses stream token-by-token in real time.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-bg-secondary p-6 text-left"
            >
              <feature.icon className="mb-3 h-5 w-5 text-fg-tertiary" />
              <h3 className="mb-2 font-semibold text-fg">{feature.title}</h3>
              <p className="text-sm text-fg-secondary">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-fg-tertiary">
        AgentForge &mdash; AI agents in secure cloud sandboxes
      </footer>
    </div>
  );
}
