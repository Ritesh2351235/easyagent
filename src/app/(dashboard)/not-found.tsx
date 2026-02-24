import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary mb-4">
        <FileQuestion className="h-8 w-8 text-fg-tertiary" />
      </div>
      <h2 className="text-lg font-semibold text-fg mb-2">Not Found</h2>
      <p className="text-sm text-fg-secondary mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/dashboard">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
