# Python Flask Sample Application

A simple Python Flask web application for Docker learning.

## Files

- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container build instructions
- `.dockerignore` - Files to exclude from build

## Quick Start

```bash
# Build the image
docker build -t python-flask-app .

# Run the container
docker run -d -p 5000:5000 --name flask-app python-flask-app

# Test the application
curl http://localhost:5000
curl http://localhost:5000/health

# Stop and remove
docker stop flask-app && docker rm flask-app
```

## Endpoints

- `GET /` - Home page with hostname info
- `GET /health` - Health check endpoint
- `GET /api/info` - Application info in JSON

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Application port |
| `ENVIRONMENT` | development | Environment name |
