import { getSupabase } from "@/lib/supabase";
import type { Status, Subject, Task, TaskInput } from "@/types";

// Raw database errors are logged, never shown to the user.
function fail(action: string, error: unknown): never {
  console.error(action, error);
  throw new Error(`Could not ${action}. Please try again.`);
}

const SELECT = "*, subjects(id, name, color)";

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await getSupabase().from("tasks").select(SELECT).order("deadline", { ascending: true, nullsFirst: false });
  if (error) fail("load tasks", error);
  return (data ?? []) as unknown as Task[];
}

export async function getTask(id: string): Promise<Task> {
  const { data, error } = await getSupabase().from("tasks").select(SELECT).eq("id", id).single();
  if (error || !data) fail("find this task", error);
  return data as unknown as Task;
}

export async function saveTask(input: TaskInput, id?: string): Promise<void> {
  const sb = getSupabase();
  if (id) {
    const { error } = await sb.from("tasks").update(input).eq("id", id);
    if (error) fail("save the task", error);
    return;
  }
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please log in again.");
  const { error } = await sb.from("tasks").insert({ ...input, user_id: user.id });
  if (error) fail("save the task", error);
}

export async function setStatus(id: string, status: Status): Promise<void> {
  const { error } = await getSupabase().from("tasks").update({ status }).eq("id", id);
  if (error) fail("update the task", error);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await getSupabase().from("tasks").delete().eq("id", id);
  if (error) fail("delete the task", error);
}

export async function listSubjects(): Promise<Subject[]> {
  const { data, error } = await getSupabase().from("subjects").select("*").order("name");
  if (error) fail("load subjects", error);
  return (data ?? []) as Subject[];
}

export async function addSubject(name: string, color: string): Promise<void> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please log in again.");
  const { error } = await sb.from("subjects").insert({ name, color, user_id: user.id });
  if (error) fail("add the subject", error);
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await getSupabase().from("subjects").delete().eq("id", id);
  if (error) fail("delete the subject", error);
}

export async function loadSampleData(): Promise<void> {
  const { error } = await getSupabase().rpc("seed_demo_data");
  if (error) fail("load sample data", error);
}
