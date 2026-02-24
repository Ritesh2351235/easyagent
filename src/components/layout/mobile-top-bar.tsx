"use client";

import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { useSidebar } from "./sidebar-context";
import { Menu } from "lucide-react";

export function MobileTopBar() {
  const { setMobileOpen } = useSidebar();

  return (
    <div className="flex md:hidden items-center justify-between border-b border-border bg-bg px-3 py-2.5 shrink-0">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-fg-secondary hover:text-fg hover:bg-bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <Logo size="sm" />
        <span className="font-semibold text-fg text-sm">AgentForge</span>
      </div>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-8 w-8 ring-1 ring-border-hover",
            userButtonPopoverCard:
              "bg-bg-secondary border border-border shadow-xl shadow-black/30",
            userButtonPopoverActions: "bg-bg-secondary",
            userButtonPopoverActionButton:
              "text-fg-secondary hover:text-fg hover:bg-bg-tertiary transition-colors",
            userButtonPopoverActionButtonText: "text-sm",
            userButtonPopoverActionButtonIcon: "text-fg-tertiary",
            userButtonPopoverFooter: "hidden",
            userPreviewMainIdentifier: "text-fg text-sm font-medium",
            userPreviewSecondaryIdentifier: "text-fg-tertiary text-xs",
          },
        }}
      />
    </div>
  );
}
