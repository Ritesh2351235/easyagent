export function StreamingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className="h-1.5 w-1.5 rounded-full bg-fg-tertiary animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-fg-tertiary animate-pulse [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-fg-tertiary animate-pulse [animation-delay:300ms]" />
    </span>
  );
}
