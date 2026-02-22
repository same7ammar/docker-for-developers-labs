# Full-Stack Sample Application

A complete full-stack application with frontend (Nginx), backend (Node.js), and database (PostgreSQL).

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Database   │
│   (Nginx)   │     │  (Node.js)  │     │ (PostgreSQL)│
│   Port 80   │     │  Port 3001  │     │  Port 5432  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Quick Start

```bash
# Start all services
docker compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:3001

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 80 | Nginx serving static files |
| backend | 3001 | Node.js REST API |
| db | 5432 | PostgreSQL database |

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/items` - List all items
- `POST /api/items` - Create new item

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | API port |
| `DATABASE_URL` | - | PostgreSQL connection string |

### Database
| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | app | Database user |
| `POSTGRES_PASSWORD` | secret | Database password |
| `POSTGRES_DB` | myapp | Database name |
