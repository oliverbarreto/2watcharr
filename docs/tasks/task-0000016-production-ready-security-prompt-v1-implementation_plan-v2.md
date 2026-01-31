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

### 1. Preparation (Manual)
1. **Copy Files**: Transfer [docker-compose.prod.yml](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docker-compose.prod.yml) and [.env.example](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.env.example) to your server's project directory (e.g., `~/2watcharr`).
2. **Environment Setup**: 
   - Rename [.env.example](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.env.example) to `.env`.
   - Generate a secret: `openssl rand -base64 32` and paste it into `NEXTAUTH_SECRET`.
   - Set `NEXTAUTH_URL=https://your-domain.com`.
3. **Data Directories**: The compose file uses bind mounts. Ensure `data` and `logs` directories exist in the same folder as the compose file:
   ```bash
   mkdir -p data logs
   chmod 777 data logs # Ensure Docker user can write (or own them via chown)
   ```

### 2. Launching the Application
Run the following command to build and start the container in the background:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**Post-Launch Verification:**
- **Check Status**: `docker compose -f docker-compose.prod.yml ps` (Should show `Up (healthy)`).
- **Check Logs**: If something goes wrong, use `docker compose -f docker-compose.prod.yml logs -f`.
- **Verify Internal Access**: `curl http://localhost:3000/api/health` should return `{"status":"ok"}`.

### 3. Nginx Proxy Manager (NPM) Configuration
Follow these exact steps inside your NPM dashboard:

1. **Add Proxy Host**: Click on "Hosts" -> "Proxy Hosts" -> "Add Proxy Host".
2. **Details Tab**:
   - **Domain Names**: Type your custom domain (e.g., `2watcharr.yourdomain.com`).
   - **Scheme**: `http`
   - **Forward Hostname / IP**: 
     - If NPM is in the same Docker network: Use the container name `2watcharr`.
     - If NPM is on the same machine but NOT in the same network: Use the server's local IP (e.g., `172.17.0.1` or the public/private IP).
   - **Forward Port**: `3000`
   - **Cache Assets**: `Yes`
   - **Block Common Exploits**: `Yes`
   - **Websockets Support**: `Yes`
3. **SSL Tab**:
   - **SSL Certificate**: Select "Request a new SSL Certificate".
   - **Force SSL**: `Yes`
   - **HTTP/2 Support**: `Yes`
   - **HSTS Enabled**: `Yes`
   - **Agree to Terms**: Check the box.
4. **Save**: Click "Save". Wait a few seconds for the Let's Encrypt certificate to be issued.

## Security Overview (Recap)
The application is ready for production. All inputs are sanitized, SQL queries use parameterization, and sessions are encrypted. By using NPM with "Force SSL", you ensure that all user data and credentials transit over an encrypted tunnel.

## Verification Plan

### Manual Verification
- Access `https://your-domain.com` in your browser.
- Log in with your admin credentials.
- Add a YouTube video URL and verify it appears in the watchlist (verifies `yt-dlp` and DB connectivity).
- Check the `logs/` directory on the host to see application logs.
