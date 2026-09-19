# Task Manager

A full-stack task management application built with **FastAPI** (backend) and **React + TypeScript** (frontend). Originally scoped as three progressive internship tasks — choosing a backend stack, building a CRUD API, then extending it with a real frontend — this repository now contains the complete, working product.

The frontend is built around a custom interface concept, **"The Timeline"**: tasks are displayed as cards branching off a vertical spine, with priority represented as a soft ambient glow rather than a flat badge, deliberately avoiding a generic dashboard or grid layout.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Setup and installation](#setup-and-installation)
- [Running the app](#running-the-app)
- [API endpoints](#api-endpoints)
- [Design decisions](#design-decisions)
- [Notable bugs and how they were found](#notable-bugs-and-how-they-were-found)
- [Not implemented](#not-implemented)

---

## Tech stack

**Backend**
- **FastAPI** — the web framework, chosen for its Python type-hint-driven validation and automatic interactive documentation.
- **SQLAlchemy** — ORM layer between Python and the database.
- **Pydantic** — request and response validation.
- **SQLite** — the database, stored as a single file (`tasks.db`).
- **Uvicorn** — the ASGI server running the application.

**Frontend**
- **React** with **TypeScript** — component-based UI, statically typed.
- **Vite** — build tool and development server.
- **Tailwind CSS v4** — utility-first styling, with a custom design-token theme (colors, typography) defined via Tailwind's `@theme` directive.

---

## Project structure

```
task_manager/
├── app/                        # backend
│   ├── main.py                 # entry point — creates the app, CORS, table creation, router registration
│   ├── database.py             # DB connection, session factory, Base class
│   ├── models.py                # SQLAlchemy table definition
│   ├── schemas.py               # Pydantic request/response shapes
│   ├── crud.py                  # database query functions
│   ├── enums.py                 # shared TaskStatus / TaskPriority definitions
│   └── routers/
│       └── tasks.py             # HTTP endpoints
├── frontend/                    # frontend
│   └── src/
│       ├── main.tsx              # entry point, mounts App
│       ├── App.tsx               # root component, shared state, wiring
│       ├── index.css             # Tailwind + custom theme tokens
│       ├── types/task.ts         # TypeScript types mirroring backend schemas
│       ├── api/tasks.ts          # typed fetch wrapper for all CRUD calls
│       ├── hooks/useTasks.ts     # data-fetching hook (loading/error/refetch)
│       └── components/
│           ├── TaskCard.tsx      # a single task card
│           ├── FilterBar.tsx     # floating search/filter pill bar
│           ├── Timeline.tsx      # the spine, today marker, and card list
│           └── TaskFormModal.tsx # create / edit / delete form
├── requirements.txt
├── .gitignore
├── .gitattributes
└── README.md
```

Each backend file has exactly one job. A request flows: `Client → routers/tasks.py → crud.py → models.py → database.py → tasks.db`. On the frontend, a user action in `App.tsx` triggers a request through `useTasks.ts`/`api/tasks.ts`, and the response flows back down through `Timeline.tsx` into each `TaskCard.tsx`.

---

## Setup and installation

### Backend

```bash
git clone https://github.com/keneriyanf/task_manager.git
cd task_manager

python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

---

## Running the app

Both servers need to run **at the same time**, in two separate terminals.

**Terminal 1 — backend:**
```bash
uvicorn app.main:app --reload
```
Runs at `http://127.0.0.1:8000`. Interactive API documentation (Swagger UI) is available at `http://127.0.0.1:8000/docs`.

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```
Runs at `http://localhost:5173`.

The backend's `tasks.db` file is created automatically on first run — no separate migration step is needed. CORS is configured to allow requests specifically from `http://localhost:5173`.

---

## API endpoints

| Method | Path                  | Description                                              |
|--------|-----------------------|------------------------------------------------------------|
| POST   | `/tasks/`              | Create a new task                                          |
| GET    | `/tasks/`               | List tasks — supports `skip`/`limit` pagination, plus optional `status`, `priority`, and `search` query parameters |
| GET    | `/tasks/{task_id}`      | Get one task by ID                                          |
| PUT    | `/tasks/{task_id}`      | Update a task (partial updates supported — only send the fields you're changing) |
| DELETE | `/tasks/{task_id}`      | Delete a task                                               |

A task has the following fields: `id`, `title` (required), `description` (optional), `status` (`pending` / `in_progress` / `completed`, defaults to `pending`), `priority` (`low` / `medium` / `high`, defaults to `medium`), `due_date` (optional, `YYYY-MM-DD`), `created_at`, and `updated_at`.

**Example — creating a task:**
```bash
curl -X POST http://127.0.0.1:8000/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "priority": "high"}'
```

**Example — filtering:**
```
GET /tasks/?status=completed
GET /tasks/?priority=high
GET /tasks/?search=milk
```

**Example — partial update:**
```bash
curl -X PUT http://127.0.0.1:8000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```
Sending only `status` leaves every other field untouched, handled via `exclude_unset=True` in `crud.py`.

---

## Design decisions

The frontend deliberately avoids a generic dashboard or grid layout, in line with the internship task's explicit request for a creative, non-templated UI. The interface — "The Timeline" — is built around:

- **A vertical spine** running down the left side of the page, with task cards branching off it, evoking a chronological flow rather than a static list.
- **A priority-driven glow** on each card's edge — a soft `box-shadow`, not a flat colored badge — using a graduated "urgency temperature" palette (coral for high, ochre for medium, pine green for low) rather than a conventional traffic-light scheme.
- **A separate status indicator**, a small colored dot distinct from the priority glow, so priority and status remain visually independent, matching how they're independent fields on the task itself.
- **A sticky "today" marker**, pinned to the spine as the page scrolls, orienting the viewer relative to due dates.
- **A floating, pill-shaped filter bar**, in place of a sidebar or a conventional top navigation row.

Typography pairs a geometric sans-serif (Space Grotesk) for headings and titles with a monospaced typeface (JetBrains Mono) for all metadata and timestamps, reinforcing the sense of a precise, chronological log.

---

## Notable bugs and how they were found

**`delete_task` returning false 404s (Task 02).** `DELETE /tasks/{task_id}` returned a 404 for tasks that definitely existed. Isolating the problem — confirming `GET /tasks/{id}` worked fine on its own — narrowed it to the delete path specifically. The function was missing an explicit `return` statement and a `db.commit()` call; without them, it silently returned `None` by default even after successfully finding and staging the task for deletion, which the router correctly (given what it was told) interpreted as "not found."

**Delete appearing to freeze the interface (Task 03).** After building the frontend's delete flow, deleting a task removed it from the database correctly but left the interface appearing to hang, only resolving on a manual refresh. This had two separate causes: first, SQLAlchemy's default session behavior expired the deleted object's data immediately after commit, so the API's attempt to serialize a response failed; second, once that was fixed, the delete route itself was found to have the same class of bug as the Task 02 issue above — no explicit `return` on the success path, falling through to an implicit `None` that failed FastAPI's response-model validation. Both were fixed, and visible error feedback was added to every write action in the UI (create, edit, delete) so a failure would be immediately obvious rather than silent, going forward.

A complete, file-by-file account of every bug, gotcha, and process decision made during development is kept separately in the project's internal documentation.

---

## Not implemented

- **Authentication** — explicitly out of scope for this task (deferred per the internship brief). No login, no per-user task ownership; anyone who can reach the API can access every task.
- **Database migrations** — schema changes during development were applied by deleting and recreating the local `tasks.db` file rather than through a migration tool such as Alembic, appropriate for a single-developer local project but not for a production deployment with real data to preserve.
