from datetime import datetime, timezone, date
from sqlalchemy import String, DateTime, ForeignKey, Integer, Text, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    boards = relationship("Board", back_populates="project", cascade="all, delete-orphan", order_by="Board.position")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), default="member")  # owner | member

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="memberships")


class Board(Base):
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)  # e.g. To Do, In Progress, Done
    position: Mapped[int] = mapped_column(Integer, default=0)

    project = relationship("Project", back_populates="boards")
    tasks = relationship("Task", back_populates="board", cascade="all, delete-orphan", order_by="Task.position")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    board_id: Mapped[int] = mapped_column(ForeignKey("boards.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low | medium | high
    status: Mapped[str] = mapped_column(String(50), default="todo")
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    assignee_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    board = relationship("Board", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")
