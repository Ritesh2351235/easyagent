"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Check, Wrench } from "lucide-react";
import type { MCPToolDefinition } from "@/types/mcp";

interface MCPToolCardProps {
  tool: MCPToolDefinition;
  isAttached: boolean;
  onSelect: (tool: MCPToolDefinition) => void;
}

export function MCPToolCard({ tool, isAttached, onSelect }: MCPToolCardProps) {
  return (
    <Card
      className={`transition-all hover:-translate-y-0.5 hover:border-border-hover ${
        isAttached ? "border-fg-tertiary" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-bg-tertiary">
              <Wrench className="h-3.5 w-3.5 text-fg-secondary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-fg">{tool.displayName}</h4>
              <Badge variant="outline" className="text-[10px] mt-0.5">
                {tool.category}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-xs text-fg-secondary mb-3 line-clamp-2">
          {tool.description}
        </p>
        <Button
          variant={isAttached ? "secondary" : "outline"}
          size="sm"
          className="w-full"
          onClick={() => onSelect(tool)}
          disabled={isAttached}
        >
          {isAttached ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add Tool
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
