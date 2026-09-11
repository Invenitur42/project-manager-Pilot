# Project Manager Pilot

Full-stack **project management** app: projects, Kanban boards, tasks, priorities, and memberships.

[![Open in Codespaces](https://img.shields.io/badge/Open%20in-GitHub%20Codespaces-blue?logo=github)](https://codespaces.new/Invenitur42/project-manager-Pilot)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)](https://nextjs.org/)

> **Live demo:** _Add Vercel + API URLs after deploy_

---

## About this project

A classic product-shaped portfolio piece for **full-stack interviews**:

- Hierarchical data: **Project → Board → Task**
- Auth + **member-scoped access** (only members see a project)
- Working Next.js UI: dashboard, create projects, Kanban columns, move/delete tasks

**Why it matters for hiring:** Shows you can model real domain data and ship a usable UI, not only CRUD tutorials.

---

## Features

- JWT auth
- Create / list projects (owner becomes member)
- Default boards: To Do · In Progress · Done
- Tasks: title, priority, move between boards, delete
- Dockerized Postgres

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind |
| Backend | FastAPI, SQLAlchemy, JWT |
| DB | PostgreSQL |

---

## Run locally

```bash
git clone https://github.com/Invenitur42/project-manager-Pilot.git
cd project-manager-Pilot
docker compose up -d

cd backend && cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000

# new terminal
cd frontend && npm install && npm run dev
```

| Service | URL |
|---------|-----|
| UI | http://localhost:3000 |
| API docs | http://localhost:8000/docs |

**Or:** **Code → Codespaces** on GitHub.

---

## Interview talking points

1. **Data model** — why boards sit between projects and tasks.
2. **Authorization** — membership checks on every project/task mutation.
3. **Default boards on create** — product defaults that reduce empty states.
4. **Moving tasks** — status as board placement vs a separate enum.
5. **Next** — drag-and-drop, WebSockets for multi-user boards, pagination.

---

## Deploy

- Frontend → Vercel (`frontend/`)
- Backend → Railway/Render (`backend/`)
- Postgres → managed instance; set `DATABASE_URL`

---

## Screenshots

_Add: project list, Kanban board, task card._

---

Portfolio hub: [ai-tools-portfolio](https://github.com/Invenitur42/ai-tools-portfolio)
