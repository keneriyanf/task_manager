from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import tasks

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)


@app.get("/")
def root():
    return {"message": "Task Manager API is running"}