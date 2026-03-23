# EPIC 13 — Club / Balada Frontend

> Frontend mobile screens for the NOOWE Club (balada) module.
> Backend ClubModule is **ALREADY COMPLETE** with 11 controllers.
> Version: 1.0 | Date: 2026-03-23

---

## 1. Overview

This epic implements the customer-facing and restaurant staff-facing mobile screens for the Club/Balada service type. The backend module (`/backend/src/modules/club/`) provides 11 controllers covering:

| Controller | Route Prefix | Purpose |
|---|---|---|
| `ClubEntriesController` | `/club-entries` | Ticket purchase, validation, check-in/out |
| `QrCodeController` | `/qr-codes` | Anti-fraud QR generation, validation, batch |
| `QueueController` | `/queue` | Virtual queue join, position, call-next |
| `QueueGateway` | WS `/queue` | Real-time queue position updates |
| `VipTableReservationsController` | `/table-reservations` | VIP table booking, guest invites |
| `VipTableTabsController` | `/table-tabs` | VIP table consumption tabs |
| `LineupController` | `/lineup` | Event lineup / artist schedule |
| `BirthdayEntryController` | `/birthday-entries` | Birthday celebration entries |
| `PromoterController` | `/promoters` | Promoter registration, sales, commissions |
| `GuestListController` | `/guest-list` | Guest list entries and validation |
| `OccupancyController` | `/occupancy` | Real-time venue occupancy tracking |

---

## 2. User Stories

### Customer (Client App)

| ID | Story | Screen |
|---|---|---|
| US-13.01 | As a customer, I want to see club events so I can plan my night out | ClubHomeScreen |
| US-13.02 | As a customer, I want to buy entry tickets with type selection so I can enter the venue | TicketPurchaseScreen |
| US-13.03 | As a customer, I want to join a virtual queue and track my position in real-time | ClubQueueScreen |
| US-13.04 | As a customer, I want to reserve a VIP table and see the floor map | VipTableScreen |
| US-13.05 | As a customer, I want to see the event lineup with artist schedule | LineupScreen |
| US-13.06 | As a customer, I want to request a birthday celebration entry | BirthdayEntryRequestScreen |

### Door Staff (Restaurant App)

| ID | Story | Screen |
|---|---|---|
| US-13.07 | As door staff, I want to scan QR codes to validate entries and track admissions | DoorControlScreen |

### Queue Manager (Restaurant App)

| ID | Story | Screen |
|---|---|---|
| US-13.08 | As queue manager, I want to manage the virtual queue, call people, and mark admissions | ClubQueueManagementScreen |

### VIP Manager (Restaurant App)

| ID | Story | Screen |
|---|---|---|
| US-13.09 | As VIP manager, I want to manage table statuses, tabs, and minimum consumption | VipTableManagementScreen |

### Promoter (Restaurant App)

| ID | Story | Screen |
|---|---|---|
| US-13.10 | As a manager, I want to see promoter performance and manage guest lists | PromoterManagementScreen |

---

## 3. Screen Specifications

### 3.1 ClubHomeScreen (Client)

**Path:** `/mobile/apps/client/src/screens/club/ClubHomeScreen.tsx`

**Description:** Entry point for the club module. Displays active events with cards showing event details and action buttons.

**API Endpoints:**
- `GET /lineup/restaurant/:restaurantId/upcoming` — Get upcoming events/lineups

**UI Components:**
- Event cards: name, date, DJ/artist info, cover charge, availability status
- CTAs: "Comprar Ingresso", "Entrar na Fila", "Ver Lineup"
- Pull-to-refresh
- Empty state when no events

**Acceptance Criteria:**
- [ ] Shows list of upcoming events from backend
- [ ] Each event card displays name, date, artist, cover charge
- [ ] Status badges: available / sold-out
- [ ] "Comprar Ingresso" navigates to TicketPurchaseScreen
- [ ] "Entrar na Fila" navigates to ClubQueueScreen
- [ ] "Ver Lineup" navigates to LineupScreen
- [ ] All strings via `t()` i18n
- [ ] Uses `useColors()` theme tokens
- [ ] Loading skeleton while fetching

