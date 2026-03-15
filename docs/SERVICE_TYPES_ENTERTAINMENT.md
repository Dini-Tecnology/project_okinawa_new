# Service Types: Entertainment (Pub & Bar, Club & Balada)

## Overview

This document specifies the two entertainment-focused service types, mapped against the universal 10-stage service blueprint and the 40 industry pain points that NOOWE solves.

| Code | Name | Description |
|------|------|-------------|
| `pub_bar` | Pub & Bar | Social venue focused on drinks, rounds, and group tabs |
| `club` | Club & Balada | Nightlife venue with events, tickets, VIP tables, and bottle service |

---

## Universal Service Blueprint — 10 Stages

Every service type follows this journey. The stages below describe how each maps to Pub & Bar and Club & Balada specifically.

### Stage 1: DISCOVERY (Descoberta)

**Client action:** Decides to go out. Asks: Where? Will it be crowded? How much? What's happening tonight?

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Nearby bars, occupancy level, tap list, happy hour status, avg ticket, friends present | Events tonight, lineup, ticket prices, lot status, occupancy, friends going |
| Backstage | Venue pushes: occupancy, availability, events, menu | Venue pushes: event details, lineup, ticket lots, capacity |
| Pain points solved | #1 wait to be served, #3 unknown wait time, #8 unknown prices | #3 unknown wait time, #8 unknown prices, #38 event promotion |
| Innovation | Smart discovery: suggestions based on time, weather, profile, friends nearby | Social proof: friends going, trending events, genre-based filtering |

### Stage 2: DECISION / RESERVATION (Decisão / Reserva)

**Client action:** Decides to go. May reserve a table/spot or buy a ticket.

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Reserve table (optional), join digital queue, see wait estimate | Buy ticket (lot pricing), enter guest/promoter list, birthday request, reserve VIP table |
| Backstage | Venue receives: reservation, group size, ETA | Venue receives: ticket sale, guest list entry, VIP reservation + deposit |
| Pain points solved | #2 disorganized queue, #16 chaotic queue, #17 lost clients from waiting | #2 queue, #16 chaos, #30 revenue predictability |
| Innovation | Predictive queue: estimated wait time based on historical patterns | Tiered pricing, promoter/birthday flows, VIP deposit as consumption credit |

### Stage 3: ARRIVAL (Chegada)

**Client action:** Arrives at the venue.

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Check-in: scan QR at table → tab opens automatically, card pre-authorized | Check-in: scan ticket QR at door → entry validated, digital tab opens |
| Backstage | System: confirms arrival, opens digital tab, assigns table, applies cover credit | System: validates ticket, records entry, opens tab, applies entry credit |
| Pain points solved | #15 table management, #19 order errors, #20 lost physical tabs | #29 leaving without paying, #22 internal fraud |
| Innovation | Digital host: reduces need for human reception. Cover charge auto-converts to consumption credit | Anti-fraud animated QR, automatic credit application from ticket price |

### Stage 4: TABLE / VENUE OCCUPATION (Ocupação)

**Client action:** Sits down (bar) or enters venue (club). Wants to see menu and order.

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Digital menu: tap list with ABV/IBU, drinks, food. Photos, descriptions, recommendations | Quick drink menu for floor ordering, bottle service menu for VIP, DJ-curated suggestions |
| Backstage | Menu synced with POS: availability, pricing, happy hour rules | Menu synced: bottle availability, pricing, minimum spend rules |
| Pain points solved | #4 confusing menu, #8 price transparency, #5 waiter doesn't appear | #4 menu, #8 prices, #25 low average ticket |
| Innovation | Dynamic menu: happy hour auto-pricing, trending items, smart combos | DJ-curated bottle suggestions, minimum spend tracker visibility |

### Stage 5: ORDER (Pedido)

