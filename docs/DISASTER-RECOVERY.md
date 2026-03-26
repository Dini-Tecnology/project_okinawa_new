# NOOWE Platform - Disaster Recovery Plan

## Document Control

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Last Updated** | 2026-03-26 |
| **Owner** | Infrastructure / DevOps Team |
| **Review Cycle** | Quarterly |
| **Next Review** | 2026-06-26 |

---

## Recovery Objectives

| Objective | Target | Notes |
|-----------|--------|-------|
| **RTO** (Recovery Time Objective) | **1 hour** | Maximum acceptable downtime for all services |
| **RPO** (Recovery Point Objective) | **15 minutes** | Maximum acceptable data loss window |

### RPO Breakdown by Component

| Component | RPO | Mechanism |
|-----------|-----|-----------|
| PostgreSQL | 15 min | WAL archiving every 5 min + streaming replication |
| Redis | 30 min | AOF persistence (appendonly yes) + RDB snapshots |
| NestJS Backend | 0 (stateless) | Redeploy from Git (branch: `main`) |
| File Uploads | 1 hour | Object storage replication (S3 cross-region) |
| Mobile Apps | N/A | Distributed via App Store / Play Store |

---

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     NOOWE Platform                               │
│                                                                   │
│  ┌──────────┐   ┌──────────────┐   ┌──────────┐   ┌──────────┐ │
│  │PostgreSQL│   │NestJS Backend│   │  Redis   │   │Socket.IO │ │
│  │  :5432   │   │    :3000     │   │  :6379   │   │(8 GWs)   │ │
│  │          │   │              │   │          │   │          │ │
│  │ Primary  │   │  Stateless   │   │ AOF+RDB  │   │Stateless │ │
│  │+ Replica │   │  (N replicas)│   │          │   │          │ │
│  └──────────┘   └──────────────┘   └──────────┘   └──────────┘ │
│                                                                   │
│  ┌──────────┐   ┌──────────────┐   ┌──────────┐                 │
│  │  Bull    │   │   pgAdmin    │   │  Redis   │                 │
│  │  Queues  │   │    :5050     │   │Commander │                 │
│  │(via Redis)│   │  (tools)     │   │  :8081   │                 │
│  └──────────┘   └──────────────┘   └──────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backup Strategy

### PostgreSQL Backups

Reference: `platform/backend/docker-compose.yml` (postgres service with `postgres:16-alpine`)

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| **WAL Archiving** | Continuous (every 5 min) | 7 days | `archive_command` to object storage |
| **Daily Full Backup** | Every day at 02:00 UTC | 7 days | `pg_dump` or `pg_basebackup` |
| **Weekly Full Backup** | Every Sunday at 03:00 UTC | 4 weeks | `pg_basebackup` |
| **Monthly Full Backup** | 1st of month at 04:00 UTC | 3 months | `pg_basebackup` + offsite copy |

**Backup script location:** Schedule via cron or Kubernetes CronJob.

```bash
#!/bin/bash
# Daily PostgreSQL backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="${DATABASE_NAME}"
DB_USER="${DATABASE_USER}"

# Create backup
pg_dump -h postgres -U "$DB_USER" -d "$DB_NAME" -Fc -f "${BACKUP_DIR}/daily_${TIMESTAMP}.dump"

# Upload to object storage
aws s3 cp "${BACKUP_DIR}/daily_${TIMESTAMP}.dump" \
  "s3://noowe-backups/postgres/daily/${TIMESTAMP}.dump" \
  --storage-class STANDARD_IA

# Cleanup local backups older than 7 days
find "$BACKUP_DIR" -name "daily_*.dump" -mtime +7 -delete

echo "[$(date)] PostgreSQL daily backup completed: daily_${TIMESTAMP}.dump"
```

### Redis Backups

Reference: `platform/backend/docker-compose.yml` (redis service with `redis:7-alpine`, `--appendonly yes`)

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| **AOF Persistence** | Continuous | Current | Built-in (`appendonly yes`) |
| **RDB Snapshot** | Every 15 min | 24 hours | `BGSAVE` |
| **Daily RDB Export** | Every day at 02:30 UTC | 7 days | Copy RDB file to object storage |

