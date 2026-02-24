import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Cpu,
  Shield,
  Zap,
  ArrowRight,
  Terminal,
  GitBranch,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(250,250,250,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,250,250,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Top glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 z-0"
        style={{
          width: "800px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(250,250,250,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="text-lg font-semibold text-fg tracking-tight">
            AgentForge
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden sm:inline-flex text-sm text-fg-secondary hover:text-fg transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-fg px-4 py-2 text-sm font-medium text-bg hover:bg-accent transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary/50 px-4 py-1.5 text-xs font-medium text-fg-secondary tracking-wide uppercase">
            <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Now in public beta
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-fg sm:text-6xl lg:text-7xl leading-[1.08]">
            Deploy AI agents
            <br />
            <span className="text-fg-tertiary">in secure sandboxes</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-fg-secondary sm:text-lg leading-relaxed">
            Create, configure, and run AI agents — each in its own isolated
            cloud environment with MCP tool access.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-lg bg-fg px-6 py-3 text-sm font-medium text-bg hover:bg-accent transition-all"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-fg-secondary hover:text-fg hover:border-border-hover transition-all"
            >
              Sign in
            </Link>
          </div>

          {/* Terminal mockup */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="rounded-xl border border-border bg-bg-secondary/80 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <span className="h-2.5 w-2.5 rounded-full bg-fg-tertiary/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-fg-tertiary/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-fg-tertiary/30" />
                <span className="ml-3 text-xs text-fg-tertiary font-mono">
                  agent-forge
                </span>
              </div>
              <div className="p-5 text-left font-mono text-sm leading-7">
                <div className="text-fg-tertiary">
                  <span className="text-success">$</span> Creating agent{" "}
                  <span className="text-fg">&quot;code-reviewer&quot;</span>
                </div>
                <div className="text-fg-tertiary">
                  <span className="text-success">$</span> Sandbox provisioned{" "}
                  <span className="text-fg-tertiary/50">— 1.2s</span>
                </div>
                <div className="text-fg-tertiary">
                  <span className="text-success">$</span> MCP tools attached:{" "}
                  <span className="text-fg">github, filesystem</span>
                </div>
                <div className="text-fg-tertiary">
                  <span className="text-success">$</span> Agent{" "}
                  <span className="text-success">running</span>{" "}
                  <span className="inline-block w-1.5 h-4 bg-fg animate-pulse ml-0.5 align-middle" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Isolated Sandboxes",
                desc: "Every agent runs in a dedicated E2B microVM. Full Linux, zero interference.",
              },
              {
                icon: Cpu,
                title: "MCP Tool Support",
                desc: "Connect GitHub, filesystems, databases — via Model Context Protocol.",
              },
              {
                icon: Zap,
                title: "Real-time Streaming",
                desc: "Token-by-token response streaming. See your agent think in real time.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-bg-secondary/40 p-6 transition-colors hover:bg-bg-secondary/70 hover:border-border-hover"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-bg-tertiary border border-border">
                  <feature.icon className="h-4.5 w-4.5 text-fg-secondary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-fg text-[15px]">
                  {feature.title}
                </h3>
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-6 pb-28">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-fg sm:text-3xl tracking-tight">
              Three steps. That&apos;s it.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: Terminal,
                title: "Create an agent",
                desc: "Name it, set instructions, choose a model.",
              },
              {
                step: "02",
                icon: GitBranch,
                title: "Attach tools",
                desc: "Add MCP servers — GitHub, file system, custom APIs.",
              },
              {
                step: "03",
                icon: Lock,
                title: "Run in sandbox",
                desc: "Start chatting. Everything executes in an isolated cloud VM.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="text-xs font-mono text-fg-tertiary/50 tracking-widest">
                  {item.step}
                </span>
                <div className="mt-3 mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-secondary">
                  <item.icon className="h-4 w-4 text-fg-secondary" />
                </div>
                <h3 className="font-semibold text-fg text-[15px] mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="rounded-2xl border border-border bg-bg-secondary/50 px-6 py-14 sm:px-14 text-center relative overflow-hidden">
            {/* CTA background glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(250,250,250,0.03) 0%, transparent 60%)",
              }}
            />
            <h2 className="relative text-2xl font-bold text-fg sm:text-3xl tracking-tight">
              Ready to build?
            </h2>
            <p className="relative mt-3 text-fg-secondary max-w-md mx-auto">
              Deploy your first AI agent in under two minutes.
            </p>
            <Link
              href="/sign-up"
              className="relative group inline-flex items-center gap-2 rounded-lg bg-fg px-6 py-3 text-sm font-medium text-bg hover:bg-accent transition-all mt-8"
            >
              Get started free
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-sm text-fg-tertiary">AgentForge</span>
          </div>
          <span className="text-xs text-fg-tertiary/60">
            AI agents in secure cloud sandboxes
          </span>
        </div>
      </footer>
    </div>
  );
}
