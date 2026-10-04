"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Shell, Loading, ErrorBox } from "@/components/Shell";
import { EmptyTasks, TaskRow } from "@/components/TaskRow";
import { toast } from "@/components/Toaster";
import { useLoad } from "@/hooks/useLoad";
import { deleteTask, listSubjects, listTasks, setStatus } from "@/services/tasks";
import { PRIORITIES, STATUSES, TASK_TYPES, type Task } from "@/types";

export default function TasksPage() {
  const tasks = useLoad(listTasks);
  const subjects = useLoad(listSubjects);
  const [f, setF] = useState({ q: "", status: "", priority: "", subject: "", type: "", sort: "asc" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const shown = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const list = (tasks.data ?? []).filter((t) =>
      (!q || t.title.toLowerCase().includes(q)) && (!f.status || t.status === f.status) && (!f.priority || t.priority === f.priority) &&
      (!f.subject || t.subject_id === f.subject) && (!f.type || t.task_type === f.type));
    // Tasks without a deadline always go last.
    return list.sort((a, b) => {
      if (!a.deadline || !b.deadline) return a.deadline ? -1 : b.deadline ? 1 : 0;
      return (+new Date(a.deadline) - +new Date(b.deadline)) * (f.sort === "asc" ? 1 : -1);
    });
  }, [tasks.data, f]);

  async function complete(t: Task) {
    try { await setStatus(t.id, "Completed"); toast("Task marked complete."); tasks.reload(); }
    catch (e) { toast((e as Error).message, "error"); }
  }
  async function remove(t: Task) {
    if (!confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
    try { await deleteTask(t.id); toast("Task deleted."); tasks.reload(); }
    catch (e) { toast((e as Error).message, "error"); }
  }

  const select = (k: keyof typeof f, label: string, opts: { v: string; l: string }[]) => (
    <select aria-label={label} className="input w-auto" value={f[k]} onChange={set(k)}>
      <option value="">{label}</option>{opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
  const plain = (a: readonly string[]) => a.map((v) => ({ v, l: v }));
  const filtered = Object.entries(f).some(([k, v]) => k !== "sort" && v);

  return (
    <Shell title="Tasks">
      <div className="mb-4 flex items-center justify-between gap-3">
        <input type="search" aria-label="Search tasks" placeholder="Search tasks" className="input max-w-xs" value={f.q} onChange={set("q")} />
        <Link href="/tasks/new" className="btn btn-primary"><Plus size={14} aria-hidden /> Add Task</Link>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {select("status", "All statuses", plain(STATUSES))}
        {select("priority", "All priorities", plain(PRIORITIES))}
        {select("subject", "All subjects", (subjects.data ?? []).map((s) => ({ v: s.id, l: s.name })))}
        {select("type", "All types", plain(TASK_TYPES))}
        <select aria-label="Sort by deadline" className="input w-auto" value={f.sort} onChange={set("sort")}>
          <option value="asc">Earliest deadline first</option><option value="desc">Latest deadline first</option>
        </select>
      </div>
      <div className="rounded border border-line bg-white px-4">
        {tasks.loading ? <Loading /> : tasks.error ? <div className="py-4"><ErrorBox message={tasks.error} retry={tasks.reload} /></div>
          : shown.length ? <ul>{shown.map((t) => <TaskRow key={t.id} task={t} onComplete={complete} onDelete={remove} />)}</ul>
          : <EmptyTasks filtered={filtered} />}
      </div>
    </Shell>
  );
}
