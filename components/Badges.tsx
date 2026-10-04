import type { Priority, Status } from "@/types";

const P: Record<Priority, string> = { High: "bg-red-600", Medium: "bg-amber-500", Low: "bg-gray-400" };

// Text label + marker, so priority is never conveyed by color alone.
export function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`h-2 w-2 ${P[priority]}`} aria-hidden /> {priority}
    </span>
  );
}

export function StatusTag({ status, overdue }: { status: Status; overdue?: boolean }) {
  return (
    <span className={`rounded border px-1.5 py-0.5 text-xs ${overdue ? "border-red-300 bg-red-50 text-red-800" : status === "Completed" ? "border-line bg-gray-100 text-muted" : "border-line bg-white"}`}>
      {overdue ? "Overdue" : status}
    </span>
  );
}
