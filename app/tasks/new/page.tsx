"use client";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { TaskForm } from "@/components/TaskForm";

export default function NewTask() {
  const router = useRouter();
  return (
    <Shell title="Add Task">
      <TaskForm onSaved={() => { router.push("/tasks"); router.refresh(); }} />
    </Shell>
  );
}
