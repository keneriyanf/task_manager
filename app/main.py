from fastapi import FastAPI

from . import models
from .database import engine
from .routers import tasks

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

app.include_router(tasks.router)


@app.get("/")
def root():
    return {"message": "Task Manager API is running"}
