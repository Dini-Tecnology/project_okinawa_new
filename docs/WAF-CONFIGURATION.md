# NOOWE Platform - WAF Configuration Guide

## Overview

This document details Web Application Firewall (WAF) configuration for the NOOWE API (`api.noowebr.com`). The backend is a NestJS application running on port 3000 with PostgreSQL, Redis, and WebSocket (Socket.IO) connections.

The WAF provides the first line of defense before requests reach the application-level rate limiter (`IpRateLimitGuard` in `platform/backend/src/common/guards/ip-rate-limit.guard.ts`).

---

## Recommended WAF Providers

| Provider | Best For | Pros | Cons |
|----------|----------|------|------|
| **AWS WAF** | AWS-hosted infrastructure | Native ALB/CloudFront integration, managed rules, auto-scaling | AWS lock-in, complex rule syntax |
| **Cloudflare WAF** | Any hosting, quick setup | Global CDN, DDoS protection included, generous free tier, easy UI | Third-party proxy, data may leave Brazil (LGPD consideration) |
| **nginx + ModSecurity** | Self-hosted / on-prem | Full control, LGPD-compliant (data stays on your infra), no recurring cost | Requires maintenance, manual rule updates |

**Recommendation:** For LGPD compliance and data sovereignty, use **nginx + ModSecurity** in front of the NestJS backend if self-hosted, or **AWS WAF** if deploying on AWS (sa-east-1 region). Use Cloudflare only with the "Data Localization Suite" to keep traffic processing in Brazil.

---

## Architecture

```
                                 ┌─────────────────────────┐
   Mobile App / Web              │         WAF Layer        │
   ──────────────────────►       │  (AWS WAF / Cloudflare   │
                                 │   / nginx+ModSecurity)   │
                                 └───────────┬─────────────┘
                                             │
                                             ▼
                                 ┌─────────────────────────┐
                                 │   Load Balancer / Proxy  │
                                 │     (ALB / nginx)        │
                                 └───────────┬─────────────┘
                                             │
                                             ▼
                                 ┌─────────────────────────┐
                                 │   NestJS Backend :3000   │
                                 │  ┌───────────────────┐   │
                                 │  │ IpRateLimitGuard  │   │
                                 │  │ (Redis-backed)    │   │
                                 │  └───────────────────┘   │
                                 └───────────┬─────────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              ▼              ▼              ▼
                         PostgreSQL       Redis         Socket.IO
                           :5432          :6379       (WebSocket)
```

---

## OWASP Core Rule Set (CRS) — Recommended Rules

The OWASP CRS should be deployed at **Paranoia Level 2** for a production API handling payment data. The following rule groups are essential:

### Required Rule Groups

| CRS Rule Group | ID Range | Purpose |
|----------------|----------|---------|
| **SQL Injection** | 942xxx | Detects SQL injection patterns in query params, body, headers |
| **XSS** | 941xxx | Detects cross-site scripting payloads |
| **Remote Code Execution** | 932xxx | Blocks OS command injection |
| **Local File Inclusion** | 930xxx | Prevents path traversal (e.g., `../../etc/passwd`) |
| **Remote File Inclusion** | 931xxx | Blocks remote file includes |
| **PHP Injection** | 933xxx | Blocks PHP-specific attacks (defense in depth) |
| **Java Injection** | 944xxx | Blocks Java deserialization attacks |
| **Session Fixation** | 943xxx | Detects session fixation attempts |
| **Scanner Detection** | 913xxx | Detects vulnerability scanners and bots |
| **Protocol Enforcement** | 920xxx | Enforces HTTP protocol standards |
| **Request Limits** | 920xxx | Limits request body/header size |

### CRS Exclusions for NOOWE

Some CRS rules will produce false positives with the NOOWE API. Add these exclusions:

```
# Allow JSON payloads (CRS may flag valid JSON as attacks)
SecRuleUpdateTargetById 942100 "!REQUEST_BODY"

# Allow WebSocket upgrade headers
SecRule REQUEST_HEADERS:Upgrade "@streq websocket" \
  "id:10001,phase:1,pass,nolog,ctl:ruleRemoveById=920420"

# Allow base64-encoded JWT tokens in Authorization header
SecRuleUpdateTargetById 942440 "!REQUEST_HEADERS:Authorization"

# Allow order notes field to contain special characters
SecRuleUpdateTargetById 941100 "!ARGS:notes"
SecRuleUpdateTargetById 942100 "!ARGS:notes"

# Allow AI pairing endpoint to receive free-text input
SecRule REQUEST_URI "@beginsWith /api/v1/ai/" \
  "id:10002,phase:1,pass,nolog,ctl:ruleRemoveById=941100,ctl:ruleRemoveById=942100"
```