**Client action:** Orders drinks, food, rounds (bar) or drinks from floor/bottles (club).

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Order from phone: select item → assign to person → send to bar. Status: received → preparing → ready | Floor order: quick menu → select → nearest bar pickup. VIP: bottle service with included mixers |
| Backstage | Order routed to bar/kitchen KDS. Each item tracked to individual on the tab | Order routed to nearest bar. VIP orders to dedicated waiter. Items counted toward minimum spend |
| Pain points solved | #1 waiting, #5 waiter absent, #6 wrong order, #11 human error | #1 waiting, #5 absent service, #11 errors, #12 overloaded staff |
| Innovation | Smart ordering: AI suggestions for harmonization, combos. Individual tracking per person | Floor ordering without leaving dance floor, pickup notification |

### Stage 6: CONTINUOUS CONSUMPTION (Consumo Contínuo)

**This stage is massive in bars and clubs.**

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Quick actions: repeat last order, round for the table (everyone picks their drink), call waiter (for help, NOT for bill) | Quick reorder, bottle service, minimum spend progress bar, add items from floor |
| Backstage | Bar receives orders continuously. System tracks per-person consumption | VIP tab tracks against minimum spend. Floor orders aggregated |
| Pain points solved | #7 difficulty repeating, #5 waiter absent, #12 overloaded staff | #7 repeating, #25 low ticket, #26 low combo sales |
| Innovation | One-tap rounds: host picks drinks for everyone, or each person picks their own | Real-time minimum spend tracker with visual progress |

### Stage 7: THE BILL (Conta)

**Client action:** Wants to know how much was spent.

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Live tab: real-time total, per-person breakdown, each item tracked with who ordered it and when | Consumption summary: total spent vs minimum, credits applied (entry + deposit), per-person breakdown |
| Backstage | System consolidates all tab items by person | System consolidates VIP tab + floor orders, applies credits |
| Pain points solved | #14 slow bill closure, #19 tab errors, #21 billing errors | #14 slow closure, #21 billing, #29 leaving without paying |
| Innovation | Transparent real-time bill — no surprises at the end of the night | Automatic credit application, minimum spend fulfillment visibility |

### Stage 8: BILL SPLITTING (Divisão)

**Client action:** Split the bill. Biggest pain point in groups.

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Split options: by consumption (each pays what they ordered), equal split, selective split (pick items), fixed amount | VIP split: by consumption among table guests, equal among group, host covers remainder |
| Backstage | System recalculates per-person amounts. Shared items (table items) divided equally | System recalculates including minimum spend obligation |
| Pain points solved | #9 difficulty splitting, #14 slow payment, #21 billing errors | #9 splitting, #14 slow, #21 errors |
| Innovation | Automatic split by consumption — each person sees exactly what they owe | Smart minimum split: distributes remaining minimum obligation fairly |

### Stage 9: PAYMENT (Pagamento)

**Client action:** Pay and leave.

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Pay in-app: card (pre-authorized), PIX. Cover credit applied automatically | Pay in-app: card, PIX. Credits from entry ticket + VIP deposit applied automatically |
| Backstage | Payment processed, pre-auth settled or released, tab closed | Payment processed, VIP deposit settled, tab closed |
| Pain points solved | #10 slow payment, #23 cash register closing, #28 declined payments, #29 leaving without paying | Same set |
| Innovation | Invisible payment: pre-authorized card means just "close tab" and walk out | Automatic credit settlement — no manual calculation needed |

### Stage 10: POST-EXPERIENCE (Pós-Experiência)

**Client action:** Leaves the venue.

| Aspect | Pub & Bar | Club & Balada |
|--------|-----------|---------------|
| Frontstage | Rate experience, save as favorite, earn loyalty points, see savings summary (happy hour, cover credit) | Rate by category (music, drinks, ambiance, service), earn points, unlock VIP access for next event, Uber integration |
| Backstage | CRM receives: visit data, preferences, spending patterns, ratings | CRM receives: event attendance, spending, ratings, social connections |
| Pain points solved | #31 unknown client, #32 frequency, #33 loyalty, #34 return rate | Same set + #39 social engagement |
| Innovation | Smart loyalty: points toward free drinks, "bar regular" badges, friend referral bonuses | Tiered loyalty: VIP access earned through attendance, social sharing rewards |

---

## Pub & Bar — Feature Configuration

### Operational Characteristics

