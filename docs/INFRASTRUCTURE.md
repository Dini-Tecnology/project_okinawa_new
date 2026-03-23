# NOOWE Platform — Infrastructure Documentation

## Backup Strategy

### Database Backups
- **Tool**: postgres-backup-local (Docker image)
- **Schedule**: Daily at midnight UTC
- **Retention**: 7 days, 4 weeks, 3 months
- **Storage**: Local volume `db_backups` (mount to S3-compatible storage in production)

### RTO/RPO Targets
- **RTO (Recovery Time Objective)**: < 2 hours
- **RPO (Recovery Point Objective)**: < 24 hours (daily backups)

### Running Backups
```bash
# Start backup service:
docker compose --profile tools up db-backup -d

# Manual backup:
docker exec okinawa-db-backup /backup.sh

# List backups:
docker exec okinawa-db-backup ls /backups/
```

## Environments
- **Development**: `docker compose --profile dev up -d`
- **Production**: `docker compose --profile prod up -d`
- **Tools** (pgAdmin + backup): `docker compose --profile tools up -d`

## Health Checks
- Backend: `GET /api/v1/health`
- Database: `pg_isready`
- Redis: `redis-cli ping`