---

## Rule Configuration

### 1. SQL Injection Protection

**AWS WAF:**
```json
{
  "Name": "NOOWE-SQLi-Protection",
  "Priority": 1,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesSQLiRuleSet"
    }
  },
  "Action": { "Block": {} },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "NOOWE-SQLi"
  }
}
```

**ModSecurity:**
```apache
# Enable OWASP CRS SQL injection rules
Include /etc/modsecurity/crs/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf

# Custom: Block SQL keywords in URL params
SecRule ARGS "@detectSQLi" \
  "id:100001,phase:2,deny,status:403,log,msg:'SQL injection attempt detected',tag:'NOOWE/SQLi'"
```

**Cloudflare:**
- Enable managed rule: "Cloudflare OWASP Core Ruleset" > SQL Injection rules
- Set action to "Block"
- Sensitivity: High

### 2. XSS Protection

**AWS WAF:**
```json
{
  "Name": "NOOWE-XSS-Protection",
  "Priority": 2,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesCommonRuleSet"
    }
  },
  "Action": { "Block": {} }
}
```

**ModSecurity:**
```apache
Include /etc/modsecurity/crs/rules/REQUEST-941-APPLICATION-ATTACK-XSS.conf

# Custom: Block script tags in all request parameters
SecRule ARGS "<script" \
  "id:100002,phase:2,deny,status:403,log,msg:'XSS attempt detected',tag:'NOOWE/XSS'"
```

### 3. Rate Limiting

The WAF rate limiter works as the **first layer** before the application-level `IpRateLimitGuard`. The WAF handles volumetric attacks; the guard handles per-endpoint granular limits.

| Endpoint Pattern | WAF Rate Limit | App Guard Limit | Purpose |
|------------------|---------------|-----------------|---------|
| `POST /api/v1/auth/login` | 20 req/min per IP | 10 req/60s (STRICT) | Brute-force prevention |
| `POST /api/v1/auth/register` | 5 req/min per IP | 10 req/60s (STRICT) | Registration abuse |
| `POST /api/v1/auth/forgot-password` | 5 req/min per IP | 10 req/60s (STRICT) | Email enumeration |
| `POST /api/v1/payments/*` | 30 req/min per IP | 100 req/60s (DEFAULT) | Payment abuse |
| `POST /api/v1/orders` | 60 req/min per IP | 100 req/60s (DEFAULT) | Order spam |
| `GET /api/v1/menu-items` | 300 req/min per IP | 100 req/60s (DEFAULT) | Scraping prevention |
| `ALL /api/v1/*` | 500 req/min per IP | 100 req/60s (DEFAULT) | General DDoS |

**AWS WAF Rate-Based Rule:**
```json
{
  "Name": "NOOWE-Auth-RateLimit",
  "Priority": 0,
  "Statement": {
    "RateBasedStatement": {
      "Limit": 20,
      "AggregateKeyType": "IP",
      "ScopeDownStatement": {
        "ByteMatchStatement": {
          "SearchString": "/api/v1/auth/",
          "FieldToMatch": { "UriPath": {} },
          "PositionalConstraint": "STARTS_WITH",
          "TextTransformations": [{ "Priority": 0, "Type": "LOWERCASE" }]
        }
      }
    }
  },
  "Action": { "Block": {} }
}
```

**ModSecurity:**
```apache
# Rate limit /auth/* endpoints: 20 requests per minute per IP
SecRule IP:auth_counter "@gt 20" \
  "id:100010,phase:1,deny,status:429,log,msg:'Auth rate limit exceeded',tag:'NOOWE/RateLimit'"

SecRule REQUEST_URI "@beginsWith /api/v1/auth/" \
  "id:100011,phase:1,pass,nolog,setvar:IP.auth_counter=+1,expirevar:IP.auth_counter=60"
```

### 4. Bot Detection

**AWS WAF:**
```json
{
  "Name": "NOOWE-BotControl",
  "Priority": 3,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesBotControlRuleSet",
      "ManagedRuleGroupConfigs": [{
        "AWSManagedRulesBotControlRuleSet": {
          "InspectionLevel": "TARGETED"
        }
      }]
    }
  },
  "Action": { "Block": {} }
}
```

