import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const innerSizes = {
  sm: "h-3 w-3",
  md: "h-4.5 w-4.5",
  lg: "h-6 w-6",
};

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        sizes[size],
        className
      )}
      style={{
        background:
          "linear-gradient(135deg, #ff6b2b 0%, #ff8c42 25%, #ffb347 50%, #ff6b2b 75%, #e85d26 100%)",
        boxShadow:
          "0 0 20px rgba(255,107,43,0.3), inset 0 1px 1px rgba(255,255,255,0.2)",
      }}
    >
      {/* Inner glow overlay */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 60%)",
        }}
      />
      {/* Animated pulse ring */}
      <div
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{
          background:
            "linear-gradient(135deg, #ff6b2b, #ff8c42)",
          animationDuration: "3s",
        }}
      />
      {/* Inner dot - the "voice" bubble core */}
      <div
        className={cn(
          "relative rounded-full",
          innerSizes[size]
        )}
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 40%, rgba(255,200,150,0.3) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function LogoWithText({
  size = "md",
  className,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={size} />
      <span
        className={cn(
          "font-semibold tracking-tight text-fg",
          size === "sm" && "text-sm",
          size === "md" && "text-lg",
          size === "lg" && "text-2xl"
        )}
      >
        AgentForge
      </span>
    </div>
  );
}
