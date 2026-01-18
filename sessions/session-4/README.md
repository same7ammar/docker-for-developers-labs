# Session 4: CI/CD & Production Deployment

## 🎯 Session Objectives
- Set up CI/CD pipelines with GitHub Actions
- Work with Docker registries
- Implement production deployment patterns
- Configure health checks and monitoring

## ⏱️ Duration
2 hours

## 📋 Prerequisites
- Completed Sessions 1-3
- GitHub account
- Docker Hub account (free)

---

## 📚 Topics Covered

1. [GitHub Actions for Docker](#github-actions-for-docker)
2. [Docker Registries](#docker-registries)
3. [Production Patterns](#production-patterns)
4. [Health Checks & Monitoring](#health-checks--monitoring)
5. [Hands-on Exercises](#hands-on-exercises)

---

## GitHub Actions for Docker

### Why CI/CD for Docker?

- Automated image building on every push
- Consistent builds across environments
- Automated testing before deployment
- Automatic vulnerability scanning
- Push to registry on successful builds

### Exercise 1: Basic Docker Build Workflow

Create `.github/workflows/docker-build.yml`:

```yaml
name: Docker Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: myapp:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Exercise 2: Build and Push to Docker Hub

```yaml
name: Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: username/myapp
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix=
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Exercise 3: Multi-Platform Builds

```yaml
name: Multi-Platform Build

on:
  push:
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: username/myapp:latest
```

### Exercise 4: Complete CI/CD Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests
        run: |
          docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
          docker compose -f docker-compose.test.yml down

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  security-scan:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    
    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

---

## Docker Registries

### Registry Options

| Registry | Use Case |
|----------|----------|
| Docker Hub | Public images, free tier available |
| GitHub Container Registry | GitHub integration, free for public repos |
| AWS ECR | AWS ecosystem integration |
| Google Artifact Registry | GCP ecosystem integration |
| Self-hosted | Full control, private network |

### Exercise 5: Push to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag myapp:latest username/myapp:1.0.0

# Push
docker push username/myapp:1.0.0

# Pull on another machine
docker pull username/myapp:1.0.0
```

### Exercise 6: GitHub Container Registry

```bash
# Login with GitHub token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag for GHCR
docker tag myapp:latest ghcr.io/username/myapp:1.0.0

# Push
docker push ghcr.io/username/myapp:1.0.0
```

### Exercise 7: Private Registry

```bash
# Run local registry
docker run -d -p 5000:5000 --name registry registry:2

# Tag for local registry
docker tag myapp:latest localhost:5000/myapp:1.0.0

# Push
docker push localhost:5000/myapp:1.0.0

# List images
curl http://localhost:5000/v2/_catalog

# Cleanup
docker stop registry && docker rm registry
```

---

## Production Patterns

### Exercise 8: Production Docker Compose

```yaml
version: '3.8'

services:
  app:
    image: myapp:${VERSION:-latest}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - frontend
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
    networks:
      - frontend

  db:
    image: postgres:15-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    networks:
      - backend

volumes:
  postgres-data:

networks:
  frontend:
  backend:
    internal: true

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### Exercise 9: Graceful Shutdown

```python
# app.py with graceful shutdown
from flask import Flask
import signal
import sys

app = Flask(__name__)

def graceful_shutdown(signum, frame):
    print("Shutting down gracefully...")
    # Cleanup connections, finish requests
    sys.exit(0)

signal.signal(signal.SIGTERM, graceful_shutdown)
signal.signal(signal.SIGINT, graceful_shutdown)

@app.route('/')
def hello():
    return "Hello, World!"

@app.route('/health')
def health():
    return {'status': 'healthy'}

@app.route('/ready')
def ready():
    # Check dependencies (DB, cache, etc.)
    return {'status': 'ready'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

---

## Health Checks & Monitoring

### Exercise 10: Health Check Implementation

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["python", "app.py"]
```

### Exercise 11: Monitoring Stack

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  prometheus-data:
  grafana-data:
```

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['app:8080']
```

---

## Hands-on Exercises

### 🏋️ Exercise 12: Complete CI/CD Setup

Create a complete project with CI/CD:

```
myapp/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── src/
│   └── app.py
├── tests/
│   └── test_app.py
├── Dockerfile
├── docker-compose.yml
├── docker-compose.test.yml
├── requirements.txt
└── README.md
```

`docker-compose.test.yml`:

```yaml
version: '3.8'

services:
  test:
    build:
      context: .
      target: test
    command: pytest tests/ -v
```

Multi-stage `Dockerfile`:

```dockerfile
# Base stage
FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Test stage
FROM base AS test
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
COPY . .

# Production stage
FROM base AS production
RUN useradd --create-home appuser
USER appuser
COPY --chown=appuser:appuser src/ .
EXPOSE 8080
CMD ["python", "app.py"]
```

### 🏋️ Exercise 13: Blue-Green Deployment

```yaml
version: '3.8'

services:
  blue:
    image: myapp:blue
    deploy:
      replicas: 2
    networks:
      - app-network

  green:
    image: myapp:green
    deploy:
      replicas: 2
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - app-network

networks:
  app-network:
```

Switch traffic by updating nginx.conf:

```nginx
upstream app {
    # Blue deployment (active)
    server blue:8080;
    
    # Green deployment (standby)
    # server green:8080;
}

server {
    listen 80;
    location / {
        proxy_pass http://app;
    }
}
```

---

## 📝 Session 4 Summary

In this session, you learned:
- ✅ GitHub Actions for Docker builds
- ✅ Multi-platform image builds
- ✅ Working with Docker registries
- ✅ Production deployment patterns
- ✅ Health checks and monitoring
- ✅ CI/CD pipeline implementation
- ✅ Blue-green deployment strategy

## 🎓 Course Completion

Congratulations! You have completed all 4 sessions of the Docker Practical Labs course.

### Skills Acquired:
- ✅ Docker fundamentals and container management
- ✅ Building optimized Docker images
- ✅ Data persistence and networking
- ✅ Docker Compose for multi-container apps
- ✅ Security best practices
- ✅ CI/CD with GitHub Actions
- ✅ Production deployment patterns

### Next Steps:
1. Practice with real projects
2. Explore Kubernetes for orchestration
3. Implement monitoring with Prometheus/Grafana
4. Set up CI/CD for your own projects

---

## 📚 Additional Resources
- [GitHub Actions for Docker](https://docs.docker.com/build/ci/github-actions/)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)