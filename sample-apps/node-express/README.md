# Node.js Express Sample Application

A simple Node.js Express REST API for Docker learning.

## Files

- `server.js` - Main Express application
- `package.json` - Node.js dependencies
- `Dockerfile` - Container build instructions
- `.dockerignore` - Files to exclude from build

## Quick Start

```bash
# Build the image
docker build -t node-express-app .

# Run the container
docker run -d -p 3000:3000 --name express-app node-express-app

# Test the application
curl http://localhost:3000
curl http://localhost:3000/health
curl http://localhost:3000/api/info

# Stop and remove
docker stop express-app && docker rm express-app
```

## Endpoints

- `GET /` - Home page with hostname info
- `GET /health` - Health check endpoint
- `GET /api/info` - Application info in JSON
- `GET /api/users` - Sample users list

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Application port |
| `NODE_ENV` | development | Environment name |
