# Project Manager Pilot

Simple project board app. Create projects, get default columns (To Do / In Progress / Done), add tasks, move them between boards.

**FastAPI + Postgres + Next.js**

**Live demo:** [Open Project Manager](https://invenitur42.github.io/portfolio-live-demos/pm/)  
(All demos: [portfolio-live-demos](https://invenitur42.github.io/portfolio-live-demos/))

[Open in Codespaces](https://codespaces.new/Invenitur42/project-manager-Pilot)

---

## Features

- Auth (JWT)
- Projects with membership (owner is added automatically)
- Boards per project
- Tasks with priority; move or delete them
- Dashboard listing your projects

---

## Run (full stack)

```bash
git clone https://github.com/Invenitur42/project-manager-Pilot.git
cd project-manager-Pilot
docker compose up -d

cd backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000

cd ../frontend && npm install && npm run dev
```

UI: http://localhost:3000 · API: http://localhost:8000/docs

---

## Structure

`Project` → `Board` → `Task`. API checks membership before returning or changing project data.

Things I might add later: drag-and-drop, realtime updates, pagination on large boards.

---

## Deploy

Vercel for the frontend, Railway/Render for the API, managed Postgres for `DATABASE_URL`.
