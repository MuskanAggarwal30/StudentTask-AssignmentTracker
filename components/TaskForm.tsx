"use client";
import { useState } from "react";
import Link from "next/link";
import { PRIORITIES, STATUSES, TASK_TYPES, type Task, type TaskInput } from "@/types";
import { listSubjects, saveTask } from "@/services/tasks";
import { toLocalInput } from "@/lib/utils";
import { useLoad } from "@/hooks/useLoad";
import { toast } from "./Toaster";

export function TaskForm({ initial, onSaved }: { initial?: Task; onSaved: () => void }) {
  const { data: subjects } = useLoad(listSubjects);
  const [f, setF] = useState({
    title: initial?.title ?? "", description: initial?.description ?? "", subject_id: initial?.subject_id ?? "",
    task_type: initial?.task_type ?? "Assignment", priority: initial?.priority ?? "Medium",
    status: initial?.status ?? "Pending", deadline: toLocalInput(initial?.deadline ?? null),
  });
  const [errors, setErrors] = useState<{ title?: string; deadline?: string }>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!f.title.trim()) errs.title = "Enter a task title.";
    if (f.deadline && isNaN(new Date(f.deadline).getTime())) errs.deadline = "Enter a valid date and time.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const input: TaskInput = {
      title: f.title.trim(), description: f.description.trim() || null, subject_id: f.subject_id || null,
      task_type: f.task_type as TaskInput["task_type"], priority: f.priority as TaskInput["priority"],
      status: f.status as TaskInput["status"], deadline: f.deadline ? new Date(f.deadline).toISOString() : null,
    };
    setSaving(true);
    try { await saveTask(input, initial?.id); toast(initial ? "Task updated." : "Task added."); onSaved(); }
    catch (err) { toast((err as Error).message, "error"); }
    finally { setSaving(false); }
  }

  const sel = (id: keyof typeof f, label: string, opts: readonly string[]) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <select id={id} className="input" value={f[id]} onChange={set(id)}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded border border-line bg-white p-5">
      <div>
        <label className="label" htmlFor="title">Task title</label>
        <input id="title" className="input" value={f.title} onChange={set("title")} aria-invalid={!!errors.title} aria-describedby="title-err" maxLength={150} />
        {errors.title && <p id="title-err" className="mt-1 text-sm text-red-700">{errors.title}</p>}
      </div>
      <div>
        <label className="label" htmlFor="description">Description <span className="font-normal text-muted">(optional)</span></label>
        <textarea id="description" rows={3} className="input" value={f.description} onChange={set("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="subject_id">Subject</label>
          <select id="subject_id" className="input" value={f.subject_id} onChange={set("subject_id")}>
            <option value="">No subject</option>
            {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {subjects?.length === 0 && <p className="mt-1 text-xs text-muted">Add subjects in <Link className="underline" href="/settings">Settings</Link>.</p>}
        </div>
        {sel("task_type", "Task type", TASK_TYPES)}
        <div>
          <label className="label" htmlFor="deadline">Deadline</label>
          <input id="deadline" type="datetime-local" className="input" value={f.deadline} onChange={set("deadline")} aria-invalid={!!errors.deadline} />
          {errors.deadline && <p className="mt-1 text-sm text-red-700">{errors.deadline}</p>}
        </div>
        {sel("priority", "Priority", PRIORITIES)}
        {sel("status", "Status", STATUSES)}
      </div>
      <div className="flex gap-2 pt-2">
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save changes" : "Add Task"}</button>
        <Link href="/tasks" className="btn">Cancel</Link>
      </div>
    </form>
  );
}
