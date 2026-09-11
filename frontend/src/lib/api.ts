const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type User = { id: number; email: string; full_name: string | null };
export type Project = {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  is_archived: boolean;
  created_at: string;
};
export type Task = {
  id: number;
  board_id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  assignee_id: number | null;
  position: number;
};
export type Board = {
  id: number;
  name: string;
  position: number;
  tasks: Task[];
};
export type ProjectDetail = Project & { boards: Board[] };

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}
export function setToken(t: string) {
  localStorage.setItem("token", t);
}
export function clearToken() {
  localStorage.removeItem("token");
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (!(opts.body instanceof FormData) && opts.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function register(email: string, password: string, full_name?: string) {
  return req<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function getMe() {
  return req<User>("/auth/me");
}

export async function listProjects() {
  return req<Project[]>("/projects/");
}

export async function createProject(name: string, description?: string) {
  return req<Project>("/projects/", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function getProject(id: number) {
  return req<ProjectDetail>(`/projects/${id}`);
}

export async function createTask(data: {
  board_id: number;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
}) {
  return req<Task>("/tasks/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateTask(id: number, data: Partial<Task>) {
  return req<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteTask(id: number) {
  return req<void>(`/tasks/${id}`, { method: "DELETE" });
}
