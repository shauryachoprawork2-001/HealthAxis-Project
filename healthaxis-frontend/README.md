# HealthAxis Frontend

Enterprise Healthcare Operations Platform — React + Vite Frontend

## Stack
React 18, Vite, Tailwind CSS, Redux Toolkit, Framer Motion, Recharts, Axios, STOMP WebSocket

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Visit: http://localhost:5173

## Demo Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@healthaxis.com | Admin@123 |
| Doctor | doctor@healthaxis.com | Doctor@123 |
| Patient | patient@healthaxis.com | Patient@123 |

## Pages
| Route | Access | Description |
|---|---|---|
| /dashboard | All | Role-specific dashboard |
| /hospitals | Admin+ | Hospital branch management |
| /doctors | Admin, Receptionist | Doctor directory |
| /patients | Clinical staff | Patient registry |
| /emergency | Clinical staff | Live emergency queue |
| /beds | Admin, Nurse | Real-time bed occupancy |
| /appointments | All | Appointment management |
| /billing | Admin, Patient | Invoice & payments |
| /accommodation | All | MediStay marketplace |
| /analytics | Admin | Charts & KPIs |
| /records | Patient, Doctor | Health records |

## Architecture
```
src/
├── api/           # Axios instance + per-module API clients
├── components/    # ui/ (StatCard, Badge, Spinner) + layout/ (Sidebar, Header)
├── hooks/         # useAuth, useTheme
├── layouts/       # AppLayout (sidebar + header wrapper)
├── pages/         # admin/, doctor/, patient/, emergency/, billing/, accommodation/, auth/
├── redux/         # store + slices (auth, ui, emergency, notifications, occupancy, appointments)
├── services/      # WebSocket STOMP service
└── utils/         # constants (PRIORITY_CONFIG, STATUS_CONFIG…)
```
