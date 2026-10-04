import type { Task } from "@/types";

export function isOverdue(t: Pick<Task, "deadline" | "status">): boolean {
  return !!t.deadline && t.status !== "Completed" && new Date(t.deadline).getTime() < Date.now();
}

export function formatDate(iso: string | null, withTime = true): string {
  if (!iso) return "No deadline";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function dueLabel(iso: string | null): string {
  if (!iso) return "No deadline";
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(d); target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "Due yesterday";
  if (days < 0) return `${-days} days overdue`;
  if (days < 7) return `Due in ${days} days`;
  return `Due ${formatDate(iso, false)}`;
}

// <input type="datetime-local"> works in local time without a timezone suffix.
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
