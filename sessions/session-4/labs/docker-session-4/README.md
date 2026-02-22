# Access the application

# Frontend: http://localhost

# Backend API: http://localhost:3001

Service Port Description
frontend 80 Nginx serving static files
backend 3001 Node.js REST API
db 5432 PostgreSQL database

## Services

| Service  | Port | Description                |
| -------- | ---- | -------------------------- |
| frontend | 80   | Nginx serving static files |
| backend  | 3001 | Node.js REST API           |
| db       | 5432 | PostgreSQL database        |

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/items` - List all items
- `POST /api/items` - Create new item

## Environment Variables

### Backend

| Variable       | Default | Description                  |
| -------------- | ------- | ---------------------------- |
| `PORT`         | 3001    | API port                     |
| `DATABASE_URL` | -       | PostgreSQL connection string |

### Database

| Variable            | Default | Description       |
| ------------------- | ------- | ----------------- |
| `POSTGRES_USER`     | app     | Database user     |
| `POSTGRES_PASSWORD` | secret  | Database password |
| `POSTGRES_DB`       | myapp   | Database name     |