### 3.2 TicketPurchaseScreen (Client)

**Path:** `/mobile/apps/client/src/screens/club/TicketPurchaseScreen.tsx`

**Description:** Ticket purchase flow with type selection, quantity, price summary, and QR code display on success.

**API Endpoints:**
- `POST /club-entries` — Purchase entry tickets
- `POST /qr-codes/generate/entry` — Generate anti-fraud QR after purchase

**UI Components:**
- Event details header
- Ticket type selector: Normal / VIP / Aniversariante
- Quantity selector (1-4)
- Price summary
- Payment CTA (navigates to payment flow)
- On success: animated anti-fraud QR code display

**Acceptance Criteria:**
- [ ] Event details header with name and date
- [ ] Ticket type segmented buttons (Normal / VIP / Birthday)
- [ ] Quantity selector with +/- buttons, max 4
- [ ] Dynamic price calculation
- [ ] POST to `/club-entries` on purchase
- [ ] On success, displays anti-fraud QR code
- [ ] All strings via `t()` i18n

### 3.3 ClubQueueScreen (Client)

**Path:** `/mobile/apps/client/src/screens/club/ClubQueueScreen.tsx`

**Description:** Real-time virtual queue position tracker with WebSocket updates and anti-fraud QR for door scan.

**API Endpoints:**
- `POST /queue` — Join queue
- `GET /queue/my?restaurantId=` — Get my position
- `DELETE /queue/my?restaurantId=` — Leave queue
- WS `/queue` namespace — Real-time position updates

**WebSocket Events:**
- Emit: `joinQueueRoom` (restaurantId), `subscribeToMyPosition` ({ restaurantId, userId })
- Listen: `positionUpdate`, `called`

**UI Components:**
- Large animated position number
- Estimated wait time display
- "Ja estou na porta" button (active when position = 1)
- Anti-fraud QR code for door scan
- Leave queue button

**Acceptance Criteria:**
- [ ] Connects to ClubQueueGateway (`/queue` namespace)
- [ ] Displays animated position number
- [ ] Shows estimated wait time
- [ ] "Ja estou na porta" button enabled at position 1
- [ ] QR code display with nonce-based anti-fraud
- [ ] Haptic feedback on position change
- [ ] Real-time via WebSocket
- [ ] All strings via `t()` i18n

### 3.4 VipTableScreen (Client)

**Path:** `/mobile/apps/client/src/screens/club/VipTableScreen.tsx`

**Description:** VIP table reservation with simplified floor grid and reservation form.

**API Endpoints:**
- `GET /table-reservations/restaurant/:restaurantId/event/:date` — Available tables
- `POST /table-reservations` — Create reservation

**UI Components:**
- Floor grid of VIP tables with status indicators
- Table cards: number, capacity, minimum consumption, status
- "Reservar Mesa VIP" CTA
- Reservation form: date, party size, contact, special requests

**Acceptance Criteria:**
- [ ] Grid layout of VIP tables
- [ ] Color-coded status: available (green), reserved (yellow), occupied (red)
- [ ] Table detail card on tap
- [ ] Reservation form with validation
- [ ] POST to `/table-reservations` on submit
- [ ] Confirmation screen on success
- [ ] All strings via `t()` i18n

### 3.5 LineupScreen (Client)

**Path:** `/mobile/apps/client/src/screens/club/LineupScreen.tsx`

**Description:** Timeline display of event artists with schedule and details.

**API Endpoints:**
- `GET /lineup/restaurant/:restaurantId/date/:date` — Event lineup
- `GET /lineup/restaurant/:restaurantId/now-playing` — Currently playing

**UI Components:**
- Timeline of artists: name, genre, time slot, stage
- Artist card with avatar placeholder
- "Now Playing" indicator
- "Adicionar ao calendario" button