**ModSecurity:**
```apache
# Block common vulnerability scanners
SecRule REQUEST_HEADERS:User-Agent "@pm nikto sqlmap nmap masscan dirbuster gobuster" \
  "id:100020,phase:1,deny,status:403,log,msg:'Scanner detected',tag:'NOOWE/Bot'"

# Block requests without User-Agent (except health checks)
SecRule REQUEST_URI "!@beginsWith /api/v1/health" \
  "chain,id:100021,phase:1,deny,status:403,log,msg:'Missing User-Agent'"
SecRule &REQUEST_HEADERS:User-Agent "@eq 0" ""
```

**Allowed Bot User-Agents (whitelist):**
```
# These should NOT be blocked:
# - Googlebot (for web indexing of the marketing site)
# - UptimeRobot / Pingdom (health monitoring)
# - k6/* (load testing - staging/dev only)
```

### 5. Geo-Blocking

NOOWE currently operates in Brazil. Restrict API access by geography:

**AWS WAF:**
```json
{
  "Name": "NOOWE-GeoBlock",
  "Priority": 5,
  "Statement": {
    "NotStatement": {
      "Statement": {
        "GeoMatchStatement": {
          "CountryCodes": ["BR", "US", "PT", "ES"]
        }
      }
    }
  },
  "Action": { "Block": {} }
}
```

**Allowed countries:**
| Code | Reason |
|------|--------|
| BR | Primary market (Brazil) |
| US | Cloud infrastructure, app store review |
| PT | Portuguese-speaking users |
| ES | Spanish-speaking users |

**Note:** Review and expand this list as the platform grows to new markets.

**Cloudflare:**
- Firewall Rules > Create Rule
- Expression: `not (ip.geoip.country in {"BR" "US" "PT" "ES"})`
- Action: Block

### 6. Admin Endpoint IP Whitelisting

Block access to administrative endpoints from non-whitelisted IPs:

**ModSecurity:**
```apache
# Only allow whitelisted IPs to access /admin and internal endpoints
SecRule REQUEST_URI "@rx ^/(admin|api/v1/internal)" \
  "chain,id:100030,phase:1,deny,status:403,log,msg:'Admin access from non-whitelisted IP'"
SecRule REMOTE_ADDR "!@ipMatch 10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,YOUR.OFFICE.IP.HERE"
```

**AWS WAF:**
```json
{
  "Name": "NOOWE-AdminIPWhitelist",
  "Priority": 0,
  "Statement": {
    "AndStatement": {
      "Statements": [
        {
          "ByteMatchStatement": {
            "SearchString": "/admin",
            "FieldToMatch": { "UriPath": {} },
            "PositionalConstraint": "STARTS_WITH",
            "TextTransformations": [{ "Priority": 0, "Type": "LOWERCASE" }]
          }
        },
        {
          "NotStatement": {
            "Statement": {
              "IPSetReferenceStatement": {
                "ARN": "arn:aws:wafv2:sa-east-1:ACCOUNT:regional/ipset/NOOWE-AdminIPs/ID"
              }
            }
          }
        }
      ]
    }
  },
  "Action": { "Block": {} }
}
```

---

## Integration with Existing Rate Limiter

The NOOWE backend already has a Redis-backed `IpRateLimitGuard` (`platform/backend/src/common/guards/ip-rate-limit.guard.ts`). The WAF and application guard complement each other:

### Defense Layers

```
Layer 1: WAF (Network Edge)
├── Blocks volumetric DDoS (thousands of req/s)
├── Blocks known-bad IPs, scanners, geo-restricted traffic
├── Rate limits at coarse granularity (per-IP, per-path-prefix)
└── Inspects payloads for SQLi, XSS, etc.

Layer 2: IpRateLimitGuard (Application)
├── Fine-grained per-endpoint rate limits
├── Redis-backed counters with sliding windows
├── Configurable via @IpRateLimit() and @StrictIpRateLimit() decorators
├── IP blocking with configurable duration (blockDurationSeconds)
├── Trusted proxy support (TRUSTED_PROXIES env var)
└── Returns X-RateLimit-* headers for client visibility
```

### Configuration Alignment

Ensure the WAF rate limits are **higher** than the application guard limits. The WAF catches volumetric abuse; the guard enforces business rules:

```
WAF limit for /auth/*:    20 req/min per IP  (blocks brute-force bots)
App guard for /auth/*:    10 req/60s per IP  (enforces login attempt policy)
                          ↓
WAF fires first for high-volume attacks (> 20/min)
App guard fires for slower attacks (> 10/min but < 20/min)
```

### Response Headers

