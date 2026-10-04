"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Shell, Loading, ErrorBox } from "@/components/Shell";
import { toast } from "@/components/Toaster";
import { useLoad } from "@/hooks/useLoad";
import { useUser } from "@/hooks/useUser";
import { addSubject, deleteSubject, listSubjects, loadSampleData } from "@/services/tasks";

const COLORS = ["#3b4a9e", "#2f7d6d", "#b45f06", "#a23b5a", "#5c636b"];

export default function Settings() {
  const user = useUser();
  const { data: subjects, error, loading, reload } = useLoad(listSubjects);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  async function run(fn: () => Promise<void>, ok: string) {
    try { await fn(); toast(ok); reload(); } catch (e) { toast((e as Error).message, "error"); }
  }
  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast("Enter a subject name.", "error");
    run(() => addSubject(name.trim(), color), "Subject added.").then(() => setName(""));
  }

  return (
    <Shell title="Settings">
      <section>
        <h2 className="mb-2 font-semibold">Profile</h2>
        <p className="text-sm">{user?.name} <span className="text-muted">({user?.email})</span></p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold">Subjects</h2>
        <form onSubmit={add} className="mb-3 flex flex-wrap items-end gap-2">
          <div><label htmlFor="sname" className="label">Subject name</label><input id="sname" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></div>
          <div><label htmlFor="scolor" className="label">Color</label>
            <select id="scolor" className="input w-auto" value={color} onChange={(e) => setColor(e.target.value)}>
              {COLORS.map((c, i) => <option key={c} value={c}>Color {i + 1}</option>)}
            </select></div>
          <span className="mb-2 h-4 w-4 rounded-full" style={{ background: color }} aria-hidden />
          <button className="btn btn-primary">Add subject</button>
        </form>
        <div className="rounded border border-line bg-white px-4">
          {loading ? <Loading /> : error ? <div className="py-4"><ErrorBox message={error} retry={reload} /></div>
            : subjects?.length ? (
              <ul>{subjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} aria-hidden />{s.name}</span>
                  <button className="btn btn-danger px-2" aria-label={`Delete subject ${s.name}`}
                    onClick={() => confirm(`Delete ${s.name}? Its tasks will be kept without a subject.`) && run(() => deleteSubject(s.id), "Subject deleted.")}><Trash2 size={14} /></button>
                </li>))}</ul>
            ) : <p className="py-4 text-sm text-muted">No subjects yet. Add one above, for example Data Structures or DBMS.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 font-semibold">Sample data</h2>
        <p className="mb-2 text-sm text-muted">Adds 4 subjects and 5 example tasks to your account so you can try the app.</p>
        <button className="btn" onClick={() => run(loadSampleData, "Sample data added.")}>Load sample data</button>
      </section>
    </Shell>
  );
}
