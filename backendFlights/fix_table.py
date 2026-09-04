from flights import create_app
from models.flightsModel import db, Flights
from models.purchaseModel import TicketPurchase

app = create_app()
with app.app_context():
    TicketPurchase.__table__.drop(db.engine)
    Flights.__table__.drop(db.engine)
    db.create_all()