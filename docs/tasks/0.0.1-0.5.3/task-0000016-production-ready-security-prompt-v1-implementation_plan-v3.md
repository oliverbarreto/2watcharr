# Refine Production Docker Compose Configuration

The goal is to ensure the database definition in [docker-compose.prod.yml](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docker-compose.prod.yml) accurately reflects the host storage structure and removes any redundant or confusing definitions.

## Proposed Changes

### Configuration

#### [MODIFY] [docker-compose.prod.yml](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docker-compose.prod.yml)
- Remove the unused `volumes` section at the end of the file (since bind mounts are used).
- Add comments clarifying the host-to-container path mapping.
- Ensure `DATABASE_PATH` environment variable correctly defaults to the container-internal path.

## Verification Plan

### Automated Tests
- Run `docker compose -f docker-compose.prod.yml config` to ensure the YAML syntax is valid.

### Manual Verification
- Confirm that the `data/` directory exists and contains `2watcharr.db` (already verified).
