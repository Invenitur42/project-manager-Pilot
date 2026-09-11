# Project Management Dashboard

A full-stack **project management** application inspired by tools like Trello / Linear / Asana.

Built for mid-level full-stack developer interviews. Demonstrates real product features: multi-user projects, boards, tasks, statuses, assignments, and a clean dashboard UI.

---

## Features

- [x] User authentication (JWT)
- [x] Projects (create, list, update, archive)
- [x] Boards / columns (Kanban-style)
- [x] Tasks with title, description, status, priority, due date, assignee
- [x] Project membership (owner + members)
- [x] Dashboard overview (my projects, recent tasks)
- [x] Docker Compose (Postgres)
- [x] Next.js frontend structure
- [ ] Drag-and-drop board UI (optional enhancement)
- [ ] Real-time updates (WebSocket – optional)

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 15 + TypeScript + Tailwind  |
| Backend  | FastAPI + Python 3.11+              |
| Database | PostgreSQL + SQLAlchemy             |
| Auth     | JWT (python-jose + passlib)         |
| Infra    | Docker + docker-compose             |

---

## Architecture

```
User → Next.js Frontend
         ↓
      FastAPI Backend
         ├── Auth
         ├── Projects & Memberships
         ├── Boards / Columns
         └── Tasks
         ↓
      PostgreSQL
```

---

## API Overview

| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | `/api/v1/auth/register`          | Register                 |
| POST   | `/api/v1/auth/login`             | Login                    |
| GET    | `/api/v1/auth/me`                | Current user             |
| GET    | `/api/v1/projects/`              | List my projects         |
| POST   | `/api/v1/projects/`              | Create project           |
| GET    | `/api/v1/projects/{id}`          | Project detail + boards  |
| POST   | `/api/v1/projects/{id}/boards`   | Add board/column         |
| POST   | `/api/v1/tasks/`                 | Create task              |
| PATCH  | `/api/v1/tasks/{id}`             | Update task              |
| DELETE | `/api/v1/tasks/{id}`             | Delete task              |

---

## Getting Started

```bash
git clone https://github.com/Invenitur42/project-management-dashboard.git
cd project-management-dashboard
docker-compose up -d

# Backend
cd backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000

# Frontend
cd ../frontend
npm install && npm run dev
```

Open http://localhost:3000

---

## Interview Talking Points

- Data modeling for hierarchical resources (Project → Board → Task)
- Authorization: only project members can view/edit
- Soft status transitions vs hard deletes
- How you would add real-time collaboration later
- Pagination and filtering strategies for large task lists

---

Part of a full-stack portfolio focused on production-style applications.