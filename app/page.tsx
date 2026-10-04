import Link from "next/link";

// Static, illustrative preview of the dashboard (not live data).
const PREVIEW = [
  { t: "DBMS ER Diagram", s: "DBMS", k: "Assignment", d: "Due tomorrow", p: "High" },
  { t: "Complete Linked List Assignment", s: "Data Structures", k: "Assignment", d: "Due in 3 days", p: "Medium" },
  { t: "React Mini Project", s: "Web Development", k: "Project", d: "Due in 6 days", p: "High" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <span className="font-semibold">TaskNest</span>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn">Login</Link>
          <Link href="/signup" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4">
        <section className="py-12 sm:py-16">
          <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">Keep every academic deadline in one place.</h1>
          <p className="mt-4 max-w-lg text-muted">
            Assignments, projects, practical files and tests usually get scattered across WhatsApp groups and classroom notices.
            Add them here once, set a deadline, and see what needs attention first.
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/signup" className="btn btn-primary">Get Started</Link>
            <a href="#preview" className="btn">View Demo</a>
          </div>
        </section>
        <section id="preview" aria-label="Dashboard preview" className="pb-16">
          <div className="rounded border border-line bg-white p-5">
            <p className="font-semibold">Good morning, Riya</p>
            <p className="text-sm text-muted">Here’s what needs your attention.</p>
            <dl className="my-4 grid grid-cols-2 gap-px border border-line bg-line text-sm sm:grid-cols-4">
              {[["Pending", 3], ["In Progress", 2], ["Completed", 4], ["Overdue", 1]].map(([l, n]) => (
                <div key={l} className="bg-white p-3"><dt className="text-muted">{l}</dt><dd className="text-xl font-semibold">{n}</dd></div>
              ))}
            </dl>
            <ul>
              {PREVIEW.map((r) => (
                <li key={r.t} className="flex flex-col gap-1 border-t border-line py-3 sm:flex-row sm:justify-between">
                  <div><p className="font-medium">{r.t}</p><p className="text-sm text-muted">{r.s} · {r.k} · {r.d}</p></div>
                  <span className="text-xs font-medium">{r.p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
