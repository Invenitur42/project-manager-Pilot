from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project, ProjectMember, Board, Task

router = APIRouter(tags=["projects"])


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None


class ProjectOut(BaseModel):
    id: int
    name: str
    description: str | None
    owner_id: int
    is_archived: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BoardOut(BaseModel):
    id: int
    name: str
    position: int

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    board_id: int
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    priority: str = "medium"
    due_date: date | None = None
    assignee_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    status: str | None = None
    due_date: date | None = None
    assignee_id: int | None = None
    board_id: int | None = None
    position: int | None = None


class TaskOut(BaseModel):
    id: int
    board_id: int
    title: str
    description: str | None
    priority: str
    status: str
    due_date: date | None
    assignee_id: int | None
    position: int
    created_at: datetime

    class Config:
        from_attributes = True


def _user_can_access_project(db: Session, user_id: int, project_id: int) -> Project | None:
    return (
        db.query(Project)
        .join(ProjectMember)
        .filter(Project.id == project_id, ProjectMember.user_id == user_id)
        .first()
    )


@router.get("/projects/", response_model=list[ProjectOut])
def list_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .join(ProjectMember)
        .filter(ProjectMember.user_id == current_user.id, Project.is_archived == False)
        .order_by(Project.created_at.desc())
        .all()
    )


@router.post("/projects/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = Project(name=body.name, description=body.description, owner_id=current_user.id)
    db.add(project)
    db.flush()

    # Owner membership
    db.add(ProjectMember(project_id=project.id, user_id=current_user.id, role="owner"))

    # Default boards
    for i, name in enumerate(["To Do", "In Progress", "Done"]):
        db.add(Board(project_id=project.id, name=name, position=i))

    db.commit()
    db.refresh(project)
    return project


@router.get("/projects/{project_id}")
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .options(joinedload(Project.boards).joinedload(Board.tasks))
        .filter(Project.id == project_id)
        .first()
    )
    if not project or not _user_can_access_project(db, current_user.id, project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "owner_id": project.owner_id,
        "boards": [
            {
                "id": b.id,
                "name": b.name,
                "position": b.position,
                "tasks": [
                    {
                        "id": t.id,
                        "title": t.title,
                        "description": t.description,
                        "priority": t.priority,
                        "status": t.status,
                        "due_date": t.due_date,
                        "assignee_id": t.assignee_id,
                        "position": t.position,
                    }
                    for t in b.tasks
                ],
            }
            for b in project.boards
        ],
    }


@router.post("/tasks/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    body: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.get(Board, body.board_id)
    if not board or not _user_can_access_project(db, current_user.id, board.project_id):
        raise HTTPException(status_code=404, detail="Board not found")

    task = Task(
        board_id=body.board_id,
        title=body.title,
        description=body.description,
        priority=body.priority,
        due_date=body.due_date,
        assignee_id=body.assignee_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    body: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    board = db.get(Board, task.board_id)
    if not board or not _user_can_access_project(db, current_user.id, board.project_id):
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    board = db.get(Board, task.board_id)
    if not board or not _user_can_access_project(db, current_user.id, board.project_id):
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
