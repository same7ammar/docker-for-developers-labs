# Session 2: Storage, Networking & Docker Compose

## 🎯 Session Objectives
- Master Docker volumes and data persistence
- Understand Docker networking concepts
- Use Docker Compose for multi-container applications

## ⏱️ Duration
2 hours

## 📋 Prerequisites
- Completed Session 1
- Docker and Docker Compose installed

---

## 📚 Topics Covered

1. [Docker Volumes](#docker-volumes)
2. [Bind Mounts](#bind-mounts)
3. [Docker Networking](#docker-networking)
4. [Docker Compose Basics](#docker-compose-basics)
5. [Multi-Service Applications](#multi-service-applications)
6. [Hands-on Exercises](#hands-on-exercises)

---

## Docker Volumes

### Why Volumes?

Containers are ephemeral - data is lost when a container is removed. Volumes provide persistent storage.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Storage Types                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Volumes   │  │ Bind Mounts │  │    tmpfs    │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         ▼                ▼                ▼                     │
│  Managed by Docker   Host filesystem   Memory only              │
│  Best for data       Best for dev      Temporary data           │
└─────────────────────────────────────────────────────────────────┘
```

### Exercise 1: Creating and Using Volumes

```bash
# Create a volume
docker volume create mydata

# List volumes
docker volume ls

# Inspect volume
docker volume inspect mydata

# Run container with volume
docker run -d --name db \
    -v mydata:/var/lib/postgresql/data \
    -e POSTGRES_PASSWORD=secret \
    postgres:15-alpine

# Write some data
sleep 10
docker exec db psql -U postgres -c "CREATE TABLE test (id INT, name TEXT);"
docker exec db psql -U postgres -c "INSERT INTO test VALUES (1, 'Hello');"

# Stop and remove container
docker stop db && docker rm db

# Data persists! Create new container
docker run -d --name db2 \
    -v mydata:/var/lib/postgresql/data \
    -e POSTGRES_PASSWORD=secret \
    postgres:15-alpine

sleep 5
docker exec db2 psql -U postgres -c "SELECT * FROM test;"

# Cleanup
docker stop db2 && docker rm db2
docker volume rm mydata
```

---

## Bind Mounts

### Development Workflow with Bind Mounts

Bind mounts are perfect for development - changes on host reflect immediately in the container.

### Exercise 2: Live Development Setup

```bash
mkdir -p ~/docker-labs/session-2/dev-app
cd ~/docker-labs/session-2/dev-app

# Create a simple web page
echo "<h1>Hello from Host!</h1>" > index.html

# Run nginx with bind mount
docker run -d --name web \
    -p 8080:80 \
    -v $(pwd):/usr/share/nginx/html \
    nginx:alpine

# Access the page
curl http://localhost:8080

# Modify on host - changes reflect immediately!
echo "<h1>Updated!</h1><p>Live editing works!</p>" > index.html
curl http://localhost:8080

# Cleanup
docker stop web && docker rm web
```

---

## Docker Networking

### Network Types

| Type | Use Case |
|------|----------|
| `bridge` | Default, isolated container network |
| `host` | Container uses host network |
| `none` | No networking |
| Custom bridge | Named network with DNS |

### Exercise 3: Container Communication

```bash
# Create a custom network
docker network create mynet

# Run containers on the network
docker run -d --name web --network mynet nginx:alpine
docker run -d --name api --network mynet nginx:alpine

# Containers can communicate by name!
docker exec web ping -c 2 api
docker exec api ping -c 2 web

# Cleanup
docker stop web api
docker rm web api
docker network rm mynet
```

### Exercise 4: Web + Database Setup

```bash
# Create network
docker network create webapp

# Run PostgreSQL
docker run -d --name db \
    --network webapp \
    -e POSTGRES_PASSWORD=secret \
    -e POSTGRES_DB=myapp \
    postgres:15-alpine

# Run web app that connects to DB
docker run -d --name web \
    --network webapp \
    -p 8080:80 \
    -e DATABASE_HOST=db \
    nginx:alpine

# Verify connectivity
docker exec web ping -c 2 db

# Cleanup
docker stop web db
docker rm web db
docker network rm webapp
```

---

## Docker Compose Basics

### Why Docker Compose?

| Without Compose | With Compose |
|-----------------|--------------|
| Multiple `docker run` commands | Single `docker compose up` |
| Manual network creation | Automatic network setup |
| Complex command lines | Declarative YAML file |

### Docker Compose File Structure

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret

volumes:
  db-data:

networks:
  backend:
```

### Exercise 5: First Docker Compose

```bash
mkdir -p ~/docker-labs/session-2/compose-intro
cd ~/docker-labs/session-2/compose-intro
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
```

Create content:

```bash
mkdir html
echo "<h1>Hello from Compose!</h1>" > html/index.html
```

Run:

```bash
# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs

# Test
curl http://localhost:8080

# Stop
docker compose down
```

---

## Multi-Service Applications

### Exercise 6: Full-Stack Application

```bash
mkdir -p ~/docker-labs/session-2/fullstack
cd ~/docker-labs/session-2/fullstack
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://app:secret@db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

Create frontend:

```bash
mkdir frontend
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Full-Stack App</title></head>
<body>
    <h1>🐳 Full-Stack Docker App</h1>
    <p>Frontend: Nginx | Backend: Node.js | Database: PostgreSQL</p>
</body>
</html>
EOF
```

Create backend:

```bash
mkdir backend

cat > backend/server.js << 'EOF'
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'ok', message: 'Backend running!' }));
});
server.listen(3000, () => console.log('Backend on port 3000'));
EOF

cat > backend/Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY server.js .
EXPOSE 3000
CMD ["node", "server.js"]
EOF
```

Run:

```bash
docker compose up -d --build
curl http://localhost
curl http://localhost:3000
docker compose down -v
```

---

## Hands-on Exercises

### 🏋️ Exercise 7: WordPress with MySQL

```bash
mkdir -p ~/docker-labs/session-2/wordpress
cd ~/docker-labs/session-2/wordpress
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: secret
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress-data:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: secret
      MYSQL_ROOT_PASSWORD: rootsecret
    volumes:
      - db-data:/var/lib/mysql

volumes:
  wordpress-data:
  db-data:
```

Run:

```bash
docker compose up -d
# Access: http://localhost:8080
docker compose down -v
```

### 🏋️ Exercise 8: Environment Variables

Create `.env` file:

```bash
cat > .env << 'EOF'
DB_PASSWORD=supersecret
WEB_PORT=8080
EOF
```

Use in `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "${WEB_PORT:-80}:80"
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

---

## 📝 Session 2 Summary

In this session, you learned:
- ✅ Docker volumes for data persistence
- ✅ Bind mounts for development workflows
- ✅ Docker networking and container communication
- ✅ Docker Compose fundamentals
- ✅ Multi-service application deployment
- ✅ Environment variable configuration

## 🔗 Next Session
[Session 3: Multi-Stage Builds & Security](../session-3/README.md)

---

## 📚 Additional Resources
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
- [Docker Networking](https://docs.docker.com/network/)
- [Docker Compose](https://docs.docker.com/compose/)