**Note:** Redis data in NOOWE is primarily ephemeral (rate limit counters, session cache, Bull queue state). Full data loss is recoverable because the source of truth is PostgreSQL. However, active Bull job queues should be drained gracefully before any planned maintenance.

### Backup Verification

| Check | Frequency | Method |
|-------|-----------|--------|
| Backup file integrity | Daily (automated) | `pg_restore --list` on latest backup |
| Full restore test | Monthly | Restore to staging environment |
| Point-in-time recovery test | Quarterly | Restore to specific timestamp |
| Backup size trending | Weekly | Alert if backup size changes > 30% |

---

## Disaster Scenarios and Recovery Procedures

### Scenario 1: Database Failure

**Trigger:** PostgreSQL primary becomes unavailable (crash, disk failure, corruption).

**Detection:**
- Health endpoint returns 503 (`GET /api/v1/health` — checks `db.pingCheck('database')`)
- Readiness probe fails (`GET /api/v1/health/ready`)
- CloudWatch / monitoring alert on PostgreSQL connection errors

**Impact:** All API operations fail. Mobile apps show error states. WebSocket connections drop.

**Recovery Procedure:**

| Step | Action | Time | Owner |
|------|--------|------|-------|
| 1 | Acknowledge alert, start incident timer | 0 min | On-call |
| 2 | Verify failure via `pg_isready -U $DB_USER -d $DB_NAME` | 2 min | On-call |
| 3 | Enable maintenance mode: set `MAINTENANCE_MODE=true` env var | 3 min | On-call |
| 4 | Update status page (see `docs/STATUS-PAGE.md`) | 5 min | On-call |
| 5a | **If replica exists:** Promote replica to primary | 10 min | DBA |
| 5b | **If no replica:** Restore from latest backup | 30 min | DBA |
| 6 | Update `DATABASE_HOST` env var if endpoint changed | 35 min | DevOps |
| 7 | Restart NestJS backend (rolling restart) | 40 min | DevOps |
| 8 | Verify health endpoint returns 200 | 42 min | DevOps |
| 9 | Disable maintenance mode | 43 min | On-call |
| 10 | Run data integrity checks | 50 min | DBA |
| 11 | Update status page: resolved | 55 min | On-call |
| 12 | Post-incident review within 48 hours | — | Team |

**Restore from backup:**
```bash
# Stop application to prevent writes during restore
# Restore from the most recent daily backup
pg_restore -h localhost -U "$DB_USER" -d "$DB_NAME" --clean --if-exists \
  /backups/postgres/daily_LATEST.dump

# Apply WAL logs to recover up to last 5-minute archive
pg_wal_replay --target-time="$(date -u -d '-15 minutes' +%Y-%m-%dT%H:%M:%S)" \
  /backups/postgres/wal/
```

---

### Scenario 2: Full Region Outage

**Trigger:** Cloud provider region (e.g., AWS sa-east-1) becomes completely unavailable.

**Detection:**
- All health checks fail from external monitoring
- Cloud provider status page reports region outage
- Multiple component failures simultaneously

**Impact:** Complete platform unavailability.

**Recovery Procedure:**

| Step | Action | Time | Owner |
|------|--------|------|-------|
| 1 | Confirm region outage via provider status page | 5 min | On-call |
| 2 | Activate incident channel, notify all stakeholders | 10 min | On-call |
| 3 | Update status page with estimated recovery time | 12 min | On-call |
| 4 | **Decision point:** Wait for region recovery OR failover to DR region | 15 min | CTO |
| 5 | If failover: Deploy infrastructure to DR region (e.g., us-east-1) | 30 min | DevOps |
| 6 | Restore PostgreSQL from cross-region backup replica | 40 min | DBA |
| 7 | Deploy NestJS backend from Git (`main` branch) | 45 min | DevOps |
| 8 | Deploy Redis (data will rebuild from PostgreSQL state) | 47 min | DevOps |
| 9 | Update DNS to point to DR region | 50 min | DevOps |
| 10 | DNS propagation (TTL-dependent) | 55 min | — |
| 11 | Verify all health checks pass | 58 min | DevOps |
| 12 | Update status page: operational in DR region | 60 min | On-call |

