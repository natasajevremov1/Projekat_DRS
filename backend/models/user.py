from flask_sqlalchemy import SQLAlchemy

db=SQLAlchemy()

class User(db.Model):
    __tablename__="users"
    id=db.Column(db.Integer,primary_key=True)
    username=db.Column(db.String(50),nullable=False,unique=True)
    password=db.Column(db.String(255),nullable=False)
    name=db.Column(db.String(50),nullable=False)
    lastname=db.Column(db.String(50),nullable=False)
    dateOfBirth=db.Column(db.Date,nullable=False)
    gender=db.Column(db.String(20),nullable=False)
    country=db.Column(db.String(20),nullable=False)
    street=db.Column(db.String(50),nullable=False)
    streetNumber=db.Column(db.Integer,nullable=False)
    accountBalance=db.Column(db.Numeric(10,2),default=0.00)
    role=db.Column(db.String(50),nullable=False,default="USER")  
    profile_image = db.Column(db.String(255), nullable=True)

    