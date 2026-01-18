# Session 3: Multi-Stage Builds & Security

## 🎯 Session Objectives
- Master multi-stage builds for optimized images
- Implement Docker security best practices
- Understand image optimization techniques

## ⏱️ Duration
2 hours

## 📋 Prerequisites
- Completed Sessions 1-2
- Docker installed and running

---

## 📚 Topics Covered

1. [Multi-Stage Builds](#multi-stage-builds)
2. [Image Optimization](#image-optimization)
3. [Docker Security](#docker-security)
4. [Vulnerability Scanning](#vulnerability-scanning)
5. [Hands-on Exercises](#hands-on-exercises)

---

## Multi-Stage Builds

### Why Multi-Stage Builds?

Multi-stage builds dramatically reduce image size by separating build and runtime environments.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Stage Build Flow                       │
├─────────────────────────────────────────────────────────────────┤
│  Stage 1: Build                    Stage 2: Runtime             │
│  ┌─────────────────────┐          ┌─────────────────────┐      │
│  │  Build tools        │          │  Minimal base       │      │
│  │  Source code        │  ──────► │  Application only   │      │
│  │  Dependencies       │  COPY    │  Runtime deps       │      │
│  │  ~1GB+              │          │  ~50-100MB          │      │
│  └─────────────────────┘          └─────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Exercise 1: Go Application Multi-Stage

```bash
mkdir -p ~/docker-labs/session-3/go-app
cd ~/docker-labs/session-3/go-app
```

Create `main.go`:

```go
package main

import (
    "fmt"
    "net/http"
    "os"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        hostname, _ := os.Hostname()
        fmt.Fprintf(w, "Hello from Go!\nHostname: %s\n", hostname)
    })
    
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, `{"status": "healthy"}`)
    })
    
    fmt.Println("Server starting on :8080")
    http.ListenAndServe(":8080", nil)
}
```

Create `Dockerfile.single` (unoptimized):

```dockerfile
FROM golang:1.21
WORKDIR /app
COPY main.go .
RUN go build -o server main.go
EXPOSE 8080
CMD ["./server"]
```

Create `Dockerfile` (multi-stage):

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux go build -a -o server main.go

# Runtime stage
FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

Compare image sizes:

```bash
# Build both versions
docker build -f Dockerfile.single -t go-app:single .
docker build -t go-app:multi .

# Compare sizes
docker images | grep go-app
# single: ~1GB
# multi:  ~15MB

# Test
docker run -d -p 8080:8080 --name go-test go-app:multi
curl http://localhost:8080
docker stop go-test && docker rm go-test
```

### Exercise 2: Node.js Multi-Stage Build

```bash
mkdir -p ~/docker-labs/session-3/node-ts
cd ~/docker-labs/session-3/node-ts
```

Create `package.json`:

```json
{
  "name": "node-ts-app",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": { "express": "^4.18.2" },
  "devDependencies": {
    "typescript": "^5.3.2",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

Create `src/server.ts`:

```typescript
import express from 'express';
import os from 'os';

const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'Hello from TypeScript!', hostname: os.hostname() });
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(3000, () => console.log('Server on port 3000'));
```

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["npm", "start"]
```

Build and test:

```bash
docker build -t node-ts:latest .
docker run -d -p 3000:3000 --name ts-app node-ts:latest
curl http://localhost:3000
docker stop ts-app && docker rm ts-app
```

---

## Image Optimization

### Best Practices

1. **Use specific base image versions**
2. **Order instructions by change frequency**
3. **Combine RUN commands**
4. **Use .dockerignore**

### Exercise 3: Optimized Dockerfile

```dockerfile
# ❌ BEFORE: Unoptimized
FROM python:3.11
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
RUN apt-get update
RUN apt-get install -y curl
CMD ["python", "app.py"]

# ✅ AFTER: Optimized
FROM python:3.11-slim

# Install system deps in one layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code last (changes frequently)
COPY app.py .

CMD ["python", "app.py"]
```

### .dockerignore

Create `.dockerignore`:

```
.git
node_modules
__pycache__
*.pyc
.env
.env.*
README.md
Dockerfile*
docker-compose*
.vscode
.idea
```

---

## Docker Security

### Security Best Practices

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Security Layers                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Image Security                                              │
│     ├── Use official/verified images                           │
│     ├── Use specific versions (not :latest)                    │
│     └── Scan for vulnerabilities                               │
│                                                                 │
│  2. Container Security                                          │
│     ├── Run as non-root user                                   │
│     ├── Use read-only filesystem                               │
│     └── Limit capabilities                                     │
│                                                                 │
│  3. Runtime Security                                            │
│     ├── Resource limits                                        │
│     ├── Network isolation                                      │
│     └── Secrets management                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Exercise 4: Secure Dockerfile

```bash
mkdir -p ~/docker-labs/session-3/secure-app
cd ~/docker-labs/session-3/secure-app
```

Create `app.py`:

```python
from flask import Flask
import os

app = Flask(__name__)

@app.route('/')
def hello():
    return f"Hello! Running as user: {os.getuid()}"

@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

Create `requirements.txt`:

```
flask==3.0.0
```

Create secure `Dockerfile`:

```dockerfile
# Use specific version
FROM python:3.11-slim-bookworm

# Labels
LABEL maintainer="developer@example.com"
LABEL version="1.0"

# Environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create non-root user
RUN groupadd --gid 1000 appgroup && \
    useradd --uid 1000 --gid appgroup --create-home appuser

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app with correct ownership
COPY --chown=appuser:appgroup app.py .

# Switch to non-root user
USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')"

CMD ["python", "app.py"]
```

Build and run securely:

```bash
docker build -t secure-app:latest .

# Run with security options
docker run -d \
    --name secure-test \
    --read-only \
    --tmpfs /tmp \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    -p 8080:8080 \
    secure-app:latest

# Verify running as non-root
docker exec secure-test whoami
docker exec secure-test id

# Test
curl http://localhost:8080

# Cleanup
docker stop secure-test && docker rm secure-test
```

---

## Vulnerability Scanning

### Exercise 5: Scan Images

```bash
# Using Docker Scout (built-in)
docker scout cves secure-app:latest

# Using Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image secure-app:latest

# Scan for HIGH and CRITICAL only
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image --severity HIGH,CRITICAL secure-app:latest
```

---

## Hands-on Exercises

### 🏋️ Exercise 6: Python Multi-Stage

Create a production-ready Python image:

```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim
WORKDIR /app

# Create non-root user
RUN useradd --create-home appuser
USER appuser

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

COPY --chown=appuser:appuser app.py .

EXPOSE 8080
CMD ["python", "app.py"]
```

### 🏋️ Exercise 7: Resource Limits

```bash
# Run with memory limit
docker run -d --name limited \
    --memory=256m \
    --cpus=0.5 \
    nginx:alpine

# Check limits
docker stats limited --no-stream

# Cleanup
docker stop limited && docker rm limited
```

### 🏋️ Exercise 8: Complete Secure Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    user: "1000:1000"
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

---

## 📝 Session 3 Summary

In this session, you learned:
- ✅ Multi-stage builds for optimized images
- ✅ Image optimization techniques
- ✅ Docker security best practices
- ✅ Running containers as non-root users
- ✅ Vulnerability scanning
- ✅ Resource limits and constraints

## 🔗 Next Session
[Session 4: CI/CD & Production Deployment](../session-4/README.md)

---

## 📚 Additional Resources
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)