**Acceptance Criteria:**
- [ ] Timeline view of artists ordered by time
- [ ] Each slot: artist name, genre tag, time range, stage name
- [ ] Now-playing highlight
- [ ] Calendar integration button
- [ ] All strings via `t()` i18n

### 3.6 BirthdayEntryRequestScreen (Client)

**Path:** `/mobile/apps/client/src/screens/club/BirthdayEntryRequestScreen.tsx`

**Description:** Birthday celebration entry request form.

**API Endpoints:**
- `POST /birthday-entries` — Request birthday entry
- `GET /birthday-entries/me` — Get my birthday entries

**UI Components:**
- Form: birthday person name, DOB, party size, contact, special requests
- Celebration type selector: Standard / VIP
- Submit button
- Confirmation screen with reference number

**Acceptance Criteria:**
- [ ] Form with all required fields
- [ ] Date of birth picker
- [ ] Celebration type segmented buttons
- [ ] Field validation
- [ ] POST to `/birthday-entries` on submit
- [ ] Confirmation with reference number
- [ ] All strings via `t()` i18n

### 3.7 DoorControlScreen (Restaurant)

**Path:** `/mobile/apps/restaurant/src/screens/club/DoorControlScreen.tsx`

**Description:** Door staff QR scanning and entry validation.

**API Endpoints:**
- `POST /qr-codes/validate` — Validate QR payload
- `POST /qr-codes/use/:entryId` — Mark as used (check-in)
- `GET /occupancy/restaurant/:restaurantId/current` — Current occupancy

**UI Components:**
- QR Scanner button (opens camera)
- Scan result display: VALID (green) / INVALID (red) / ALREADY USED (orange)
- Guest info card on valid scan
- Admission counter: X admitted / X total capacity
- Manual search fallback

**Acceptance Criteria:**
- [ ] QR scanner opens camera
- [ ] Validates QR via POST `/qr-codes/validate`
- [ ] Color-coded result: green=valid, red=invalid, orange=already used
- [ ] Guest info card: name, ticket type, birthday flag
- [ ] Auto marks as used via POST `/qr-codes/use/:entryId`
- [ ] Admission counter from occupancy endpoint
- [ ] Manual search by name/ID
- [ ] Haptic feedback on scan result
- [ ] All strings via `t()` i18n

### 3.8 ClubQueueManagementScreen (Restaurant)

**Path:** `/mobile/apps/restaurant/src/screens/club/ClubQueueManagementScreen.tsx`

**Description:** Staff queue management with live list and admission controls.

**API Endpoints:**
- `GET /queue/restaurant/:restaurantId` — Get queue
- `GET /queue/restaurant/:restaurantId/stats` — Queue statistics
- `POST /queue/restaurant/:restaurantId/call-next` — Call next person
- `PUT /queue/:id/confirm-entry` — Confirm entry (admitted)
- `PUT /queue/:id/no-show` — Mark no-show
- WS `/queue` — Real-time queue updates

**UI Components:**
- Live queue FlatList ordered by position
- Entry card: position badge, name, party size, wait time, ticket type
- "Chamar" (call next) button
- "Entrou" and "No-show" action buttons
- Stats header: total in queue, avg wait, called count

**Acceptance Criteria:**
- [ ] Real-time queue list via WebSocket
- [ ] Position badges with proper ordering
- [ ] "Chamar" calls next via API
- [ ] "Entrou" confirms via PUT `/queue/:id/confirm-entry`
- [ ] "No-show" marks via PUT `/queue/:id/no-show`
- [ ] Stats display: total, average wait, called
- [ ] All strings via `t()` i18n

### 3.9 VipTableManagementScreen (Restaurant)

**Path:** `/mobile/apps/restaurant/src/screens/club/VipTableManagementScreen.tsx`

**Description:** Staff VIP table management with status grid and tab tracking.

**API Endpoints:**
- `GET /table-reservations/restaurant/:restaurantId/event/:date` — Event reservations
- `POST /table-tabs/reservation/:reservationId/open` — Open tab
- `PUT /table-tabs/:id/close` — Close tab
- `GET /table-tabs/:id/summary` — Tab summary with minimum consumption tracker

