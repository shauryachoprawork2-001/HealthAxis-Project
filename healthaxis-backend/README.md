# HealthAxis Backend

Enterprise Healthcare Operations Platform — Spring Boot Backend

## Stack
- Java 17, Spring Boot 3.2
- PostgreSQL 16, Redis 7
- JWT (HS512), Spring Security, WebSocket (STOMP)
- Flyway migrations, Lombok, MapStruct

## Quick Start

```bash
# Start infrastructure
docker-compose up db redis -d

# Run locally
mvn spring-boot:run

# Full Docker
docker-compose up --build
```

## API Base URL
`http://localhost:8080/api`

## Swagger UI
`http://localhost:8080/api/swagger-ui.html`

## Default Admin
- Email: admin@healthaxis.com
- Password: Admin@123

## Key Modules
| Module | Endpoints |
|---|---|
| Auth | /api/auth/register, /api/auth/login, /api/auth/refresh |
| Hospitals | /api/hospitals |
| Appointments | /api/appointments |
| Emergency | /api/emergency/queue |
| Beds | /api/beds/allocate, /api/beds/discharge/{id} |
| Billing | /api/billing/patient/{id}, /api/billing/{id}/pay |
| Analytics | /api/analytics/dashboard, /api/analytics/occupancy/{id} |
| Notifications | /api/notifications |
| Accommodations | /api/accommodations |

## WebSocket Topics
- `/topic/emergency/queue` — live emergency queue
- `/topic/occupancy/hospital/{id}` — bed occupancy updates
- `/user/queue/notifications` — per-user notifications
