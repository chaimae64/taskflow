from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ─── AUTH ───────────────────────────────────────────

class UserCreate(BaseModel):
    username : str
    email    : str
    password : str

class UserResponse(BaseModel):
    id       : int
    username : str
    email    : str
    cree_le  : datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token : str
    token_type   : str
    user         : UserResponse

# ─── TASK ───────────────────────────────────────────

class TaskCreate(BaseModel):
    titre       : str
    description : Optional[str] = ""
    priorite    : Optional[str] = "normale"
    categorie   : Optional[str] = "Général"
    deadline    : Optional[datetime] = None

class TaskUpdate(BaseModel):
    titre       : Optional[str] = None
    description : Optional[str] = None
    statut      : Optional[str] = None
    priorite    : Optional[str] = None
    categorie   : Optional[str] = None
    deadline    : Optional[datetime] = None

class TaskResponse(BaseModel):
    id          : int
    titre       : str
    description : str
    statut      : str
    priorite    : str
    categorie   : str
    deadline    : Optional[datetime] = None
    terminee    : bool
    cree_le     : datetime
    user_id     : Optional[int] = None

    class Config:
        from_attributes = True

# ─── NOTIFICATION ────────────────────────────────────

class NotificationResponse(BaseModel):
    id      : int
    message : str
    lue     : bool
    cree_le : datetime
    task_id : int

    class Config:
        from_attributes = True