The `IpRateLimitGuard` sets these headers on every response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1711500000
```

Configure the WAF to **not strip** these headers, so mobile clients can implement client-side throttling.

---

## WebSocket Considerations

NOOWE uses Socket.IO for 8 real-time gateways (orders, tabs, club-queue, reservations, events, approvals, waitlist, calls). WAF must be configured to support WebSocket:

1. **Allow WebSocket Upgrade:** Do not block requests with `Connection: Upgrade` and `Upgrade: websocket` headers.
2. **Exclude WebSocket from body inspection:** Socket.IO frames are not HTTP request bodies.
3. **Rate limit WebSocket connections** (not messages) per IP: limit to 10 new connections per minute.

**nginx configuration for WebSocket passthrough:**
```nginx
location /socket.io/ {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 86400;  # 24h for long-lived connections
}
```

---

## Request Size Limits

Configure appropriate request body size limits:

| Endpoint Pattern | Max Body Size | Reason |
|------------------|---------------|--------|
| `POST /api/v1/auth/*` | 8 KB | Login/register payloads are small |
| `POST /api/v1/orders` | 64 KB | Orders with many items and customizations |
| `POST /api/v1/ai/*` | 16 KB | AI pairing prompts |
| `POST /api/v1/menu-items` (with image) | 10 MB | Menu item creation with image upload |
| `ALL /api/v1/*` (default) | 1 MB | General limit |

**ModSecurity:**
```apache
# Default body limit: 1MB
SecRequestBodyLimit 1048576

# Larger limit for image uploads
SecRule REQUEST_URI "@beginsWith /api/v1/menu-items" \
  "id:100040,phase:1,pass,nolog,ctl:requestBodyLimit=10485760"
```

---

## Monitoring and Alerting

### Metrics to Monitor

| Metric | Threshold | Alert Level | Action |
|--------|-----------|-------------|--------|
| Blocked requests / min | > 100 | Warning | Review attack patterns |
| Blocked requests / min | > 1000 | Critical | Potential DDoS, review WAF logs |
| SQLi detections / hour | > 10 | Critical | Investigate source IPs, notify security |
| Rate limit triggers / min | > 50 | Warning | Check for bot activity |
| 4xx error rate | > 5% | Warning | Review false positive rules |
| False positive rate | > 1% | Warning | Tune CRS exclusions |

### AWS WAF Monitoring

```bash
# CloudWatch dashboard for WAF metrics
aws cloudwatch get-metric-statistics \
  --namespace "AWS/WAFV2" \
  --metric-name "BlockedRequests" \
  --dimensions Name=WebACL,Value=NOOWE-Production-WAF \
  --start-time $(date -u -d '-1 hour' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### Log Integration

WAF logs should be sent to a centralized logging system:

1. **AWS WAF** -> CloudWatch Logs / S3 -> Athena for analysis
2. **Cloudflare** -> Logpush -> S3 / Elasticsearch
3. **ModSecurity** -> `/var/log/modsec_audit.log` -> Filebeat -> Elasticsearch

**Recommended log retention:** 90 days for compliance, 30 days for hot analysis.

### Alerting Channels

| Alert Level | Channel | Recipients |
|-------------|---------|------------|
| Info | Slack #infra-alerts | DevOps team |
| Warning | Slack #infra-alerts + email | DevOps + backend lead |
| Critical | Slack + PagerDuty | On-call engineer |

---

## Deployment Checklist

- [ ] Deploy WAF in **monitor mode** (log only) for 7 days before enabling block mode
- [ ] Review false positives from monitor mode logs
- [ ] Add CRS exclusions for known false positives (see "CRS Exclusions for NOOWE" above)
- [ ] Verify WebSocket connections work through the WAF
- [ ] Verify all 8 Socket.IO namespaces connect successfully
- [ ] Confirm `X-RateLimit-*` headers pass through the WAF
- [ ] Test mobile app (client + restaurant) through WAF
- [ ] Load test with k6 through WAF (see `platform/backend/test/load/load-test.js`)
- [ ] Set up CloudWatch / Grafana dashboard for WAF metrics
- [ ] Configure alerting thresholds
- [ ] Document whitelisted IPs for admin access
- [ ] Verify TRUSTED_PROXIES env var includes WAF/proxy IPs

---

## Maintenance

- **Monthly:** Review blocked request logs for false positives
- **Quarterly:** Update OWASP CRS to latest version
- **On deploy:** Verify new endpoints do not trigger false positives
- **On incident:** Review WAF logs as part of incident response (see `docs/DISASTER-RECOVERY.md`)
