"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bot, LayoutDashboard, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-bg">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <Bot className="h-5 w-5 text-fg" />
        <span className="font-semibold text-fg">AgentForge</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-bg-secondary text-fg"
                  : "text-fg-secondary hover:text-fg hover:bg-bg-secondary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/agents/new"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-fg-secondary hover:text-fg hover:bg-bg-secondary transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Agent
        </Link>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
        <span className="text-sm text-fg-secondary truncate">Account</span>
      </div>
    </aside>
  );
}
