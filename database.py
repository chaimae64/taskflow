from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite : fichier local, pas besoin d'installer quoi que ce soit
DATABASE_URL = "sqlite:///./todo.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # nécessaire pour SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fonction utilitaire pour obtenir une session BDD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()