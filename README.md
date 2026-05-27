# 🏥 HealthAxis — Enterprise Healthcare Operations Platform

A full-stack healthcare operations platform built to streamline hospital administration, emergency response, patient management, analytics, billing, and accommodation services through a scalable microservice-inspired architecture.

HealthAxis combines a modern React frontend with a secure Spring Boot backend to deliver real-time healthcare workflow management for hospitals, clinics, administrators, doctors, and patients.

---

# 🚀 Project Overview

HealthAxis is designed as an enterprise-grade healthcare management ecosystem that centralizes:

* Patient and doctor management
* Emergency queue handling
* Real-time hospital bed occupancy
* Appointment scheduling
* Billing and payment workflows
* Healthcare analytics dashboards
* Medical records management
* Accommodation and MediStay marketplace services
* Role-based authentication and authorization
* Real-time notifications using WebSockets

The platform focuses on scalability, modular architecture, responsive UI design, and real-time healthcare operations.

---

# ✨ Key Features

## 👨‍⚕️ Healthcare Management

* Doctor directory and hospital management
* Patient registration and records
* Appointment scheduling system
* Hospital branch administration
* Real-time emergency queue management

## 🛏 Bed & Occupancy Tracking

* Live bed allocation and discharge system
* Occupancy analytics and monitoring
* Hospital capacity tracking

## 💳 Billing & Payments

* Invoice generation and payment workflows
* Patient billing management
* Transaction tracking

## 📊 Analytics Dashboard

* Interactive KPI dashboards
* Healthcare occupancy analytics
* Administrative reporting
* Real-time data visualization with charts

## 🔐 Security & Authentication

* JWT-based authentication
* Role-based access control
* Secure API communication
* Protected routes and backend authorization

## ⚡ Real-Time Functionality

* STOMP WebSocket integration
* Live emergency queue updates
* Instant notifications
* Real-time occupancy monitoring

## 🏨 MediStay Accommodation Marketplace

* Accommodation discovery and management
* Patient stay support workflows

---

# 🧱 Tech Stack

## Frontend

| Technology      | Purpose                    |
| --------------- | -------------------------- |
| React 18        | UI development             |
| Vite            | Fast frontend tooling      |
| Tailwind CSS    | Utility-first styling      |
| Redux Toolkit   | Global state management    |
| Axios           | API communication          |
| Framer Motion   | Animations and transitions |
| Recharts        | Data visualization         |
| STOMP WebSocket | Real-time communication    |

## Backend

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| Java 17           | Backend programming language   |
| Spring Boot 3.2   | Backend framework              |
| Spring Security   | Authentication & authorization |
| JWT (HS512)       | Secure authentication          |
| PostgreSQL 16     | Primary database               |
| Redis 7           | Caching and real-time support  |
| Flyway            | Database migrations            |
| Lombok            | Boilerplate reduction          |
| MapStruct         | DTO mapping                    |
| WebSocket (STOMP) | Live event streaming           |

## DevOps & Infrastructure

| Tool           | Purpose                     |
| -------------- | --------------------------- |
| Docker         | Containerization            |
| Docker Compose | Multi-service orchestration |
| Nginx          | Frontend serving            |

---

# 🏗 System Architecture

```text
                ┌────────────────────┐
                │   React Frontend   │
                │  (Vite + Redux)    │
                └─────────┬──────────┘
                          │
                    REST APIs +
                    WebSockets
                          │
                ┌─────────▼──────────┐
                │ Spring Boot Backend│
                │ Authentication/API │
                └─────────┬──────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
 ┌───────▼───────┐ ┌──────▼───────┐ ┌─────▼─────┐
 │ PostgreSQL DB │ │ Redis Cache  │ │ WebSocket │
 └───────────────┘ └──────────────┘ └───────────┘
```

---

# 📂 Project Structure

```text
HealthAxis-Project/
│
├── healthaxis-frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   ├── Dockerfile
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── healthaxis-backend/
│   ├── src/main/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── pom.xml
│
└── README.md
```

---

# 📱 Application Modules

