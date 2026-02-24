import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-full flex-col -m-6">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-14 w-14 rounded-full mx-auto mb-4" />
          <Skeleton className="h-5 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-60 mx-auto" />
        </div>
      </div>
      <div className="border-t border-border px-4 py-3">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
