from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String, unique=True, nullable=False)
    email      = Column(String, unique=True, nullable=False)
    password   = Column(String, nullable=False)
    cree_le    = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tasks = relationship("Task", back_populates="owner", cascade="all, delete")


class Task(Base):
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    titre       = Column(String, nullable=False)
    description = Column(String, default="")
    statut      = Column(String, default="en attente")
    priorite    = Column(String, default="normale")
    categorie   = Column(String, default="Général")
    deadline    = Column(DateTime, nullable=True)
    terminee    = Column(Boolean, default=False)
    cree_le     = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id     = Column(Integer, ForeignKey("users.id"))

    owner         = relationship("User", back_populates="tasks")
    notifications = relationship("Notification", back_populates="task", cascade="all, delete")


class Notification(Base):
    __tablename__ = "notifications"

    id        = Column(Integer, primary_key=True, index=True)
    message   = Column(String, nullable=False)
    lue       = Column(Boolean, default=False)
    cree_le   = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    task_id   = Column(Integer, ForeignKey("tasks.id"))

    task = relationship("Task", back_populates="notifications")