**UI Components:**
- Grid of VIP tables with status indicators
- Table card: number, reservation name, party size, min consumption, elapsed time
- Action buttons: Open tab, Close tab, Mark no-show, Transfer
- Minimum consumption tracker per table

**Acceptance Criteria:**
- [ ] Grid layout with color-coded status
- [ ] Tap table shows detail card
- [ ] Open/close tab functionality
- [ ] Minimum consumption progress bar
- [ ] All strings via `t()` i18n

### 3.10 PromoterManagementScreen (Restaurant)

**Path:** `/mobile/apps/restaurant/src/screens/club/PromoterManagementScreen.tsx`

**Description:** Promoter performance dashboard and guest list management.

**API Endpoints:**
- `GET /promoters/restaurant/:restaurantId` — List promoters
- `GET /promoters/:id/dashboard` — Promoter dashboard stats
- `GET /guest-list/restaurant/:restaurantId/event/:date` — Event guest list
- `GET /guest-list/promoter/:promoterId/stats` — Promoter stats

**UI Components:**
- Promoter FlatList with performance metrics
- Each promoter: name, confirmed count, check-ins, conversion %
- Tap to see promoter guest list with check-in status
- Add/remove guest actions

**Acceptance Criteria:**
- [ ] List of promoters with performance stats
- [ ] Conversion percentage calculation
- [ ] Drill-down to promoter guest list
- [ ] Guest check-in status indicators
- [ ] All strings via `t()` i18n

---

## 4. Anti-Fraud QR Pattern

Reference: `/docs/service-types/ANTIFRAUD_QR_PATTERN.md`

### How It Works

1. **Generation (Server-side):** `QrCodeService.generateEntryQrCode(data)` creates a JSON payload containing `entryId`, `userId`, `restaurantId`, `eventDate`, `type`, `quantity`, `expiry`, `timestamp`. The payload is signed with HMAC-SHA256 (truncated to 16 hex chars) and Base64-encoded.

2. **Presentation (Client-side):** The user displays the QR code on their mobile screen. The QR payload is the full Base64-encoded string returned by the server.

3. **Validation (Server-side):** `QrCodeService.validateQrPayload(qrPayload)` decodes, verifies the HMAC signature, checks expiration (`eventDate + 30h`), and checks single-use enforcement via an in-memory Map (Redis in production).

4. **Mark Used (Server-side):** `QrCodeService.markAsUsed(entryId, type)` stores in the `validatedCodes` map, preventing re-use.

### QR Code Types

| Type | Prefix | Usage |
|---|---|---|
| `ticket` | `TK-` | Standard entry ticket |
| `guest_list` | `GL-` | Guest list entry |
| `birthday` | `BD-` | Birthday party entry |
| `vip_table` | `VT-` | VIP table reservation |
| `check_in` | `CI-` | Session check-in |
| `wristband` | `WB-` | In-venue purchases |
| `promoter` | (code) | Promoter referral tracking |

### WebSocket Events (Queue Gateway)

Namespace: `/queue`

| Event | Direction | Description |
|---|---|---|
| `joinQueueRoom` | Client -> Server | Subscribe to restaurant queue room |
| `leaveQueueRoom` | Client -> Server | Unsubscribe from queue room |
| `subscribeToMyPosition` | Client -> Server | Subscribe to personal position updates |
| `queueUpdate` | Server -> Client | Full queue state broadcast |
| `positionUpdate` | Server -> Client | Individual position change |
| `called` | Server -> Client | "Your turn" notification |
| `statsUpdate` | Server -> Client | Queue stats for staff |

Room pattern: `queue:{restaurantId}` (general), `queue:{restaurantId}:user:{userId}` (individual).

---

## 5. i18n Keys

All keys added to `pt-BR.ts`, `en-US.ts`, and `es-ES.ts` under the `club` namespace:

