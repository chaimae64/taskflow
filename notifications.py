from sqlalchemy.orm import Session
from models import Notification

def creer_notification(db: Session, task_id: int, message: str):
    """Crée une notification liée à une tâche"""
    notification = Notification(
        message = message,
        task_id = task_id
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

def get_notifications(db: Session, seulement_non_lues: bool = False):
    """Récupère toutes les notifications (ou seulement les non lues)"""
    query = db.query(Notification)
    if seulement_non_lues:
        query = query.filter(Notification.lue == False)
    return query.order_by(Notification.cree_le.desc()).all()

def marquer_lue(db: Session, notification_id: int):
    """Marque une notification comme lue"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()
    if notification:
        notification.lue = True
        db.commit()
        db.refresh(notification)
    return notification

def marquer_toutes_lues(db: Session):
    """Marque toutes les notifications comme lues"""
    db.query(Notification).filter(
        Notification.lue == False
    ).update({"lue": True})
    db.commit()