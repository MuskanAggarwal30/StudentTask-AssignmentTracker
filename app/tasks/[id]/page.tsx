"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shell, Loading, ErrorBox } from "@/components/Shell";
import { PriorityTag, StatusTag } from "@/components/Badges";
import { TaskForm } from "@/components/TaskForm";
import { toast } from "@/components/Toaster";
import { useLoad } from "@/hooks/useLoad";
import { formatDate, isOverdue } from "@/lib/utils";
import { deleteTask, getTask, setStatus } from "@/services/tasks";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: t, error, loading, reload } = useLoad(() => getTask(id));
  const [editing, setEditing] = useState(false);
  useEffect(() => { setEditing(window.location.search.includes("edit")); }, []);

  async function complete() {
    try { await setStatus(id, "Completed"); toast("Task marked complete."); reload(); }
    catch (e) { toast((e as Error).message, "error"); }
  }
  async function remove() {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    try { await deleteTask(id); toast("Task deleted."); router.push("/tasks"); router.refresh(); }
    catch (e) { toast((e as Error).message, "error"); }
  }

  const row = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-2 border-b border-line py-2 text-sm last:border-0"><dt className="text-muted">{label}</dt><dd className="col-span-2">{value}</dd></div>
  );

  return (
    <Shell title="Task">
      {loading ? <Loading /> : error || !t ? <ErrorBox message={error ?? "Task not found."} retry={reload} /> : editing ? (
        <TaskForm initial={t} onSaved={() => { setEditing(false); reload(); }} />
      ) : (
        <>
          <Link href="/tasks" className="text-sm text-accent underline">Back to tasks</Link>
          <h2 className="mb-4 mt-2 text-xl font-semibold">{t.title}</h2>
          <dl className="rounded border border-line bg-white px-4">
            {row("Subject", t.subjects?.name ?? "None")}
            {row("Type", t.task_type)}
            {row("Description", t.description || "No description")}
            {row("Deadline", formatDate(t.deadline))}
            {row("Priority", <PriorityTag priority={t.priority} />)}
            {row("Status", <StatusTag status={t.status} overdue={isOverdue(t)} />)}
            {row("Created", formatDate(t.created_at))}
            {t.completed_at && row("Completed", formatDate(t.completed_at))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn" onClick={() => setEditing(true)}>Edit</button>
            {t.status !== "Completed" && <button className="btn btn-primary" onClick={complete}>Mark Complete</button>}
            <button className="btn btn-danger" onClick={remove}>Delete</button>
          </div>
        </>
      )}
    </Shell>
  );
}
