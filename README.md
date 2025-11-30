# 🐳 Docker Practical Labs

A comprehensive hands-on Docker course designed for developers in live training sessions. This repository contains practical labs organized into 4 sessions, covering everything from Docker basics to CI/CD with GitHub Actions and production deployment.

##  Course Overview

| Session | Topic | Duration | Description |
|---------|-------|----------|-------------|
| [Session 1](./sessions/session-1/README.md) | Docker Fundamentals | 2 hours | Installation, architecture, images, containers |
| [Session 2](./sessions/session-2/README.md) | Storage, Networking & Compose | 2 hours | Volumes, networks, Docker Compose |
| [Session 3](./sessions/session-3/README.md) | Multi-Stage Builds & Security | 2 hours | Optimized builds, security best practices |
| [Session 4](./sessions/session-4/README.md) | CI/CD & Production Deployment | 2 hours | GitHub Actions, registries, production patterns |

## 🎯 Learning Objectives

By completing this course, you will be able to:

- ✅ Install and configure Docker on various platforms
- ✅ Build and manage Docker images using Dockerfiles
- ✅ Run and manage containers with various options
- ✅ Implement data persistence with volumes and bind mounts
- ✅ Configure Docker networking for container communication
- ✅ Use Docker Compose for multi-container applications
- ✅ Create optimized images with multi-stage builds
- ✅ Apply security best practices
- ✅ Set up CI/CD pipelines with GitHub Actions
- ✅ Deploy containerized applications to production

## 📋 Prerequisites

- Basic command-line knowledge
- A computer with Linux, Windows, or macOS
- Administrative/sudo privileges
- Minimum 8GB RAM recommended
- 20GB free disk space

## 🚀 Getting Started

1. **Clone this repository:**
   ```bash
   git clone https://github.com/same7ammar/docker-practical-labs.git
   cd docker-practical-labs
   ```

2. **Start with Session 1:**
   Navigate to [Session 1: Docker Fundamentals](./sessions/session-1/README.md)

3. **Follow the labs sequentially:**
   Each session builds upon the previous one

## 📁 Repository Structure

```
docker-practical-labs/
├── README.md                    # This file
├── sessions/
│   ├── session-1/              # Docker Fundamentals
│   │   └── README.md
│   ├── session-2/              # Storage, Networking & Compose
│   │   └── README.md
│   ├── session-3/              # Multi-Stage Builds & Security
│   │   └── README.md
│   └── session-4/              # CI/CD & Production Deployment
│       └── README.md
└── sample-apps/                # Sample applications for labs
    ├── python-flask/
    ├── node-express/
    ├── fullstack-app/
    └── microservices-demo/     # Complete microservices project
```

## 🛠️ Sample Applications

The `sample-apps` directory contains ready-to-use applications for the hands-on exercises:

- **python-flask/** - Simple Python Flask web application
- **node-express/** - Node.js Express REST API
- **fullstack-app/** - Complete full-stack application with frontend, backend, and database
- **microservices-demo/** - 🌟 **Complete E-Commerce Microservices Platform**

## 🌟 Microservices Demo Project

A production-ready microservices e-commerce platform demonstrating real-world Docker patterns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              NGINX (Load Balancer)                      │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                            API Gateway                                  │
└───────────┬─────────────────────┼─────────────────┬─────────────────────┘
            │                     │                 │
┌───────────▼───────┐   ┌─────────▼───────┐   ┌─────▼───────────┐
│   User Service    │   │ Product Service │   │  Order Service  │
│   + PostgreSQL    │   │   + PostgreSQL  │   │   + PostgreSQL  │
└───────────────────┘   └─────────────────┘   └─────────────────┘
```

**Features:**
- 🔌 API Gateway pattern with routing
- 🗃️ Database per service pattern
- 🔄 Service-to-service communication
- 🏥 Health checks for all services
- 📊 Production-ready Docker Compose
- 🌐 Web frontend dashboard

**Quick Start:**
```bash
cd sample-apps/microservices-demo
docker compose up -d --build
# Frontend: http://localhost
# API: http://localhost:3000
```

[📖 Full Documentation](./sample-apps/microservices-demo/README.md)

## 📚 Session Details

### Session 1: Docker Fundamentals
- What is Docker and why use it
- Docker installation on various platforms
- Docker architecture
- Working with Docker images
- Container lifecycle management
- Writing Dockerfiles
- Building custom images

### Session 2: Storage, Networking & Compose
- Docker storage types (volumes, bind mounts, tmpfs)
- Data persistence strategies
- Docker networking concepts
- Container communication
- Docker Compose fundamentals
- Multi-service applications

### Session 3: Multi-Stage Builds & Security
- Multi-stage builds for optimized images
- Image optimization techniques
- Security best practices
- Running containers as non-root
- Vulnerability scanning
- Resource management

### Session 4: CI/CD & Production Deployment
- GitHub Actions for Docker
- Automated image building and testing
- Docker registries (Docker Hub, GitHub Container Registry)
- Production deployment patterns
- Health checks and graceful shutdown
- Monitoring and logging basics

## 💡 Tips for Success

1. **Practice hands-on:** Don't just read - type the commands and experiment
2. **Explore:** Try variations of the exercises
3. **Break things:** Learn by making mistakes
4. **Clean up:** Use `docker system prune` regularly to free up space
5. **Ask questions:** Engage with your instructor during live sessions

## 🔧 Troubleshooting

### Common Issues

**Docker daemon not running:**
```bash
sudo systemctl start docker
```

**Permission denied:**
```bash
sudo usermod -aG docker $USER
# Then log out and log back in
```

**Port already in use:**
```bash
docker ps  # Find the container using the port
docker stop <container_name>
```

**Out of disk space:**
```bash
docker system prune -a --volumes
```

## 📖 Additional Resources

- [Official Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Play with Docker](https://labs.play-with-docker.com/)
- [Docker Cheat Sheet](https://docs.docker.com/get-started/docker_cheatsheet.pdf)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Dockerizing! 🐳**