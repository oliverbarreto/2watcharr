# Port Configuration for Docker Deployment

This proposal outlines the changes needed to make the application port configurable via environment variables, allowing flexibility in production deployments when port 3000 conflicts with other services.

## Current State Analysis

### Hardcoded Port References

Currently, the application has port 3000 hardcoded in several locations:

1. **[Dockerfile](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/Dockerfile#L56-L58)** - Lines 56-58:
   - `EXPOSE 3000`
   - `ENV PORT 3000`
   - Used by Next.js standalone server

2. **[docker-compose.prod.yml](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docker-compose.prod.yml#L10-L11)** - Lines 10-11:
   - Port mapping: `"3000:3000"`
   - Healthcheck: `http://localhost:3000/api/health` (line 23)

3. **[docker-compose.yml](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docker-compose.yml#L7-L8)** - Lines 7-8:
   - Port mapping: `"3000:3000"`
   - Healthcheck: `http://localhost:3000/api/health` (line 20)

4. **[.env.example](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.env.example#L5)** - Line 5:
   - `NEXTAUTH_URL=http://localhost:3000`

### How Next.js Handles Ports

Next.js standalone server (used in production) reads the port from the `PORT` environment variable, which is already set in the Dockerfile. This means the application **already supports** dynamic port configuration internally—we just need to expose this capability to the deployment configuration.

---

## Proposed Solution

### Overview

Make the application port configurable through a `PORT` environment variable that can be set at deployment time, with a default value of 3000 for backward compatibility.

### Changes Required

#### 1. Environment Variable Configuration

**[MODIFY] [.env.example](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.env.example)**

Add a new `PORT` environment variable with documentation:

```env
# Application Port
# The port the application will listen on inside the container
# Default: 3000
PORT=3000
```

#### 2. Docker Compose Production Configuration

**[MODIFY] [docker-compose.prod.yml](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docker-compose.prod.yml)**

Changes needed:
- Add `PORT` to environment variables with default value
- Update port mapping to use variable substitution
- Update healthcheck to use the PORT variable

```yaml
environment:
  - PORT=${PORT:-3000}
  # ... other environment variables
  
ports:
  - "${PORT:-3000}:${PORT:-3000}"
  
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:${PORT:-3000}/api/health"]
```

> [!IMPORTANT]
> The port mapping format `"${PORT:-3000}:${PORT:-3000}"` maps the **host port** to the **container port**. Both must match since the container listens on the PORT value.

#### 3. Docker Compose Development Configuration

**[MODIFY] [docker-compose.yml](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docker-compose.yml)**

Apply the same changes as production for consistency:
- Add `PORT` environment variable
- Update port mapping
- Update healthcheck

#### 4. Dockerfile

**[MODIFY] [Dockerfile](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/Dockerfile)**

The Dockerfile already has `ENV PORT 3000` on line 58, which serves as the default. We should:
- Keep the default `ENV PORT 3000` for backward compatibility
- Update the `EXPOSE` directive to be documentation-only (it doesn't actually restrict ports)
- Add a comment explaining the port can be overridden

```dockerfile
# Default port - can be overridden via environment variable
ENV PORT 3000
EXPOSE 3000
```

> [!NOTE]
> The `EXPOSE` directive in Docker is purely documentation. The actual port binding is controlled by the `PORT` environment variable and the port mapping in docker-compose.

---

## Usage Examples

### Default Port (3000)

```bash
# Uses default port 3000
docker compose -f docker-compose.prod.yml up -d
```

### Custom Port (8080)

```bash
# Set PORT in .env file
echo "PORT=8080" >> .env

# Or set inline
PORT=8080 docker compose -f docker-compose.prod.yml up -d
```

### With Nginx Reverse Proxy

```nginx
# Nginx configuration example
server {
    listen 80;
    server_name 2watcharr.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;  # Custom port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Deployment Considerations

### Nginx Proxy Manager Integration

Since you're using Nginx Proxy Manager (NPM) as a reverse proxy:

1. **NPM Configuration**: Update your proxy host in NPM to point to the new port if changed
2. **Same Docker Network**: If NPM and 2watcharr are on the same Docker network, you can use the container name: `http://2watcharr:8080`
3. **Different Networks**: If not on the same network, use the host port mapping

### NEXTAUTH_URL Consideration

> [!WARNING]
> The `NEXTAUTH_URL` should reflect your **public-facing URL** (e.g., `https://2watcharr.yourdomain.com`), **not** the internal container port. This is the URL users access through your reverse proxy.

The internal application port is separate from the public URL:
- **Internal Port** (`PORT`): What the container listens on (e.g., 8080)
- **Public URL** (`NEXTAUTH_URL`): What users access (e.g., https://2watcharr.yourdomain.com)

### Port Conflict Resolution

This solution addresses the scenario where:
- Another service is already using port 3000 on the host
- You can change 2watcharr to use port 8080 (or any available port)
- Nginx routes external traffic to the new port

---

## Backward Compatibility

✅ **Fully backward compatible**:
- Default port remains 3000
- Existing deployments continue to work without changes
- Only users who need a different port need to set the `PORT` variable

---

## Verification Plan

After implementation:

1. **Test default port**: Deploy without setting PORT, verify it uses 3000
2. **Test custom port**: Set `PORT=8080`, verify application listens on 8080
3. **Test healthcheck**: Ensure healthcheck works with custom port
4. **Test with NPM**: Verify reverse proxy routing works correctly
5. **Test NEXTAUTH**: Ensure authentication works with the configuration

---

## Summary

This solution provides a clean, standard way to configure the application port while maintaining backward compatibility. The changes are minimal and follow Docker best practices by using environment variables for runtime configuration.
