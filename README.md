Task Manager API

A simple task management REST API built with FastAPI, SQLAlchemy, and SQLite. This started as a project to move from basic Python (variables, functions, classes) into a real backend framework.

What it does:

Create, read, update, and delete tasks through a REST API. Each task has a title, an optional description, a completed flag, and timestamps for when it was created and last updated.

Tech stack
FastAPI — the web framework
SQLAlchemy — ORM, handles talking to the database
Pydantic — request/response validation
SQLite — the database (a single file, tasks.db, no separate server needed)
Uvicorn — the ASGI server that actually runs the app

Project structure
task_manager/
├── app/
│ ├── **init**.py
│ ├── main.py # entry point — creates the app, wires everything together
│ ├── database.py # DB connection, session factory, Base class
│ ├── models.py # SQLAlchemy table definitions (the Task table)
│ ├── schemas.py # Pydantic request/response shapes
│ ├── crud.py # the actual DB queries (create/read/update/delete)
│ └── routers/
│ ├── **init**.py
│ └── tasks.py # HTTP endpoints, calls into crud.py
├── .venv/ # virtual environment (not committed)
├── requirements.txt
├── .gitignore
└── README.md

Each file has exactly one job. Request flow looks like this:

Client → routers/tasks.py → crud.py → models.py → database.py → tasks.db

Setup

Clone the repo and set up a virtual environment:

bash
git clone https://github.com/keneriyanf/task_manager.git
cd task_manager
python -m venv .venv
.venv\Scripts\activate # Windows

# source .venv/bin/activate # Mac/Linux

pip install -r requirements.txt
Running it
bash
uvicorn app.main:app --reload

Then go to http://127.0.0.1:8000/docs — that's FastAPI's auto-generated Swagger UI, and it lets you test every endpoint straight from the browser without writing a single curl command.

The tasks table gets created automatically the first time you run the app, so there's no separate migration step to run.

API endpoints
Method Path Description
POST /tasks/ Create a new task
GET /tasks/ List tasks (supports skip/limit pagination)
GET /tasks/{task_id} Get one task by ID
PUT /tasks/{task_id} Update a task (partial updates supported)
DELETE /tasks/{task_id} Delete a task
Example: creating a task
bash
curl -X POST http://127.0.0.1:8000/tasks/ \
 -H "Content-Type: application/json" \
 -d '{"title": "Buy milk", "description": "2%"}'
Example: partial update

You only need to send the fields you're actually changing:

bash
curl -X PUT http://127.0.0.1:8000/tasks/1 \
 -H "Content-Type: application/json" \
 -d '{"completed": true}'

Sending only completed won't touch title or description — this is handled with exclude_unset=True in crud.py, so unset fields never get overwritten with None.

A bug I hit (and how I found it)

DELETE /tasks/{task_id} was returning a 404 for tasks that definitely existed — I'd just GETted them seconds before. Instead of guessing, I isolated the problem: confirmed GET /tasks/{id} worked fine on its own, which meant the issue had to be specific to the delete path, not the underlying query logic both functions share.

Turned out delete_task in crud.py was missing its last two lines:

python

# before (broken)

def delete_task(db: Session, task_id: int):
db_task = get_task(db, task_id)
if db_task is None:
return None
db.delete(db_task) # falls off the end here — implicitly returns None

Without an explicit return, the function returned None by default — even after successfully finding and staging the task for deletion. The router saw None and (correctly, given what it was told) raised a 404. It was also missing db.commit(), so even a fixed return value wouldn't have actually persisted the delete.

python

# after (fixed)

def delete_task(db: Session, task_id: int):
db_task = get_task(db, task_id)
if db_task is None:
return None
db.delete(db_task)
db.commit()
return db_task

Lesson: a function silently returning None is one of the easiest bugs to miss, because nothing crashes and you won't notice it until you test it

Other things I ran into
Models vs. schemas mixing up — easy to conflate at first. Rule of thumb that stuck: models.py talks to the database (disk), schemas.py talks to whoever's calling the API (wire). Neither one touches the other's job.
.venv not active — pip installing without the venv active installs system-wide, which then causes confusing ImportErrors once the venv actually gets activated later. Always check for the (.venv) prefix in the terminal prompt before installing anything.
Line ending churn between machines — working across Windows and other setups caused noisy diffs from CRLF vs LF. Worth setting up a .gitattributes early to avoid this.
Unexpected fields getting silently dropped — by default, Pydantic ignores extra fields a client sends that aren't part of the schema (extra="ignore"), rather than rejecting them. This is actually the point of keeping TaskCreate narrow — a client can't sneak in their own id or completed value even if they try, since those fields simply don't exist on that schema.

Notes to self
No auth on this yet — anyone who can reach the API can do anything. Fine for local dev, but not fine for anything public.
.venv/ and tasks.db are both gitignored — don't expect them to show up after a fresh clone, they need to be regenerated locally.
If cloning onto a new machine, remember the venv has to be rebuilt from requirements.txt every time — it never comes from GitHub.
