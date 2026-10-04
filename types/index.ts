export const TASK_TYPES = ["Assignment", "Project", "Practical", "Presentation", "Test", "Other"] as const;
export const PRIORITIES = ["Low", "Medium", "High"] as const;
export const STATUSES = ["Pending", "In Progress", "Completed"] as const;

export type TaskType = (typeof TASK_TYPES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Subject { id: string; user_id: string; name: string; color: string; created_at: string }

export interface Task {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  priority: Priority;
  status: Status;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  subjects: Pick<Subject, "id" | "name" | "color"> | null;
}

export type TaskInput = Pick<Task, "title" | "description" | "subject_id" | "task_type" | "priority" | "status" | "deadline">;