**Post-recovery:**
- Plan migration back to primary region when it recovers
- Synchronize data from DR region back to primary
- Conduct post-incident review

**DNS Configuration for Failover:**
```
# Route 53 health-check-based failover
api.noowebr.com    A    ALIAS    primary-alb.sa-east-1.elb.amazonaws.com    (primary, health-checked)
api.noowebr.com    A    ALIAS    dr-alb.us-east-1.elb.amazonaws.com         (secondary, failover)
```

---

### Scenario 3: Data Corruption

**Trigger:** Application bug, bad migration, or human error corrupts data in PostgreSQL.

**Detection:**
- User reports of incorrect data
- Application errors in logs (TypeORM validation failures)
- Data integrity check failures

**Impact:** Varies from minor (single table) to critical (cross-table corruption).

**Recovery Procedure:**

| Step | Action | Time | Owner |
|------|--------|------|-------|
| 1 | Identify scope of corruption (which tables, how many rows) | 15 min | DBA + Backend |
| 2 | **Immediately:** Stop the process causing corruption (revert deploy, disable endpoint) | 20 min | DevOps |
| 3 | Take a snapshot of current (corrupted) state for forensics | 25 min | DBA |
| 4 | Determine the exact timestamp when corruption started | 30 min | DBA |
| 5a | **Minor (few rows):** Manual fix via SQL | 35 min | DBA |
| 5b | **Major (table-level):** Point-in-time recovery to pre-corruption state | 45 min | DBA |
| 5c | **Critical (cross-table):** Full restore from last clean backup + WAL replay | 55 min | DBA |
| 6 | Validate data integrity after restore | 60 min | DBA + Backend |
| 7 | Resume normal operations | 65 min | DevOps |
| 8 | Root cause analysis | — | Team |

**Point-in-time recovery:**
```bash
# Restore to a specific point before corruption
pg_restore --target-time="2026-03-26T10:30:00Z" \
  --recovery-target-action=promote \
  /backups/postgres/daily_LATEST.dump
```

**Data integrity check queries:**
```sql
-- Check for orphaned orders (order without valid user)
SELECT o.id FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- Check for orders with invalid restaurant references
SELECT o.id FROM orders o
LEFT JOIN restaurants r ON o.restaurant_id = r.id
WHERE r.id IS NULL;

-- Check for payments without matching orders
SELECT p.id FROM payments p
LEFT JOIN orders o ON p.order_id = o.id
WHERE o.id IS NULL;

-- Verify user consent records integrity
SELECT uc.id FROM user_consents uc
LEFT JOIN users u ON uc.user_id = u.id
WHERE u.id IS NULL;
```

---

### Scenario 4: Security Breach

**Trigger:** Unauthorized access detected, data exfiltration suspected, or WAF alerts indicate active attack.

**Detection:**
- WAF alerts (see `docs/WAF-CONFIGURATION.md`)
- Unusual login patterns (multiple failed logins, logins from unusual geolocations)
- Unexpected database queries in slow query log
- Abnormal outbound traffic

**Impact:** Potential data breach, LGPD notification requirements, reputational damage.

**Recovery Procedure:**

| Step | Action | Time | Owner |
|------|--------|------|-------|
| 1 | **CONTAIN:** Isolate affected systems (do NOT shut down — preserve evidence) | 5 min | Security + On-call |
| 2 | Block attacker IPs at WAF level | 10 min | DevOps |
| 3 | Rotate all secrets: JWT_SECRET, DATABASE_PASSWORD, REDIS_PASSWORD | 15 min | DevOps |
| 4 | Invalidate all active JWT tokens (change JWT_SECRET forces re-login) | 15 min | DevOps |
| 5 | Revoke all API keys and OAuth tokens | 20 min | DevOps |
| 6 | Enable maintenance mode | 22 min | On-call |
| 7 | **ASSESS:** Determine scope of breach | 60 min | Security |
| 8 | Preserve logs and forensic evidence | 60 min | Security |
| 9 | Identify compromised accounts and data | 90 min | Security + DBA |
| 10 | **LGPD Notification:** If personal data was compromised, notify ANPD within 2 business days | 24 hrs | Legal + DPO |
| 11 | Notify affected users (LGPD Art. 48) | 48 hrs | Legal + Product |
| 12 | Patch vulnerability that was exploited | Varies | Backend |
| 13 | Deploy fix, re-enable services | Varies | DevOps |
| 14 | Post-incident security review | 1 week | Security |

