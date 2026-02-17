# Production Deployment with Docker and Nginx Proxy Manager

This plan outlines the steps to deploy 2watcharr in a production environment behind an Nginx Proxy Manager (NPM) for HTTPS termination.

## Security Assessment Summary

The application is built with security best practices in mind:
- **Authentication**: Powered by `next-auth` with secure session management.
- **Passwords**: Hashed using `bcryptjs` with standard salt rounds.
- **API Security**: Each API route validates the session server-side.
- **Data Protection**: SQL injection is prevented through the use of parameterized queries in all database interactions.
- **HTTPS**: Deployment behind NPM ensures all traffic is encrypted via SSL/TLS.

> [!IMPORTANT]
> Ensure you change the default `NEXTAUTH_SECRET` to a strong, random string in production.

## Proposed Changes

### Configuration

#### [NEW] [docker-compose.prod.yml](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docker-compose.prod.yml)
Create a production-specific compose file that integrates smoothly with NPM.

#### [NEW] [.env.example](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.env.example)
Provide a template for the required environment variables.

## Deployment Steps

### 1. Preparation
- Copy `docker-compose.prod.yml` to your server.
- Create a `.env` file based on `.env.example`.
- Set a secure `NEXTAUTH_SECRET` (generate one with `openssl rand -base64 32`).
- Set `NEXTAUTH_URL` to your full domain (e.g., `https://2watcharr.yourdomain.com`).

### 2. Launch Application
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 3. Nginx Proxy Manager Setup
- **Forward Host**: The IP of your Docker server or the container name if NPM is in the same Docker network.
- **Forward Port**: `3000`.
- **SSL**: Enable "Force SSL" and "HTTP/2 Support". Request a new Let's Encrypt certificate.

## Verification Plan

### Automated Tests
- Run `docker compose -f docker-compose.prod.yml config` to verify the syntax.
- Check container health via `docker exec 2watcharr curl -f http://localhost:3000/api/health`.

### Manual Verification
- Access the app via your custom domain with `https://`.
- Verify that login works and sessions persist.
- Verify that adding a video via URL works (cross-container networking and `yt-dlp` functionality).
