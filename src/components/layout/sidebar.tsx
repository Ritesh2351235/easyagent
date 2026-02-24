"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Bot,
  LayoutDashboard,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-3.5 z-40 flex h-9 w-9 items-center justify-center rounded-md bg-bg-secondary border border-border text-fg-secondary hover:text-fg transition-colors md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-bg transition-all duration-200 ease-in-out",
          // Desktop
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:shadow-2xl",
          collapsed ? "md:w-[60px]" : "md:w-60",
          // Mobile: slide in/out
          mobileOpen
            ? "max-md:translate-x-0 max-md:w-64"
            : "max-md:-translate-x-full max-md:w-64"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-border",
            collapsed ? "justify-center px-2 py-4" : "justify-between px-4 py-4"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <Bot className="h-5 w-5 shrink-0 text-fg" />
            {!collapsed && (
              <span className="font-semibold text-fg truncate">AgentForge</span>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-fg-secondary hover:text-fg hover:bg-bg-secondary transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "hidden md:flex h-7 w-7 items-center justify-center rounded-md text-fg-secondary hover:text-fg hover:bg-bg-secondary transition-colors",
              collapsed && "hidden"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 py-4 space-y-1", collapsed ? "px-1.5" : "px-3")}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-md text-sm font-medium transition-colors",
                  collapsed
                    ? "justify-center px-2 py-2"
                    : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-bg-secondary text-fg"
                    : "text-fg-secondary hover:text-fg hover:bg-bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Expand button (visible when collapsed on desktop) */}
        {collapsed && (
          <div className="hidden md:flex justify-center px-1.5 pb-2">
            <button
              onClick={() => setCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-fg-secondary hover:text-fg hover:bg-bg-secondary transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* New Agent button */}
        <div className={cn(collapsed ? "px-1.5 pb-3" : "px-3 pb-3")}>
          <Link
            href="/agents/new"
            title={collapsed ? "New Agent" : undefined}
            className={cn(
              "flex items-center rounded-md border border-border text-sm font-medium text-fg-secondary hover:text-fg hover:bg-bg-secondary transition-colors",
              collapsed
                ? "justify-center h-9 w-full"
                : "justify-center gap-2 w-full px-3 py-2"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && "New Agent"}
          </Link>
        </div>

        {/* User section */}
        <div
          className={cn(
            "flex items-center border-t border-border",
            collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
          )}
        >
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          {!collapsed && (
            <span className="text-sm text-fg-secondary truncate">Account</span>
          )}
        </div>
      </aside>
    </>
  );
}
