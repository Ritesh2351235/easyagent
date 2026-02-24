import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Header({ title, description, children, className }: HeaderProps) {
  return (
    <div className={cn("flex items-center justify-between pb-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-fg-secondary">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