| Parameter | Value |
|-----------|-------|
| Target audience | Friends, happy hour, casual social |
| Average ticket | R$ 80-200 per person |
| Average stay | 2-5 hours |
| Turnover | 1-2 turns/night |
| Peak hours | 18h-01h |

### Active Features

| Feature | Code | Stage | Description |
|---------|------|-------|-------------|
| Digital Tab | `digital_tab` | 3 | QR check-in opens 100% digital tab |
| Group Tab | `group_tab` | 3 | Multiple users share one tab |
| Individual Tracking | `individual_tracking` | 5-7 | Records who ordered each item |
| Tab Invite | `tab_invite` | 3 | Invite friends to join tab via link |
| Auto Happy Hour | `auto_happy_hour` | 4 | Prices adjust automatically by schedule |
| Round Builder | `round_builder` | 6 | Build a round for the entire group |
| Repeat Order | `repeat_order` | 6 | Repeat last order with one tap |
| Call Waiter | `call_waiter` | 6 | Notification to waiter (for help, NOT bill) |
| Split by Consumption | `split_by_consumption` | 8 | Split by what each person ordered |
| Card Pre-auth | `card_preauth` | 3 | Hold on card when opening tab |
| Cover Credit | `cover_credit` | 3 | Entry fee converted to consumption credit |
| Spend Limit | `spend_limit` | 7 | Alert when tab approaches set limit |

### Business Rules

| Code | Rule | Stage |
|------|------|-------|
| PB-001 | Tab can only be opened if no pending tab exists | 3 |
| PB-002 | Cover credit only applies if paid via app | 3 |
| PB-003 | Cover credit is non-refundable | 9 |
| PB-004 | Happy hour applies only to items ordered during the window | 4-6 |
| PB-005 | Host can remove a member at any time | 6 |
| PB-006 | Removed member must pay their consumption first | 8-9 |
| PB-007 | Call waiter is for assistance only — not for billing | 6 |

---

## Club & Balada — Feature Configuration

### Operational Characteristics

| Parameter | Value |
|-----------|-------|
| Target audience | Young adults, celebrations, nightlife |
| Average ticket (floor) | R$ 150-500 |
| Average ticket (VIP) | R$ 300-1000+ |
| Average stay | 4-7 hours |
| Peak hours | 00h-04h |

### Active Features

| Feature | Code | Stage | Description |
|---------|------|-------|-------------|
| Advance Entry | `advance_entry` | 2 | Buy ticket with early-bird discount |
| Entry Variations | `entry_variations` | 2 | Floor, VIP, Open Bar ticket types |
| Guest List | `guest_list` | 2 | Enter guest/promoter list via app |
| Birthday Entry | `birthday_entry` | 2 | Free entry request with verification |
| Lineup | `lineup` | 1 | View artists and set times |
| Table Reservation | `table_reservation` | 2 | Reserve VIP table with deposit |
| Table Map | `table_map` | 2 | Visual map of table positions |
| Table Invite | `table_invite` | 2 | Host invites friends to VIP table |
| Minimum Spend Tracker | `minimum_spend_tracker` | 6-7 | Visual progress toward minimum |
| Bottle Service | `bottle_service` | 5-6 | Premium bottle menu with mixers |
| Floor Order | `floor_order` | 5 | Order from dance floor, pickup at nearest bar |
| Virtual Queue | `virtual_queue` | 2-3 | Join queue digitally, get notified |
| Occupancy Display | `occupancy_display` | 1 | Real-time capacity level |
| Check-in/out | `check_in_out` | 3 | Digital entry validation via QR |
| Promoter System | `promoter_system` | 2 | Promoter lists with commission tracking |

### Business Rules

| Code | Rule | Stage |
|------|------|-------|
| CL-001 | Entry ticket can only be used once | 3 |
| CL-002 | Entry ticket expires at 06:00 next day | 3 |
| CL-003 | Guest list closes at defined time | 2 |
| CL-004 | VIP deposit charged at reservation time | 2 |
| CL-005 | Cancellation after deadline = deposit forfeited | 2 |
| CL-006 | Minimum spend is mandatory for VIP | 6-7 |
| CL-007 | Entry credit only valid if ticket is used | 3-9 |
| CL-008 | Virtual queue has 5-minute tolerance | 3 |
| CL-009 | VIP table guest has included entry | 2-3 |
| CL-010 | Host responsible for minimum if group doesn't cover it | 8-9 |

