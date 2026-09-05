This project is a web application that simulates a flight booking and management system with real-time features and multiple user roles.

# Features

  User registration and login (JWT authentication)
  Role-based access (User, Manager, Admin)
  Flight creation, approval, and cancellation
  Flight search and booking
  Asynchronous ticket processing
  Real-time updates using WebSockets
  Flight rating system
  PDF report generation

# Architecture
 
  Frontend: React (JavaScript)  
  Backend: Python Flask

  Two PostgreSQL databases (users & flights)
  REST API + WebSocket communication

# User Capabilities
 
  Browse and search flights
  Book tickets
  View purchased flights
  Rate completed flights

# Technologies

  Python (Flask)
  React (JavaScript)
  PostgreSQL
  JWT Authentication
  WebSockets

# How to Run the Project

 ## Backend setup (Flask)
  cd backend
  python -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  python app.py

 ## Flight Service
  cd backendFlights
  python -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  python flights.py

 ## Frontend (React)
  cd frontend
  cd vite-project
  npm install
  npm start

## Live Demo

🔗 [https://project-drs.vercel.app](https://project-drs.vercel.app)

Note: the backend services are hosted on Render's free tier, so the first request after a period of inactivity may take 30–60 seconds to wake up.

Email notifications (role changes, flight cancellations) are sent via Resend on a free, unverified account, which only allows delivery to the developer's own email address. Emails won't be received by other test accounts.

**Test accounts:**
- Admin: `admin` / `tvoja_jaka_lozinka`
- User: `natasajevremov1@gmail.com` / `123`
# Purpose
 This project was developed to practice building a distributed system with real-time communication and modern web technologies.
 
## Screenshotovi

### Login forma
![Login](screenshots/Login.png)

### Registration
![Registration](screenshots/Registration.png)

### Dashboard (Admin/Manager)
![Dashboard](screenshots/Dashboard.png)

### Rating
![Rating](screenshots/Rating.png)

Natasa Jevremov
