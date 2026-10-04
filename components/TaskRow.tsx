import Link from "next/link";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types";
import { dueLabel, isOverdue } from "@/lib/utils";
import { PriorityTag, StatusTag } from "./Badges";

interface Props { task: Task; onComplete?: (t: Task) => void; onDelete?: (t: Task) => void }

export function TaskRow({ task, onComplete, onDelete }: Props) {
  const overdue = isOverdue(task);
  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link href={`/tasks/${task.id}`} className={`font-medium hover:underline ${task.status === "Completed" ? "text-muted line-through" : ""}`}>
          {task.title}
        </Link>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
          {task.subjects && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: task.subjects.color }} aria-hidden />{task.subjects.name}
            </span>
          )}
          <span>{task.task_type}</span>
          <span className={overdue ? "font-medium text-red-700" : ""}>{task.status === "Completed" ? "Completed" : dueLabel(task.deadline)}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <PriorityTag priority={task.priority} />
        <StatusTag status={task.status} overdue={overdue} />
        {(onComplete || onDelete) && (
          <span className="flex items-center gap-1">
            {onComplete && task.status !== "Completed" && (
              <button className="btn px-2" aria-label={`Mark "${task.title}" complete`} title="Mark complete" onClick={() => onComplete(task)}><Check size={14} /></button>
            )}
            <Link className="btn px-2" aria-label={`Edit "${task.title}"`} title="Edit" href={`/tasks/${task.id}?edit`}><Pencil size={14} /></Link>
            {onDelete && <button className="btn btn-danger px-2" aria-label={`Delete "${task.title}"`} title="Delete" onClick={() => onDelete(task)}><Trash2 size={14} /></button>}
          </span>
        )}
      </div>
    </li>
  );
}

export function EmptyTasks({ filtered }: { filtered?: boolean }) {
  return (
    <div className="py-10 text-center">
      <p className="font-medium">{filtered ? "No tasks match these filters." : "No tasks yet."}</p>
      {!filtered && (
        <>
          <p className="mt-1 text-sm text-muted">Add your first assignment and start keeping track of your deadlines.</p>
          <Link href="/tasks/new" className="btn btn-primary mt-4">Add Task</Link>
        </>
      )}
    </div>
  );
}
