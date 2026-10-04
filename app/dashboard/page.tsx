"use client";
import Link from "next/link";
import { Shell, Loading, ErrorBox } from "@/components/Shell";
import { EmptyTasks, TaskRow } from "@/components/TaskRow";
import { toast } from "@/components/Toaster";
import { useLoad } from "@/hooks/useLoad";
import { useUser } from "@/hooks/useUser";
import { greeting, isOverdue } from "@/lib/utils";
import { listTasks, setStatus } from "@/services/tasks";
import type { Task } from "@/types";

function weekRange() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return [start.getTime(), end.getTime()];
}

export default function Dashboard() {
  const user = useUser();
  const { data: tasks, error, loading, reload } = useLoad(listTasks);

  async function complete(t: Task) {
    try { await setStatus(t.id, "Completed"); toast("Task marked complete."); reload(); }
    catch (e) { toast((e as Error).message, "error"); }
  }

  let body: React.ReactNode;
  if (loading) body = <Loading />;
  else if (error) body = <ErrorBox message={error} retry={reload} />;
  else if (!tasks?.length) body = <EmptyTasks />;
  else {
    const open = tasks.filter((t) => t.status !== "Completed");
    const overdue = open.filter(isOverdue);
    const upcoming = open.filter((t) => t.deadline && !isOverdue(t)).slice(0, 5); // already sorted by deadline
    const recent = [...tasks].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 5);
    const [ws, we] = weekRange();
    const week = tasks.filter((t) => t.deadline && +new Date(t.deadline) >= ws && +new Date(t.deadline) < we);
    const weekDone = week.filter((t) => t.status === "Completed").length;
    const stats = [
      ["Pending", tasks.filter((t) => t.status === "Pending").length],
      ["In Progress", tasks.filter((t) => t.status === "In Progress").length],
      ["Completed", tasks.length - open.length],
      ["Overdue", overdue.length],
    ];
    const pct = week.length ? Math.round((weekDone / week.length) * 100) : 0;
    const section = (title: string, list: Task[], empty: string) => (
      <section className="mt-8">
        <h2 className="mb-1 font-semibold">{title}</h2>
        {list.length ? <ul>{list.map((t) => <TaskRow key={t.id} task={t} onComplete={complete} />)}</ul> : <p className="py-3 text-sm text-muted">{empty}</p>}
      </section>
    );
    body = (
      <>
        <dl className="grid grid-cols-2 gap-px border border-line bg-line text-sm sm:grid-cols-4">
          {stats.map(([l, n]) => (
            <div key={l} className="bg-white p-3"><dt className="text-muted">{l}</dt><dd className={`text-xl font-semibold ${l === "Overdue" && n ? "text-red-700" : ""}`}>{n}</dd></div>
          ))}
        </dl>
        {overdue.length > 0 && section("Overdue", overdue, "")}
        {section("Upcoming", upcoming, "Nothing due soon.")}
        <section className="mt-8">
          <h2 className="mb-2 font-semibold">Progress</h2>
          {week.length ? (
            <>
              <p className="text-sm">This week: {weekDone} of {week.length} tasks completed</p>
              <div className="mt-2 h-2 w-full max-w-sm bg-gray-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Weekly completion">
                <div className="h-2 bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </>
          ) : <p className="text-sm text-muted">No tasks are due this week.</p>}
        </section>
        {section("Recent Tasks", recent, "")}
        <p className="mt-6 text-sm"><Link href="/tasks" className="text-accent underline">See all tasks</Link></p>
      </>
    );
  }

  return (
    <Shell title="Dashboard">
      <h2 className="text-xl font-semibold">{greeting()}{user ? `, ${user.name}` : ""}</h2>
      <p className="mb-5 text-muted">Here’s what needs your attention.</p>
      {body}
    </Shell>
  );
}
