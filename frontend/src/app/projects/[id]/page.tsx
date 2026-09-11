"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getProject,
  createTask,
  updateTask,
  deleteTask,
  getMe,
  type ProjectDetail,
  type Task,
} from "@/lib/api";

const priorityColor: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [activeBoard, setActiveBoard] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      await getMe();
      const data = await getProject(Number(id));
      setProject(data);
      if (data.boards.length && activeBoard === null) {
        setActiveBoard(data.boards[0].id);
      }
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onAddTask(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !activeBoard) return;
    setError("");
    try {
      await createTask({ board_id: activeBoard, title: newTitle.trim() });
      setNewTitle("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  }

  async function moveTask(task: Task, boardId: number) {
    try {
      await updateTask(task.id, { board_id: boardId });
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to move task");
    }
  }

  async function removeTask(taskId: number) {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading || !project) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">
            ← Projects
          </Link>
          <h1 className="text-lg font-bold">{project.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form onSubmit={onAddTask} className="mb-6 flex flex-wrap gap-2">
          <select
            value={activeBoard ?? ""}
            onChange={(e) => setActiveBoard(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {project.boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task title"
            className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Add task
          </button>
        </form>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {project.boards.map((board) => (
            <div
              key={board.id}
              className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-100/80 p-3"
            >
              <h2 className="mb-3 px-1 text-sm font-semibold text-slate-700">
                {board.name}{" "}
                <span className="font-normal text-slate-400">({board.tasks.length})</span>
              </h2>
              <div className="space-y-2">
                {board.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="text-xs text-slate-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          priorityColor[task.priority] || priorityColor.medium
                        }`}
                      >
                        {task.priority}
                      </span>
                      <select
                        value={board.id}
                        onChange={(e) => moveTask(task, Number(e.target.value))}
                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600"
                      >
                        {project.boards.map((b) => (
                          <option key={b.id} value={b.id}>
                            Move to {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {board.tasks.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-slate-400">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