**Immediate containment commands:**
```bash
# Block attacker IP at WAF (example for AWS WAF)
aws wafv2 update-ip-set \
  --name NOOWE-BlockedIPs \
  --scope REGIONAL \
  --id "IP_SET_ID" \
  --addresses "ATTACKER_IP/32" \
  --lock-token "LOCK_TOKEN"

# Rotate JWT secret (forces all users to re-authenticate)
# Update in secrets manager, then restart backend
export JWT_SECRET=$(openssl rand -base64 64)

# Rotate database password
ALTER USER noowe_app PASSWORD 'NEW_SECURE_PASSWORD';

# Rotate Redis password
redis-cli CONFIG SET requirepass "NEW_REDIS_PASSWORD"
```

**LGPD Compliance Notes:**
- ANPD (Autoridade Nacional de Protecao de Dados) must be notified within **2 business days** if the breach involves personal data and poses risk to data subjects.
- Affected users must be notified with: description of the incident, types of data affected, mitigation measures taken, and DPO contact information.
- Reference: `docs/INTERNATIONAL-TRANSFER-POLICY.md` and `AUDITORIA-LGPD-CONFORMIDADE.md` for full LGPD compliance details.

---

## Communication Plan

### Status Page

All incidents must be communicated via the status page. See `docs/STATUS-PAGE.md` for full configuration.

**URL:** `https://status.noowebr.com`

### Incident Severity Levels

| Level | Description | Communication | Example |
|-------|-------------|---------------|---------|
| **SEV-1** | Complete platform outage | Status page + push notification + email | Region outage, DB total failure |
| **SEV-2** | Major feature unavailable | Status page + email | Payments down, auth broken |
| **SEV-3** | Degraded performance | Status page update | Slow response times, partial errors |
| **SEV-4** | Minor issue | Status page (scheduled maintenance) | Single endpoint error |

### Notification Templates

**SEV-1 (Investigating):**
```
[NOOWE] We are currently experiencing a platform outage affecting all services.
Our team is actively investigating the issue.
We will provide updates every 15 minutes.
Estimated recovery: Within 1 hour.
```

**SEV-1 (Resolved):**
```
[NOOWE] The platform outage has been resolved.
All services are fully operational.
Duration: [X] minutes.
Root cause: [Brief description].
We apologize for the inconvenience.
```

### Escalation Matrix

| Time Elapsed | Action | Who |
|-------------|--------|-----|
| 0 min | On-call engineer acknowledges alert | On-call |
| 15 min | If not resolved, escalate to team lead | On-call |
| 30 min | If not resolved, escalate to CTO | Team Lead |
| 45 min | If not resolved, activate full DR procedure | CTO |
| 60 min | External communication to all users | Product + CTO |

---

## DR Testing Schedule

### Monthly DR Drill

**Schedule:** First Wednesday of every month, 10:00 UTC (07:00 BRT)

| Month | Scenario | Duration | Participants |
|-------|----------|----------|-------------|
| Jan | Database failover (Scenario 1) | 2 hours | DBA + DevOps |
| Feb | Security breach tabletop (Scenario 4) | 1.5 hours | Full team |
| Mar | Data corruption recovery (Scenario 3) | 2 hours | DBA + Backend |
| Apr | Full region failover (Scenario 2) | 3 hours | Full team |
| May | Database failover (Scenario 1) | 2 hours | DBA + DevOps |
| Jun | Backup restore verification | 2 hours | DBA |
| Jul | Security breach tabletop (Scenario 4) | 1.5 hours | Full team |
| Aug | Data corruption recovery (Scenario 3) | 2 hours | DBA + Backend |
| Sep | Full region failover (Scenario 2) | 3 hours | Full team |
| Oct | Database failover (Scenario 1) | 2 hours | DBA + DevOps |
| Nov | Backup restore verification | 2 hours | DBA |
| Dec | Full DR exercise (all scenarios) | 4 hours | Full team |

