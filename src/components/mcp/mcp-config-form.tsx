"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MCPConfigField } from "@/types/mcp";

interface MCPConfigFormProps {
  fields: MCPConfigField[];
  onSubmit: (config: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function MCPConfigForm({
  fields,
  onSubmit,
  onCancel,
  loading,
}: MCPConfigFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => {
      initial[f.name] = f.type === "boolean" ? false : "";
    });
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only include non-empty values
    const config: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(values)) {
      if (value !== "" && value !== undefined) {
        config[key] = value;
      }
    }
    onSubmit(config);
  };

  if (fields.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-fg-secondary">
          No configuration needed for this tool.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => onSubmit({})} loading={loading}>
            Add Tool
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          {field.type === "boolean" ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values[field.name] as boolean}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.checked })
                }
                className="rounded border-border bg-bg-tertiary"
              />
              <span className="text-sm text-fg">{field.label}</span>
            </label>
          ) : (
            <Input
              id={field.name}
              label={field.label}
              type={field.type === "password" ? "password" : "text"}
              placeholder={field.placeholder}
              value={(values[field.name] as string) || ""}
              onChange={(e) =>
                setValues({ ...values, [field.name]: e.target.value })
              }
              required={field.required}
            />
          )}
          {field.description && (
            <p className="text-xs text-fg-tertiary mt-1">{field.description}</p>
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={loading}>
          Add Tool
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
