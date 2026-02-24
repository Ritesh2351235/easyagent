import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 className="h-5 w-5 animate-spin text-fg-tertiary" />
    </div>
  );
}

export { Spinner };
