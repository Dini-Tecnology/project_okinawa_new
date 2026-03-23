# Anti-Fraud QR Pattern (Club/Event Service Type)

> Reference documentation for the existing anti-fraud QR implementation in the club module.

---

## Overview

The club service type (`/backend/src/modules/club/`) includes a comprehensive anti-fraud QR code system used for entry tickets, VIP table reservations, wristbands, promoter tracking, and check-in/check-out. This document explains the pattern so future developers can understand and extend it.

---

## Architecture

### Key Files

| File | Responsibility |
|---|---|
| `qr-code.service.ts` | Core service: generation, validation, marking as used |
| `qr-code.controller.ts` | REST endpoints for QR operations |
| `queue.gateway.ts` | WebSocket gateway for real-time queue/entry events |
| `club-entries.service.ts` | Business logic for entry management |

### Flow Diagram

```
1. GENERATE (Server-side)
   QrCodeService.generateEntryQrCode(data)
     -> Creates JSON payload with: entryId, userId, restaurantId, eventDate, type, quantity, expiry, timestamp
     -> Signs payload with HMAC-SHA256 (truncated to 16 chars)
     -> Base64-encodes { payload, signature }
     -> Returns { qrCode (human-readable), qrPayload (full base64) }

2. PRESENT (Client-side)
   User shows QR code on mobile screen at venue entry

3. VALIDATE (Server-side)
   QrCodeService.validateQrPayload(qrPayload)
     -> Base64-decodes
     -> Verifies HMAC signature matches
     -> Checks expiration (eventDate + 30h default)
     -> Checks single-use via in-memory map (or Redis in production)
     -> Returns { valid, data, error }

4. MARK USED (Server-side)
   QrCodeService.markAsUsed(entryId, type)
     -> Stores in validatedCodes map
     -> Prevents re-use of the same code
```

---

## Anti-Fraud Mechanisms

### 1. Cryptographic Signature (HMAC-SHA256)

Every QR payload is signed with a server-side secret key (`QR_SECRET_KEY` env variable). The signature is generated using Node's `crypto.createHmac('sha256', secret)` and truncated to 16 hex characters.

**Why:** Prevents forging or tampering with QR payloads. Even if someone captures a QR code, they cannot modify the embedded data (userId, quantity, entry type) without invalidating the signature.

### 2. Single-Use Enforcement

The service maintains a `validatedCodes` Map (in-memory; Redis recommended for production) that tracks which entry IDs have been consumed. Once `markAsUsed()` is called, subsequent validation attempts return `{ valid: false, error: 'QR code already used' }`.

**Production note:** Replace the in-memory Map with a Redis set using `SISMEMBER`/`SADD` for horizontal scaling. Recommended TTL: 35 seconds for rapid re-scan prevention, or match event duration for full lifecycle tracking.

### 3. Time-Based Expiration

Each QR code has an `expiresAt` timestamp (default: event date + 30 hours, i.e. next day 6 AM). Validation rejects expired codes even if they were never used.

### 4. Unique Entry IDs

Each entry gets a cryptographically random 24-char hex ID (`crypto.randomBytes(12).toString('hex')`), making collision practically impossible.

---

## QR Code Types

| Type | Prefix | Purpose |
|---|---|---|
| `ticket` | `TK-` | Standard entry ticket |
| `guest_list` | `GL-` | Guest list entry (free/discounted) |
| `birthday` | `BD-` | Birthday party entry |
| `vip_table` | `VT-` | VIP table reservation entry |
| `check_in` | `CI-` | Session check-in tracking |
| `wristband` | `WB-` | Wristband for in-venue purchases |
| `promoter` | (code) | Promoter referral tracking |

---

## WebSocket Events (Queue Gateway)

The `QueueGateway` (`/queue` namespace) provides real-time events:

| Event | Direction | Description |
|---|---|---|
| `joinQueueRoom` | Client -> Server | Subscribe to a restaurant's queue |
| `queueUpdate` | Server -> Client | Broadcast updated queue state |
| `positionUpdate` | Server -> Client | Individual user position change |
| `called` | Server -> Client | "Your turn" notification |
| `statsUpdate` | Server -> Client | Queue stats for staff |

**Room pattern:** `queue:{restaurantId}` for general, `queue:{restaurantId}:user:{userId}` for individual.

---

## Wristband Purchase Flow

For clubs with consumption credits, the wristband QR includes:

- `color` (wristband tier)
- `vip` level (0-5)
- `credit` (pre-loaded consumption credit in BRL)

Validation for purchases uses `validateWristbandForPurchase(qrPayload, amount)` which checks the wristband is valid and (in production) deducts from the user's credit balance.

---

## Batch Generation

For bulk ticket sales, `generateBatchQrCodes(baseData, count)` creates N unique QR codes in a single call, each with its own entry ID. Used by event promoters and box office.

---

## Monitoring

`getValidationStats()` returns:

- `totalValidated`: count of all consumed codes
- `byType`: breakdown by entry type
- `recentValidations`: last 20 validations with timestamps

---

## Extension Points

To add anti-fraud QR to a new service type:

1. Reuse `QrCodeService` (already exported from the club module)
2. Define new entry types in `generateShortCode` prefixes
3. Add Redis-backed storage for production scale
4. Implement TTL-based nonce if sub-minute re-scan prevention is needed (recommended: 35s TTL in Redis)

---

## Dependencies

- `crypto` (Node.js built-in) for HMAC and random bytes
- Redis (production) for distributed single-use enforcement
- Socket.IO (`queue.gateway.ts`) for real-time queue/entry events
