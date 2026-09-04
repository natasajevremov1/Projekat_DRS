from app import app, db
from models.user import User
from werkzeug.security import generate_password_hash
from datetime import date

with app.app_context():
    admin = User(
        username="admin",
        password=generate_password_hash("tvoja_jaka_lozinka"),
        name="Admin",
        lastname="Admin",
        dateOfBirth=date(2000, 1, 1),
        gender="N/A",
        country="Srbija",
        street="N/A",
        streetNumber=1,
        accountBalance=0,
        role="ADMIN"
    )
    db.session.add(admin)
    db.session.commit()
    print("Admin kreiran.")