from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Task, User
from schemas import TaskCreate, TaskUpdate, TaskResponse, NotificationResponse, UserCreate, Token, UserResponse
from notifications import creer_notification, get_notifications, marquer_lue, marquer_toutes_lues
from auth import hash_password, verify_password, create_token, get_current_user
from typing import List

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskFlow API",
    description="API REST avec auth, notifications et gestion de tâches",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://satisfied-communication-production-e9df.up.railway.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── AUTH ────────────────────────────────────────────

@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà pris")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    nouveau = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    token = create_token({"sub": str(nouveau.id)})
    return {"access_token": token, "token_type": "bearer", "user": nouveau}

@app.post("/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    token = create_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user

# ─── TASKS ───────────────────────────────────────────

@app.get("/tasks", response_model=List[TaskResponse])
def lister_taches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.user_id == current_user.id).all()

@app.post("/tasks", response_model=TaskResponse)
def creer_tache(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    nouvelle = Task(**task.model_dump(), user_id=current_user.id)
    db.add(nouvelle)
    db.commit()
    db.refresh(nouvelle)
    creer_notification(db, nouvelle.id, f"Tâche créée : {nouvelle.titre}")
    return nouvelle

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def modifier_tache(task_id: int, task: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tache = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not tache:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    for champ, valeur in task.model_dump(exclude_none=True).items():
        setattr(tache, champ, valeur)
    db.commit()
    db.refresh(tache)
    creer_notification(db, tache.id, f"Tâche modifiée : {tache.titre}")
    return tache

@app.delete("/tasks/{task_id}")
def supprimer_tache(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tache = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not tache:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    db.delete(tache)
    db.commit()
    return {"message": f"Tâche '{tache.titre}' supprimée"}

@app.patch("/tasks/{task_id}/terminer", response_model=TaskResponse)
def terminer_tache(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tache = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not tache:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    tache.terminee = True
    tache.statut = "terminée"
    db.commit()
    db.refresh(tache)
    creer_notification(db, tache.id, f"Tâche terminée : {tache.titre}")
    return tache

# ─── NOTIFICATIONS ───────────────────────────────────

@app.get("/notifications", response_model=List[NotificationResponse])
def lister_notifications(non_lues: bool = False, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_notifications(db, seulement_non_lues=non_lues)

@app.patch("/notifications/{notif_id}/lire", response_model=NotificationResponse)
def lire_notification(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return marquer_lue(db, notif_id)

@app.patch("/notifications/lire-toutes")
def lire_toutes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    marquer_toutes_lues(db)
    return {"message": "Toutes les notifications sont marquées comme lues"}