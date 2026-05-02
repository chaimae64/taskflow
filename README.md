# TaskFlow — API REST + Frontend React

Application complète de gestion de tâches avec authentification, notifications et timer Pomodoro.

## Stack technique

- **Backend** : Python, FastAPI, SQLAlchemy, SQLite
- **Frontend** : React (Vite), Lucide Icons
- **Auth** : JWT (python-jose, passlib)
- **Déploiement** : Docker, Railway

## Fonctionnalités

- Authentification (register / login / JWT)
- CRUD tâches avec priorité, catégorie, deadline
- Système de notifications automatiques
- Vue Liste, Vue Kanban (drag & drop)
- Statistiques et graphiques
- Timer Pomodoro intégré
- Mode sombre / clair
- Filtrage, recherche, tri

## Structure du projet

**Backend (todo-api/)**
- `main.py` — Endpoints FastAPI (routes, logique)
- `models.py` — Modèles de base de données (User, Task, Notification)
- `schemas.py` — Validation des données entrantes/sortantes (Pydantic)
- `database.py` — Connexion SQLite
- `auth.py` — Authentification JWT (login, register, token)
- `notifications.py` — Création et gestion des notifications
- `Dockerfile` — Conteneurisation de l'API
- `docker-compose.yml` — Orchestration des services

**Frontend (todo-api/frontend/src/)**
- `App.jsx` — Application principale (liste, kanban, stats, thème)
- `AuthPage.jsx` — Page de connexion et inscription
- `Pomodoro.jsx` — Timer Pomodoro interactif
- `Stats.jsx` — Tableau de bord statistiques
- `api.js` — Appels HTTP vers le backend

## Installation locale

### Backend
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /auth/register | Créer un compte |
| POST | /auth/login | Se connecter |
| GET | /tasks | Lister les tâches |
| POST | /tasks | Créer une tâche |
| PUT | /tasks/{id} | Modifier une tâche |
| DELETE | /tasks/{id} | Supprimer une tâche |
| PATCH | /tasks/{id}/terminer | Terminer une tâche |
| GET | /notifications | Lister les notifications |

## Auteur

Projet personnel réalisé pour monter en compétences en développement fullstack, déploiement cloud et architecture REST.