### Drill Procedure

1. **Announce:** Notify team 48 hours before the drill
2. **Execute:** Run the drill in the staging environment
3. **Measure:** Record actual RTO and RPO achieved
4. **Document:** Log any issues or gaps discovered
5. **Improve:** Update this DR plan based on findings

### Drill Success Criteria

| Metric | Target |
|--------|--------|
| Actual RTO | Less than 1 hour |
| Actual RPO | Less than 15 minutes |
| Health endpoint recovery | Returns 200 within 5 minutes of fix |
| All WebSocket gateways operational | 8/8 connected within 2 minutes of backend restart |
| Mobile app connectivity | Both apps (client + restaurant) connect within 5 minutes |
| Data integrity | Zero orphaned records after restore |

---

## Infrastructure Prerequisites

### For Scenario 1 (Database Failure)

- [ ] PostgreSQL streaming replication configured (primary + at least 1 replica)
- [ ] WAL archiving enabled and verified (5-minute interval)
- [ ] `pg_isready` health check in docker-compose.yml (already configured)
- [ ] Automated backup script scheduled (daily/weekly/monthly)
- [ ] Backup storage in separate availability zone or region

### For Scenario 2 (Region Outage)

- [ ] Cross-region backup replication (e.g., sa-east-1 -> us-east-1)
- [ ] Infrastructure-as-Code for DR region (Terraform/CloudFormation)
- [ ] DNS failover configured with health checks
- [ ] DR region tested within last 90 days

### For Scenario 3 (Data Corruption)

- [ ] Point-in-time recovery (PITR) enabled on PostgreSQL
- [ ] WAL retention sufficient for 24-hour rollback
- [ ] Data integrity check queries documented (see above)
- [ ] Migration rollback procedures tested

### For Scenario 4 (Security Breach)

- [ ] WAF deployed and configured (see `docs/WAF-CONFIGURATION.md`)
- [ ] Secret rotation procedure documented and tested
- [ ] LGPD incident response contacts documented
- [ ] Forensic evidence preservation procedure established
- [ ] DPO contact information current

---

## Key Contacts

| Role | Contact | Availability |
|------|---------|-------------|
| On-call Engineer | PagerDuty rotation | 24/7 |
| DBA Lead | [Contact in internal directory] | Business hours + on-call |
| DevOps Lead | [Contact in internal directory] | Business hours + on-call |
| CTO | [Contact in internal directory] | Escalation only |
| DPO (Data Protection Officer) | [Contact in internal directory] | LGPD incidents |
| Legal | [Contact in internal directory] | Security breach only |

---

## Document References

| Document | Path | Purpose |
|----------|------|---------|
| Status Page Config | `docs/STATUS-PAGE.md` | Status page setup and component monitoring |
| WAF Configuration | `docs/WAF-CONFIGURATION.md` | WAF rules and security layer config |
| LGPD Audit | `AUDITORIA-LGPD-CONFORMIDADE.md` | LGPD compliance checklist |
| Data Transfer Policy | `docs/INTERNATIONAL-TRANSFER-POLICY.md` | International data transfer rules |
| Privacy Policy | `platform/backend/src/modules/legal/legal-content/privacy-policy.pt-BR.json` | User-facing privacy policy |
| Docker Compose | `platform/backend/docker-compose.yml` | Service definitions and health checks |
| Load Tests | `platform/backend/test/load/load-test.js` | k6 load test for performance validation |
| IP Rate Limiter | `platform/backend/src/common/guards/ip-rate-limit.guard.ts` | Application-level rate limiting |
| Health Controller | `platform/backend/src/modules/health/health.controller.ts` | Health, liveness, readiness, maintenance endpoints |