| Module         | Description                           |
| -------------- | ------------------------------------- |
| Authentication | Login, registration, JWT security     |
| Dashboard      | Role-specific analytics and overview  |
| Hospitals      | Hospital branch management            |
| Doctors        | Doctor directory and management       |
| Patients       | Patient registry and records          |
| Emergency      | Live emergency queue system           |
| Beds           | Bed allocation and occupancy tracking |
| Billing        | Invoice and payment workflows         |
| Appointments   | Appointment scheduling                |
| Analytics      | Charts, KPIs, and reporting           |
| Notifications  | Real-time alert system                |
| Accommodation  | MediStay marketplace                  |

---

# 🔌 API Modules

| Module         | Endpoints                               |
| -------------- | --------------------------------------- |
| Auth           | `/api/auth/login`, `/api/auth/register` |
| Hospitals      | `/api/hospitals`                        |
| Appointments   | `/api/appointments`                     |
| Emergency      | `/api/emergency/queue`                  |
| Beds           | `/api/beds/allocate`                    |
| Billing        | `/api/billing`                          |
| Analytics      | `/api/analytics/dashboard`              |
| Notifications  | `/api/notifications`                    |
| Accommodations | `/api/accommodations`                   |

---

# ⚡ Real-Time WebSocket Topics

| Topic                            | Purpose                      |
| -------------------------------- | ---------------------------- |
| `/topic/emergency/queue`         | Live emergency queue updates |
| `/topic/occupancy/hospital/{id}` | Bed occupancy tracking       |
| `/user/queue/notifications`      | User-specific notifications  |

---

# 🛠 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/kannan05-m/HealthAxis-Project.git
cd HealthAxis-Project
```

---

# 🖥 Frontend Setup

```bash
cd healthaxis-frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# ⚙️ Backend Setup

## Start Database & Redis

```bash
cd healthaxis-backend
docker-compose up db redis -d
```

## Run Spring Boot Server

```bash
mvn spring-boot:run
```

Backend API:

```text
http://localhost:8080/api
```

Swagger Documentation:

```text
http://localhost:8080/api/swagger-ui.html
```

---

# 🐳 Docker Deployment

## Full Application Deployment

```bash
docker-compose up --build
```

---

# 🔐 Demo Credentials

| Role    | Email                                                   | Password    |
| ------- | ------------------------------------------------------- | ----------- |
| Admin   | [admin@healthaxis.com](mailto:admin@healthaxis.com)     | Admin@123   |
| Doctor  | [doctor@healthaxis.com](mailto:doctor@healthaxis.com)   | Doctor@123  |
| Patient | [patient@healthaxis.com](mailto:patient@healthaxis.com) | Patient@123 |

---

# 📈 Highlights

* Enterprise-scale healthcare workflow architecture
* Full-stack implementation using React and Spring Boot
* Real-time emergency and occupancy monitoring
* Secure JWT authentication system
* WebSocket-powered live updates
* Modular and scalable project structure
* Dockerized deployment support
* Analytics dashboards with visual reporting
* Role-based healthcare management system

---

# 🧠 Engineering Concepts Demonstrated

This project demonstrates practical implementation of:

* RESTful API design
* Authentication & authorization
* Real-time communication systems
* State management using Redux Toolkit
* Scalable frontend architecture
* Backend modularization
* Database integration and caching
* WebSocket event streaming
* Containerized deployment workflows
* Enterprise healthcare domain modeling

---

# 🎯 Future Enhancements

* AI-assisted diagnosis support
* Video consultation integration
* E-prescription system
* Insurance claim workflows
* Mobile application support
* Multi-hospital distributed deployment
* Advanced audit logging
* Microservices migration
* CI/CD automation pipelines

---

# 👨‍💻 Author

## Kannan Mehra

Full Stack Developer focused on scalable enterprise applications, healthcare systems, and modern web technologies.

GitHub Repository:

[HealthAxis-Project Repository](https://github.com/kannan05-m/HealthAxis-Project?utm_source=chatgpt.com)

---

# 📜 License

This project is intended for educational, learning, and portfolio purposes.

---

# ⭐ Why This Project Stands Out

HealthAxis is more than a CRUD healthcare project — it demonstrates enterprise-grade software engineering concepts including real-time systems, secure authentication, analytics, scalable architecture, and modern DevOps workflows in a production-inspired healthcare environment.
