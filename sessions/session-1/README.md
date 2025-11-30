# Session 1: Docker Fundamentals

## 🎯 Session Objectives
- Understand what Docker is and why it's important for developers
- Install Docker on your system
- Work with Docker images and containers
- Write Dockerfiles to build custom images

## ⏱️ Duration
2 hours

## 📋 Prerequisites
- A computer with Linux, Windows, or macOS
- Administrative/sudo privileges
- Basic command-line knowledge
- Code editor (VS Code recommended)

---

## 📚 Topics Covered

1. [Introduction to Docker](#introduction-to-docker)
2. [Docker Installation](#docker-installation)
3. [Docker Architecture](#docker-architecture)
4. [Working with Images](#working-with-images)
5. [Container Management](#container-management)
6. [Writing Dockerfiles](#writing-dockerfiles)
7. [Hands-on Exercises](#hands-on-exercises)

---

## Introduction to Docker

### What is Docker?
Docker is a platform for developing, shipping, and running applications in containers. Containers are lightweight, standalone, executable packages that include everything needed to run an application:
- Code
- Runtime
- System tools
- Libraries
- Settings

### Why Docker?

| Traditional Deployment | Docker Deployment |
|----------------------|-------------------|
| "Works on my machine" problems | Consistent across all environments |
| Complex dependency management | Dependencies bundled in container |
| Heavy virtual machines | Lightweight containers |
| Slow deployment | Fast deployment |
| Resource intensive | Efficient resource usage |

### Containers vs Virtual Machines

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Virtual Machines vs Containers                       │
├─────────────────────────────────┬───────────────────────────────────────┤
│         Virtual Machines        │              Containers               │
├─────────────────────────────────┼───────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐     │    ┌─────┐  ┌─────┐  ┌─────┐         │
│  │App A│  │App B│  │App C│     │    │App A│  │App B│  │App C│         │
│  ├─────┤  ├─────┤  ├─────┤     │    ├─────┴──┴─────┴──┴─────┤         │
│  │Bins │  │Bins │  │Bins │     │    │   Container Runtime   │         │
│  ├─────┤  ├─────┤  ├─────┤     │    ├───────────────────────┤         │
│  │Guest│  │Guest│  │Guest│     │    │     Host Kernel       │         │
│  │ OS  │  │ OS  │  │ OS  │     │    └───────────────────────┘         │
│  └─────┴──┴─────┴──┴─────┘     │                                      │
│  ┌───────────────────────┐     │                                      │
│  │      Hypervisor       │     │                                      │
│  ├───────────────────────┤     │                                      │
│  │     Host Kernel       │     │                                      │
│  └───────────────────────┘     │                                      │
│                                 │                                      │
│  • Full OS per VM              │    • Shared OS kernel                │
│  • GBs of memory               │    • MBs of memory                   │
│  • Minutes to start            │    • Seconds to start                │
└─────────────────────────────────┴───────────────────────────────────────┘
```

---

## Docker Installation

### For Ubuntu/Debian

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to the docker group (optional, to run without sudo)
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### For CentOS/RHEL/Fedora

```bash
# Remove old versions
sudo yum remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# Install prerequisites
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker Engine
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group
sudo usermod -aG docker $USER
```

### For macOS

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Double-click the `.dmg` file
3. Drag Docker to Applications folder
4. Open Docker from Applications
5. Wait for Docker to start (whale icon in menu bar)

### For Windows

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run the installer
3. Enable WSL 2 during installation (recommended)
4. Restart your computer
5. Open Docker Desktop

### Verify Installation

```bash
# Check Docker version
docker version

# Check Docker info
docker info

# Run test container
docker run hello-world
```

---

## Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Client                          │
│                    (docker CLI)                             │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│                      Docker Daemon                          │
│                       (dockerd)                             │
├─────────────────────────────────────────────────────────────┤
│  Images  │  Containers  │  Networks  │  Volumes             │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Container Runtime                        │
│                      (containerd)                           │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Docker Client** | CLI tool that sends commands to Docker daemon |
| **Docker Daemon** | Background service that manages Docker objects |
| **Docker Images** | Read-only templates used to create containers |
| **Docker Containers** | Runnable instances of Docker images |
| **Docker Registry** | Storage for Docker images (e.g., Docker Hub) |

---

## Your First Container

### Exercise 1: Hello World

```bash
# Run the hello-world container
docker run hello-world
```

**What happened?**
1. Docker looked for the `hello-world` image locally
2. Image not found, so Docker pulled it from Docker Hub
3. Docker created a container from this image
4. The container ran and printed the message
5. The container stopped

### Exercise 2: Run an Interactive Container

```bash
# Run Ubuntu interactively
docker run -it ubuntu bash

# Inside the container:
cat /etc/os-release
pwd
ls
exit

# Run and auto-remove after exit
docker run -it --rm ubuntu bash
```

### Exercise 3: Run a Background Container

```bash
# Run nginx in the background
docker run -d --name my-nginx -p 8080:80 nginx

# Check if it's running
docker ps

# Access the web server
curl http://localhost:8080

# Or open in browser: http://localhost:8080

# Stop the container
docker stop my-nginx

# Remove the container
docker rm my-nginx
```

---

## Essential Docker Commands

### Image Commands

```bash
# List local images
docker images

# Pull an image from Docker Hub
docker pull nginx

# Pull a specific version
docker pull nginx:1.24

# Remove an image
docker rmi nginx:1.24

# Remove all unused images
docker image prune
```

### Container Commands

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Run a container
docker run [OPTIONS] IMAGE [COMMAND]

# Common run options:
#   -d          Run in background (detached)
#   -it         Interactive with terminal
#   --name      Give container a name
#   -p          Port mapping (host:container)
#   --rm        Remove container after it exits
#   -e          Set environment variable

# Stop a container
docker stop CONTAINER

# Start a stopped container
docker start CONTAINER

# Restart a container
docker restart CONTAINER

# Remove a container
docker rm CONTAINER

# Remove all stopped containers
docker container prune
```

### Container Interaction

```bash
# View container logs
docker logs CONTAINER

# Follow logs in real-time
docker logs -f CONTAINER

# Execute command in running container
docker exec CONTAINER COMMAND

# Open shell in running container
docker exec -it CONTAINER bash

# Copy files to/from container
docker cp FILE CONTAINER:PATH
docker cp CONTAINER:PATH FILE
```

### System Commands

```bash
# View Docker system info
docker info

# View resource usage
docker stats

# Clean up unused resources
docker system prune

# Clean up everything (use with caution!)
docker system prune -a --volumes
```

---

## Hands-on Exercises

### 🏋️ Exercise 1: Explore Different Base Images

Run containers from different base images and explore them:

```bash
# Alpine Linux (minimal)
docker run -it --rm alpine sh
# Check size: ~5MB

# Debian
docker run -it --rm debian bash
# Check size: ~124MB

# Python
docker run -it --rm python:3.11 python --version

# Node.js
docker run -it --rm node:20 node --version
```

### 🏋️ Exercise 2: Port Mapping Practice

```bash
# Run nginx on different ports
docker run -d --name web1 -p 8081:80 nginx
docker run -d --name web2 -p 8082:80 nginx
docker run -d --name web3 -p 8083:80 nginx

# Test all three
curl http://localhost:8081
curl http://localhost:8082
curl http://localhost:8083

# Cleanup
docker stop web1 web2 web3
docker rm web1 web2 web3
```

### 🏋️ Exercise 3: Environment Variables

```bash
# Run MySQL with environment variables
docker run -d --name my-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=myapp \
  -p 3306:3306 \
  mysql:8.0

# Wait for MySQL to start
sleep 30

# Connect to MySQL
docker exec -it my-mysql mysql -uroot -psecret -e "SHOW DATABASES;"

# Cleanup
docker stop my-mysql && docker rm my-mysql
```

### 🏋️ Exercise 4: Container Naming and Logs

```bash
# Run a container with a custom name
docker run -d --name web-server nginx

# View logs
docker logs web-server

# Generate some traffic
curl http://$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web-server)

# View logs again
docker logs web-server

# Follow logs
docker logs -f web-server
# Press Ctrl+C to exit

# Cleanup
docker stop web-server && docker rm web-server
```

### 🏋️ Exercise 5: Container Inspection

```bash
# Run a container
docker run -d --name inspect-demo -p 8080:80 nginx

# Get container ID
docker ps -q --filter "name=inspect-demo"

# Inspect full details
docker inspect inspect-demo

# Get specific information
docker inspect --format='{{.State.Status}}' inspect-demo
docker inspect --format='{{.NetworkSettings.IPAddress}}' inspect-demo
docker inspect --format='{{.Config.Image}}' inspect-demo

# Cleanup
docker stop inspect-demo && docker rm inspect-demo
```

---

## Writing Dockerfiles

### Dockerfile Instructions

| Instruction | Description | Example |
|-------------|-------------|---------|
| `FROM` | Base image | `FROM python:3.11-slim` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy files from host | `COPY . .` |
| `RUN` | Execute commands | `RUN pip install flask` |
| `ENV` | Set environment variables | `ENV PORT=8080` |
| `EXPOSE` | Document exposed ports | `EXPOSE 8080` |
| `CMD` | Default command | `CMD ["python", "app.py"]` |

### 🏋️ Exercise 6: Build Your First Image

Create a project directory:

```bash
mkdir -p ~/docker-labs/session-1/flask-app
cd ~/docker-labs/session-1/flask-app
```

Create `app.py`:

```python
from flask import Flask
import os
import socket

app = Flask(__name__)

@app.route('/')
def hello():
    return f'''
    <h1>Hello from Docker!</h1>
    <p>Hostname: {socket.gethostname()}</p>
    <p>Environment: {os.environ.get('ENVIRONMENT', 'development')}</p>
    '''

@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

Create `requirements.txt`:

```
flask==3.0.0
```

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENV ENVIRONMENT=production

EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:

```bash
# Build the image
docker build -t flask-app:1.0 .

# Run the container
docker run -d -p 5000:5000 --name myapp flask-app:1.0

# Test it
curl http://localhost:5000
curl http://localhost:5000/health

# Cleanup
docker stop myapp && docker rm myapp
```

### 🏋️ Exercise 7: Build a Node.js Image

```bash
mkdir -p ~/docker-labs/session-1/node-app
cd ~/docker-labs/session-1/node-app
```

Create `package.json`:

```json
{
  "name": "node-app",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": { "express": "^4.18.2" }
}
```

Create `server.js`:

```javascript
const express = require('express');
const os = require('os');
const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Node.js!', hostname: os.hostname() });
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(3000, '0.0.0.0', () => console.log('Server on port 3000'));
```

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server.js .

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t node-app:1.0 .
docker run -d -p 3000:3000 --name nodeapp node-app:1.0
curl http://localhost:3000
docker stop nodeapp && docker rm nodeapp
```

---

## 📝 Session 1 Summary

In this session, you learned:
- ✅ What Docker is and why it's important for developers
- ✅ How to install Docker on your system
- ✅ Docker architecture and components
- ✅ Working with Docker images and containers
- ✅ Essential Docker commands
- ✅ Port mapping and environment variables
- ✅ Writing Dockerfiles to build custom images

## 🔗 Next Session
[Session 2: Storage, Networking & Compose](../session-2/README.md)

---

## 📚 Additional Resources
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