```typescript
club: {
  title: '...',
  events: '...',
  queue: '...',
  vipTable: '...',
  lineup: '...',
  birthday: '...',
  noEvents: '...',
  buyTicket: '...',
  joinQueue: '...',
  viewLineup: '...',
  soldOut: '...',
  available: '...',
  coverCharge: '...',
  ticket: {
    normal: '...',
    vip: '...',
    birthday: '...',
    type: '...',
    quantity: '...',
    price: '...',
    total: '...',
    purchase: '...',
    purchaseSuccess: '...',
    showQr: '...',
  },
  queue: {
    position: '...',
    estimated: '...',
    atDoor: '...',
    myQr: '...',
    joining: '...',
    joined: '...',
    leave: '...',
    leaveConfirm: '...',
    yourTurn: '...',
    waitTime: '...',
    total: '...',
    avgWait: '...',
    called: '...',
    callNext: '...',
    admitted: '...',
    noShow: '...',
    partySize: '...',
  },
  vip: {
    table: '...',
    minConsumption: '...',
    reserve: '...',
    capacity: '...',
    status: { ... },
    reservationForm: { ... },
    openTab: '...',
    closeTab: '...',
    transfer: '...',
    elapsed: '...',
    tabSummary: '...',
  },
  lineup: {
    timeline: '...',
    nowPlaying: '...',
    addToCalendar: '...',
    stage: '...',
    genre: '...',
    noLineup: '...',
  },
  birthday: {
    title: '...',
    personName: '...',
    dateOfBirth: '...',
    partySize: '...',
    contact: '...',
    specialRequests: '...',
    celebrationType: '...',
    standard: '...',
    vip: '...',
    submit: '...',
    confirmation: '...',
    referenceNumber: '...',
  },
  door: {
    scan: '...',
    valid: '...',
    invalid: '...',
    alreadyUsed: '...',
    admitted: '...',
    capacity: '...',
    manualSearch: '...',
    scanResult: '...',
    guestInfo: '...',
    tonight: '...',
  },
  promoter: {
    title: '...',
    guestList: '...',
    checkIns: '...',
    confirmed: '...',
    conversion: '...',
    addGuest: '...',
    removeGuest: '...',
    noPromoters: '...',
  },
}
```

---

## 6. Navigation

### Client App

Added to `MainStack` in `/mobile/apps/client/src/navigation/index.tsx`:

- `ClubHome` -> `ClubHomeScreen`
- `TicketPurchase` -> `TicketPurchaseScreen`
- `ClubQueue` -> `ClubQueueScreen`
- `VipTable` -> `VipTableScreen`
- `Lineup` -> `LineupScreen`
- `BirthdayEntryRequest` -> `BirthdayEntryRequestScreen`

### Restaurant App

Added to `MainDrawer` in `/mobile/apps/restaurant/src/navigation/index.tsx`:

- `DoorControl` -> `DoorControlScreen` (Drawer item)
- `ClubQueueManagement` -> `ClubQueueManagementScreen` (Drawer item)
- `VipTableManagement` -> `VipTableManagementScreen` (Drawer item)
- `PromoterManagement` -> `PromoterManagementScreen` (Drawer item)

---

## 7. Definition of Done (DoD) Checklist

- [ ] All 10 screens implemented and rendering correctly
- [ ] TypeScript strict mode, no `any` in component props
- [ ] All strings via `t()` function (no hardcoded strings)
- [ ] i18n keys added to PT-BR, EN-US, ES-ES
- [ ] `useColors()` theme tokens used (no hardcoded colors except status indicators)
- [ ] API calls using `ApiService` with proper error handling
- [ ] WebSocket integration via Socket.IO for queue screens
- [ ] Anti-fraud QR pattern implemented per ANTIFRAUD_QR_PATTERN.md
- [ ] Navigation registered in both client and restaurant apps
- [ ] Loading skeletons on all list screens
- [ ] Pull-to-refresh on all list screens
- [ ] Empty states with i18n messages
- [ ] Haptic feedback on QR scan and queue position changes
- [ ] Accessibility labels on interactive elements
