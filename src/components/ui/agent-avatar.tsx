import { cn } from "@/lib/utils";

// Gradient palettes — each agent gets a unique one based on its ID/name
const gradients = [
  { from: "#ff6b2b", via: "#ff8c42", to: "#ffb347" }, // orange (like main logo)
  { from: "#6366f1", via: "#818cf8", to: "#a5b4fc" }, // indigo
  { from: "#ec4899", via: "#f472b6", to: "#f9a8d4" }, // pink
  { from: "#14b8a6", via: "#2dd4bf", to: "#5eead4" }, // teal
  { from: "#f59e0b", via: "#fbbf24", to: "#fcd34d" }, // amber
  { from: "#8b5cf6", via: "#a78bfa", to: "#c4b5fd" }, // violet
  { from: "#06b6d4", via: "#22d3ee", to: "#67e8f9" }, // cyan
  { from: "#ef4444", via: "#f87171", to: "#fca5a5" }, // red
  { from: "#10b981", via: "#34d399", to: "#6ee7b7" }, // emerald
  { from: "#f97316", via: "#fb923c", to: "#fdba74" }, // deep orange
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getGradient(seed: string) {
  return gradients[hashString(seed) % gradients.length];
}

interface AgentAvatarProps {
  agentId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-14 w-14",
};

const innerSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-5 w-5",
};

export function AgentAvatar({ agentId, size = "md", className }: AgentAvatarProps) {
  const g = getGradient(agentId);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        sizes[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${g.from} 0%, ${g.via} 50%, ${g.to} 100%)`,
        boxShadow: `0 0 12px ${g.from}30, inset 0 1px 1px rgba(255,255,255,0.2)`,
      }}
    >
      {/* Inner glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 60%)",
        }}
      />
      {/* Inner dot */}
      <div
        className={cn("relative rounded-full", innerSizes[size])}
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
