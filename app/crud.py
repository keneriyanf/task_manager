from typing import Optional
from sqlalchemy.orm import Session
from . import models, schemas
from .enums import TaskStatus, TaskPriority


def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    search: Optional[str] = None,
):
    query = db.query(models.Task)

    if status is not None:
        query = query.filter(models.Task.status == status)

    if priority is not None:
        query = query.filter(models.Task.priority == priority)

    if search is not None:
        like_pattern = f"%{search}%"
        query = query.filter(
            models.Task.title.ilike(
                like_pattern) | models.Task.description.ilike(like_pattern)
        )

    return query.offset(skip).limit(limit).all()


def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = get_task(db, task_id)
    if db_task is None:
        return None

    update_data = task.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if db_task is None:
        return None

    db.delete(db_task)
    db.commit()
    return db_task