---

## Backend Architecture

### Shared Entities (Both Types)

- `Tab` — Digital tab (individual or group)
- `TabMember` — Members of shared tab
- `TabItem` — Ordered items (reuses OrderItemStatus)
- `TabPayment` — Individual payments

### Pub & Bar Entities

- `HappyHourSchedule` — Promotion schedule configuration
- `WaiterCall` — Waiter assistance requests (shared across types)

### Club & Balada Entities

- `ClubEntry` — Tickets / entry passes
- `GuestListEntry` — Guest/promoter list entries
- `VipTableReservation` — VIP table reservations
- `VipTableGuest` — VIP table guests
- `VipTableTab` — VIP consumption tab
- `VipTableTabItem` — Items on VIP tab
- `QueueEntry` — Virtual queue entries
- `Lineup` / `LineupSlot` — Event artists and time slots
- `ClubCheckInOut` — Entry/exit tracking

### Key Endpoints

```
# Pub & Bar
POST   /api/v1/tabs                    # Open tab (via QR check-in)
GET    /api/v1/tabs/:id                # Tab details + per-person breakdown
POST   /api/v1/tabs/:id/join           # Join shared tab
POST   /api/v1/tabs/:id/items          # Add item (assigned to person)
POST   /api/v1/tabs/:id/round          # Submit round for group
GET    /api/v1/tabs/:id/split          # Get split options
POST   /api/v1/tabs/:id/payments       # Process payment (with split mode)
POST   /api/v1/waiter-calls            # Call waiter (with reason)
GET    /api/v1/happy-hour/active       # Active promotions

# Club & Balada
POST   /api/v1/club-entries            # Buy ticket
POST   /api/v1/club-entries/validate   # Validate at door (QR scan)
POST   /api/v1/club-entries/check-in   # Record entry
POST   /api/v1/guest-list              # Join guest/promoter list
POST   /api/v1/birthday-requests       # Request birthday entry
POST   /api/v1/table-reservations      # Reserve VIP table
POST   /api/v1/table-reservations/:id/guests  # Invite to VIP
POST   /api/v1/table-tabs/:id/items    # Add item to VIP tab
GET    /api/v1/table-tabs/:id/summary  # Summary with min spend tracker
POST   /api/v1/floor-orders            # Order from dance floor
GET    /api/v1/floor-orders/:id/status # Pickup status + nearest bar
POST   /api/v1/queue                   # Join virtual queue
GET    /api/v1/queue/my                # My position + ETA
GET    /api/v1/lineup/:eventId         # Event lineup
GET    /api/v1/occupancy/:venueId      # Real-time occupancy
```

---

## WebSocket Rooms

### Pub & Bar
- `tab:{tabId}` — Real-time tab updates (items, totals, per-person)

### Club & Balada
- `queue:{venueId}` — Queue position updates
- `queue:{venueId}:user:{userId}` — Individual position
- `vip-tab:{tableId}` — VIP tab + minimum spend progress

---

## Integration with Existing System

### Pattern Reuse
- `TabItem` reuses `OrderItemStatus` from Orders module
- `TabPayment` reuses `PaymentSplitStatus` from Payments module
- `VipTableGuest` follows `ReservationGuest` pattern
- `WaiterCall` is shared across service types
- `FloorOrder` follows standard Order flow with pickup location

### Per-Venue Configuration
All features are configurable via `RestaurantServiceConfig`:
- Cover charge (amount, credit conversion, schedule)
- Tab settings (pre-auth, limits, auto-close timeout)
- Happy Hour (schedules, discounts, eligible categories)
- VIP Tables (types, deposit, minimum spend amounts)
- Queue (priority levels, capacity, tolerance window)
- Promoter system (commission type, payout rules)
