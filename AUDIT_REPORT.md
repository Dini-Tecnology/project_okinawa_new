# NOOWE Platform — Full Diagnostic Audit Report
**Date:** 2026-04-01
**Scope:** Backend (NestJS) + Client App (React Native) + Restaurant App (React Native)
**Rule:** Diagnosis only. No fixes applied.

---

## RESUMO EXECUTIVO

| Metric | Count |
|--------|-------|
| **Total de módulos backend** | 56 (todos registrados em app.module.ts) |
| **Total de services (.service.ts)** | 134 (122 métodos mortos, ~403 só manuais) |
| **Total de métodos públicos** | ~805 (~122 nunca chamados = 15% morto) |
| **Total de eventos (EventEmitter2 + WS)** | 36 (19 desconectados = 53%) |
| **Total de endpoints HTTP** | ~350+ (2 sem auth que deveriam ter, 4 com RBAC fraco) |
| **Total de entidades** | 120 (2 sem migration, 2 duplicadas na mesma tabela) |
| **Total de telas mobile** | 143 (59 inacessíveis via nav, ~20 com dados que nunca chegam) |
| **Total de fluxos descobertos** | 238 |
|   ✅ Funcionam end-to-end | ~8 (dos 12 críticos auditados) |
|   ⚠️ Quebram parcialmente | ~4 |
|   ❌ Não funcionam (stubs) | Payment gateway (card/PIX), Google Reserve, SEFAZ Direct, Phone Auth |
|   🔇 Silenciosos | ~16 eventos WS emitidos sem nenhum receptor mobile |
| **Gravidade geral** | **CRÍTICA** |

---

## FASE 1 — MAPEAMENTO COMPLETO

---

### 1.1 — TODOS OS MÓDULOS (56)

| # | Module | Registered (line) | Files | Lines | Purpose |
|---|--------|-------------------|-------|-------|---------|
| 1 | accounts-payable | Yes (209) | 7 | 443 | Manages bills, integrates with ForecastService |
| 2 | addresses | Yes (167) | 8 | 809 | Address management with geocoding |
| 3 | admin | Yes (185) | 3 | 477 | Ops support: users, health, LGPD, analytics |
| 4 | ai | Yes (133) | 8 | 2012 | AI content generation, recommendations |
| 5 | analytics | Yes (132) | 24 | 2480 | Sales, customer, performance metrics |
| 6 | approvals | Yes (149) | 10 | 1546 | Manager approval workflows |
| 7 | auth | Yes (117) | 42 | 6785 | Login, OTP, social, biometric, MFA, JWT |
| 8 | calls | Yes (164) | 10 | 1742 | Service calls with WebSocket |
| 9 | cash-register | Yes (194) | 8 | 609 | Cash register sessions and movements |
| 10 | club | Yes (142) | 43 | 7530 | Club/nightlife: entry, VIP, queue, lineup, promoter |
| 11 | cost-control | Yes (200) | 21 | 1649 | COGS, margins, recipes, suppliers |
| 12 | customer-crm | Yes (217) | 4 | 321 | CRM profiles per restaurant |
| 13 | events | Yes (134) | 3 | 516 | WebSocket gateway for real-time events |
| 14 | favorites | Yes (136) | 8 | 471 | Favorite restaurants/items |
| 15 | financial-brain | Yes (212) | 5 | 650 | Cash flow forecasting |
| 16 | financial | Yes (129) | 16 | 2261 | Financial transactions, reports, exports |
| 17 | fiscal | Yes (203) | 14 | 1868 | NFC-e via Focus NFe / SEFAZ Direct |
| 18 | fraud-detection | Yes (176) | 7 | 1257 | Fraud alerts and sanctions |
| 19 | geofencing | Yes (170) | 5 | 474 | Location-based services (Haversine) |
| 20 | health | Yes (139) | 4 | 327 | Health checks + circuit breaker |
| 21 | hr | Yes (130) | 14 | 1445 | Attendance, leave, shifts |
| 22 | i18n | Yes (138) | 3 | 265 | Internationalization |
| 23 | identity | Yes (114) | 20 | 3974 | Credentials, MFA, token blacklist, audit, consent |
| 24 | incident-response | Yes (179) | 5 | 1196 | Security incident workflows |
| 25 | integrations | Yes (191) | 14 | 1745 | iFood, Rappi, UberEats integration |
| 26 | inventory | Yes (152) | 9 | 1064 | Basic inventory items (DUPLICATE with stock) |
| 27 | kds-brain | Yes (188) | 22 | 2674 | Intelligent KDS with auto-fire, self-learning |
| 28 | legal | Yes (173) | 11 | 628 | Privacy policy, terms, compliance |
| 29 | loyalty | Yes (126) | 15 | 2366 | Points, stamps, cashback, wallet |
| 30 | menu-customization | Yes (169) | 8 | 625 | Customization groups (DUPLICATE with menu-items) |
| 31 | menu-items | Yes (123) | 14 | 1134 | Menu items, categories, customizations |
| 32 | metrics | Yes (182) | 4 | 413 | Prometheus metrics |
| 33 | notifications | Yes (128) | 9 | 1405 | Push, email, in-app notifications |
| 34 | orders | Yes (120) | 36 | 5465 | Core order management, KDS, guests |
| 35 | payment-gateway | Yes (197) | 15 | 2745 | Asaas, Stripe Terminal, wallet adapters |
| 36 | payments | Yes (122) | 23 | 3336 | Wallets, methods, splits, transactions |
| 37 | promotions | Yes (161) | 8 | 1477 | Promotional campaigns and discounts |
| 38 | purchase-import | Yes (216) | 9 | 865 | NFe XML import for purchases |
| 39 | qr-code | Yes (137) | 11 | 1672 | QR codes for tables |
| 40 | receipts | Yes (168) | 7 | 709 | Receipt generation |
| 41 | recipes | Yes (158) | 8 | 860 | Drink recipes (bartender reference) |
| 42 | reconciliation | Yes (206) | 4 | 387 | Delivery platform settlements |
| 43 | reservations | Yes (121) | 20 | 2790 | Reservations, guests, Google Reserve |
| 44 | restaurant-waitlist | Yes (155) | 13 | 1456 | Smart waitlist with queue |
| 45 | restaurants | Yes (119) | 17 | 2441 | Restaurant profiles, service config |
| 46 | reviews | Yes (125) | 9 | 1067 | Customer reviews with sentiment |
| 47 | service-config | Yes (146) | 19 | 2734 | Config hub for restaurant operations |
| 48 | stock | Yes (215) | 15 | 1918 | Stock levels, movements, counts |
| 49 | tables | Yes (124) | 13 | 1212 | Table management with events |
| 50 | tabs | Yes (142) | 24 | 3700 | Tabs, members, items, payments, happy hour |
| 51 | tips | Yes (127) | 9 | 1138 | Tips distribution |
| 52 | user-roles | Yes (135) | 7 | 1031 | Role management |
| 53 | users | Yes (118) | 11 | 3045 | User profiles, LGPD data retention |
| 54 | webhooks | Yes (131) | 14 | 1625 | Webhook subscriptions and delivery |
| 55 | fraud-detection | Yes (176) | 7 | 1257 | Fraud detection and sanctions |
| 56 | legal | Yes (173) | 11 | 628 | Legal compliance documents |

**All 56 modules registered in app.module.ts. Zero orphans.**

---

### 1.2 — SERVICES E MÉTODOS

**134 service files, ~805 public methods.**

Summary by status:
- **ALIVE (~280, 35%):** Called from infrastructure, other services, event handlers, cron jobs
- **MANUAL_ONLY (~403, 50%):** Called only from REST controllers (normal for REST APIs)
- **DEAD (~122, 15%):** Not called anywhere in the codebase

Key dead code clusters:
- Deprecated migration helper methods
- Unfinished KDS-Brain experimental features
- Financial-Brain experimental forecasting
- Superseded utility functions

*(Full 805-method table written to `/tmp/SERVICE_METHOD_COMPLETE_REPORT.md`)*

---

### 1.3 — EVENTOS (EventEmitter2 + WebSocket)

#### EventEmitter2 (Backend interno) — 6 eventos

| Evento | Emitido por | Ouvido por | Status |
|--------|------------|------------|--------|
| `order.payment.confirmed` | orders.service.ts:281, :526 | cost-control-event.listener.ts:26, fiscal-event.listener.ts:27 | ✅ Completo |
| `ingredient.price.updated` | ingredient.service.ts:91 | cost-control-event.listener.ts:84 | ✅ Completo |
| `stock.item.depleted` | stock.service.ts:175 | stock-depletion.listener.ts:25 | ✅ Completo |
| `fiscal.nfce.authorized` | fiscal-emission.service.ts:142 | **NINGUÉM** | ❌ Emitido, ninguém ouve |
| `fiscal.nfce.failed` | fiscal-emission.service.ts:153 | **NINGUÉM** | ❌ Emitido, ninguém ouve |
| `fiscal.nfce.cancelled` | fiscal-emission.service.ts:222 | **NINGUÉM** | ❌ Emitido, ninguém ouve |

#### WebSocket (Backend → Mobile) — 30 eventos

| Evento | Emitido por | Ouvido por | Status |
|--------|------------|------------|--------|
| `order:new` | events.gateway.ts:237 | restaurant socket.ts:98, shared orders-socket.ts:83 | ✅ |
| `order:update` | events.gateway.ts:241 | restaurant socket.ts:103, shared orders-socket.ts:90 | ✅ |
| `order:cancelled` | events.gateway.ts:246 | restaurant socket.ts:108, shared orders-socket.ts:95 | ✅ |
| `reservation:new` | events.gateway.ts:258, reservations.gateway.ts:97 | restaurant socket.ts:113, shared reservations-socket.ts:83 | ✅ |
| `reservation:update` | events.gateway.ts:263 | restaurant socket.ts:118, shared reservations-socket.ts:90 | ✅ |
| `reservation:confirmed` | events.gateway.ts:268 | shared reservations-socket.ts:104 | ⚠️ Parcial (sem restaurant app) |
| `reservation:cancelled` | events.gateway.ts:286 | shared reservations-socket.ts:97 | ⚠️ Parcial (sem restaurant app) |
| `reservation:reminder` | reservations.service.ts:375 | **NINGUÉM** | ❌ |
| `table:update` | events.gateway.ts:226 | restaurant socket.ts:123 | ✅ |
| `table:status_changed` | tables.service.ts:130 | **NINGUÉM** | ❌ |
| `table:waiter_assigned` | tables.service.ts:230 | **NINGUÉM** | ❌ |
| `table:occupied` | tables.service.ts:260 | **NINGUÉM** | ❌ |
| `table:cleaning_started` | tables.service.ts:283 | **NINGUÉM** | ❌ |
| `table:freed` | tables.service.ts:304 | **NINGUÉM** | ❌ |
| `notification` | events.gateway.ts:306 | restaurant socket.ts:128, shared notifications-socket.ts:77 | ✅ |
| `notification:read` | events.gateway.ts:348 | **NINGUÉM** | ❌ |
| `notification:all_read` | events.gateway.ts:364 | **NINGUÉM** | ❌ |
| `notification:unread_count` | events.gateway.ts:388 | **NINGUÉM** | ❌ |
| `call:new` | calls.gateway.ts:115 | restaurant CallsManagementScreen.tsx:317 | ✅ |
| `call:updated` | calls.gateway.ts:151 | restaurant CallsManagementScreen.tsx:318 | ✅ |
| `queueUpdate` | club/queue.gateway.ts:125 | restaurant ClubQueueManagementScreen.tsx:264 | ✅ |
| `positionUpdate` | club/queue.gateway.ts:136 | client ClubQueueScreen.tsx:157 | ✅ |
| `called` | club/queue.gateway.ts:147 | client ClubQueueScreen.tsx:184 | ✅ |
| `statsUpdate` | club/queue.gateway.ts:158 | restaurant ClubQueueManagementScreen.tsx:269 | ✅ |
| `config:updated` | service-config.gateway.ts:104 | **NINGUÉM** | ❌ |
| `approval:new` | approvals.gateway.ts:95 | **NINGUÉM** | ❌ |
| `approval:resolved` | approvals.gateway.ts:118 | **NINGUÉM** | ❌ |
| `stock:low` | stock.service.ts:444 | **NINGUÉM** | ❌ |
| `tabUpdate` | tabs.gateway.ts:140 | **NINGUÉM** | ❌ |
| `waitlist:update` | waitlist.gateway.ts:131 | **NINGUÉM** | ❌ |
| `waitlist:called` | waitlist.gateway.ts:147 | **NINGUÉM** | ❌ |
| `waitlist:positionUpdate` | waitlist.gateway.ts:166 | **NINGUÉM** | ❌ |
| `waitlist:queueRefresh` | waitlist.gateway.ts:177 | **NINGUÉM** | ❌ |
| `waitlist:auto_called` | orders.service.ts:349 | **NINGUÉM** | ❌ |
| `fiscal:error` | fiscal-webhook.controller.ts:147 | **NINGUÉM** | ❌ |

**Resumo: 13 eventos funcionam (✅), 2 parciais (⚠️), 19 emitidos sem receptor (❌) = 53% desconectados**

---

### 1.4 — ENDPOINTS HTTP (~350+)

*(Tabela completa em `/tmp/FULL_ENDPOINT_MAP.json` — 82KB)*

**Resumo por módulo:**

| Controller | Endpoints | Public | Auth Required | Roles Applied |
|------------|-----------|--------|---------------|---------------|
| Auth (main + phone + social + biometric + mfa) | 25 | 12 | 13 | Varies |
| Orders (main + guests + KDS) | 22 | 0 | 22 | CUSTOMER/OWNER/MANAGER/WAITER/CHEF |
| Payments (main + split + gateway) | 18 | 3 (webhooks) | 15 | CUSTOMER/OWNER/MANAGER |
| Reservations (main + guests) | 14 | 0 | 14 | Various |
| Tabs (main + payments + happy hour + waiter calls) | 20 | 0 | 20 | Various |
| Club (queue + entry + VIP + lineup + promoter + birthday) | 30+ | 0 | 30+ | Various |
| Menu Items + Customizations | 12 | 3 | 9 | OWNER/MANAGER/CHEF |
| Restaurants + Service Config | 18 | 3 | 15 | OWNER/MANAGER |
| Tables | 10 | 0 | 10 | OWNER/MANAGER/WAITER/MAITRE |
| Financial + Accounts Payable + Reconciliation | 12 | 0 | 12 | OWNER/MANAGER |
| Stock + Inventory + Cost Control + Purchase Import | 25+ | 0 | 25+ | OWNER/MANAGER/CHEF |
| KDS Brain + Cook Stations | 15 | 0 | 15 | OWNER/MANAGER/CHEF/COOK |
| Users + User Roles + Identity | 15 | 0 | 15 | Various |
| HR | 8 | 0 | 8 | OWNER/MANAGER |
| Fiscal + Receipts | 10 | 1 (webhook) | 9 | OWNER/MANAGER |
| Reviews | 8 | 0 | 8 | Various |
| Loyalty + Promotions | 10 | 0 | 10 | Various |
| Notifications | 5 | 0 | 5 | All roles |
| Webhooks (management) | 6 | 0 | 6 | OWNER/MANAGER |
| Integrations (webhooks) | 4 | 4 | 0 | External platforms |
| Admin | 5 | 0 | 5 | OWNER only |
| Others (health, metrics, legal, geofencing, etc.) | 15 | 10 | 5 | Various |

**Total: ~350+ endpoints, 36 public (by design), 314+ protected**

---

### 1.5 — ENTIDADES (120)

**120 entidades mapeadas em 42 módulos.**

#### Problemas encontrados:

| Issue | Details |
|-------|---------|
| **DUPLICATA CRÍTICA** | `CustomizationGroup` (menu-customization) e `MenuItemCustomizationGroup` (menu-items) → **MESMA TABELA** `menu_item_customization_groups` |
| **Duplicata conceitual** | `InventoryItem` (inventory) vs `StockItem` (stock) — conceito sobreposto |
| **Entidades sem migration** | `PromoterSale`, `PromoterPayment` (definidas mas sem migration) |
| **Migrations duplicadas** | `CreateAddressesTable` existe em 2 timestamps; `CreateServiceCallsTable` em 2 locais |
| **FKs sem relação explícita** | `Receipt` → restaurant_id/user_id sem ManyToOne; `ExternalMenuMapping` → menu_item_id sem relação; `FireSchedule` → order_id/station_id sem relação |

#### Total de migrations: 63 files (incluindo duplicatas)

---

### 1.6 — TELAS MOBILE (143)

| App | Total | Nav registered | Without Nav | With WebSocket |
|-----|-------|---------------|-------------|----------------|
| **Client** | 61 | 21 | 40 | 1 (ClubQueueScreen) |
| **Restaurant** | 82 | 63 | 19 | 6 |
| **TOTAL** | **143** | **84** | **59** | **7** |

#### Client App — Telas sem navegação (40):
AIPairingAssistantScreen, BirthdayBookingScreen, BirthdayEntryRequestScreen, BuffetCheckinScreen, CallWaiterScreen, ClubHomeScreen, ClubQueueScreen, CreateReservationScreen, DigitalReceiptScreen, DishBuilderScreen, EntryChoiceScreen, FamilyActivitiesScreen, FamilyModeScreen, FavoritesScreen, GeolocationTrackingScreen, GroupBookingScreen, GuestInvitationScreen, LineupScreen, LoyaltyHomeScreen, LoyaltyLeaderboardScreen, LoyaltyScreen, ManageConsentsScreen, OnboardingScreen, OrderStatusScreen, PartialOrderScreen, QRScannerScreen, ReservationDetailScreen, ReservationsScreen, ReviewsScreen, SettingsScreen, SharedOrderScreen, StampCardsScreen, SupportScreen, TicketPurchaseScreen, TipsScreen, VipTableScreen, VirtualQueueScreen, WaitlistBarScreen, WaitlistScreen, WalletScreen

#### Restaurant App — Telas sem navegação (19):
ApprovalsScreen, CasualDiningConfigScreen, ChefApprovalsScreen, ClubQueueManagementScreen, CustomerCrmScreen, DailyReportScreen, DoorManagementScreen, IntegrationSettingsScreen, MaitreWaitlistScreen, ManagerOpsScreen, PromoterDashboardScreen, PromotionsManagerScreen, QRCodeBatchScreen, QRCodeGeneratorScreen, RecipeScreen, TableFormScreen, TableListScreen, VipTableManagementScreen, WaiterCommandCenter

---

### 1.7 — FLUXOS DE NEGÓCIO DESCOBERTOS (238)

#### CATEGORIA A: Fluxos do CLIENT App (75 fluxos)

| # | Ação inicial | Cadeia esperada |
|---|-------------|----------------|
| 1 | POST `/auth/register` | Profile → Wallet → Welcome notification |
| 2 | POST `/auth/login` | Session → JWT → Audit log → Device fingerprint |
| 3-15 | Auth flows (reset, MFA, biometric, phone, social) | Various auth chains |
| 16-19 | User profile (update, consent, deletion) | Profile → Audit → LGPD |
| 20-23 | Addresses (CRUD + default) | Geocoding → Validation |
| 24-27 | Favorites (CRUD) | View count → Cache |
| 28 | POST `/orders` | **Items validated → Stock reserved → Kitchen notified → WS broadcast** |
| 29-34 | Order operations (update, status, cash, partial, buffet) | Various order chains |
| 35-38 | Order guests (add, remove, leave, payment) | Split → Payment → WS |
| 39-49 | Payments (process, wallet, methods, refund, split) | Gateway → Transaction → NFC-e → Receipt → Loyalty |
| 50-57 | Reservations (create, update, status, group, guests) | Table check → Calendar → Notification |
| 58-63 | Reviews (create, edit, response, helpful, visibility, delete) | Rating → Moderation → LGPD |
| 64-69 | Loyalty (profile, points, redeem, stamps) | Ledger → Expiration → Reward |
| 70-75 | Other (promotions, geofencing, QR, restaurants, menu) | Various |

#### CATEGORIA B: Fluxos do RESTAURANT App (137 fluxos)

| # | Ação inicial | Cadeia esperada |
|---|-------------|----------------|
| 76-90 | Restaurant + Service Config (profile, types, experience, floor, kitchen, payments, features, team, setup) | Config → KDS → Integration |
| 91-99 | Menu Items + Categories + Customizations | Cost calc → Kitchen → Categories |
| 100-109 | KDS Brain (bump, undo, toggle, suggestions, config, stations) | Display → Timer → AI |
| 110-119 | Tables (CRUD, status, occupy, cleaning, available, assign, waiter, notes) | Floor → Waitlist → Reservation |
| 120-133 | Tabs (create, join, leave, items, round, close, pay, happy hour) | Split → Payment → Receipt |
| 134-137 | Calls (create, acknowledge, resolve, cancel) | Priority → Timer → WS |
| 138-141 | Cash Register (open, movement, close) | Float → Balance → Audit |
| 142-153 | Stock + Inventory (adjust, receive, waste, internal, count) | FIFO → Journal → Variance |
| 154-169 | Cost Control + Purchase Import + Recipes | Ingredient → Recipe → COGS → Margin |
| 170-179 | User Roles + Staff (assign, transfer, bulk) | Permissions → Audit |
| 180-196 | Incident Response + Fiscal + Receipts + Approvals + Webhooks + Promotions | Various |
| 197-212 | Financial + Tips + CRM + Fraud | Transaction → Ledger → Audit |

#### CATEGORIA C: Fluxos de WEBHOOK (14 fluxos)

| # | Origem | Ação | Cadeia |
|---|--------|------|--------|
| 213-215 | iFood/Rappi/UberEats | Order webhook | Signature → Normalize → Capacity → Internal order → KDS → Callback |
| 216 | Delivery platform | Status webhook | Status sync → Customer notification |
| 217-220 | Asaas | Payment webhooks | Signature → Transaction → Order → NFC-e → Receipt → Loyalty |
| 221-223 | Stripe | Payment webhooks | Same as Asaas |
| 224-226 | Focus NFe | Fiscal webhook | Token → Document → Access key → QR code |

#### CATEGORIA D: Fluxos CRON/Timer (8 fluxos)

| # | Schedule | Ação |
|---|----------|------|
| 227 | Every 30s | KDS auto-fire queue items |
| 228 | Weekly Mon 6AM | KDS self-learning prep time suggestions |
| 229 | Every 15min | Check overdue incidents |
| 230 | Every minute | Webhook retry (exponential backoff) |
| 231 | Daily 4AM | LGPD account deletion (30-day grace) |
| 232 | Daily 3AM | Data retention purge |
| 233 | Every 30min | Reservation reminders |
| 234 | Hourly | Mark no-show reservations |

#### CATEGORIA E: Fluxos internos via EventEmitter2 (4 fluxos)

| # | Evento | Cadeia |
|---|--------|--------|
| 235-236 | `order.payment.confirmed` | → Fiscal NFC-e emission + Cost control COGS |
| 237 | `ingredient.price.updated` | → Recalculate all recipes using ingredient |
| 238 | `stock.item.depleted` | → Auto-86 affected menu items → KDS update |

---

## FASE 2 — AUDITORIA

---

### 2.1 — AUDITORIA DE FLUXOS CRÍTICOS (12 fluxos rastreados)

#### FLOW 1: Order Creation (POST /orders)
```
Step 1: Validate user auth                    → orders.controller.ts:39       ✅
Step 2: Load & validate menu items            → orders.service.ts:62-86      ✅
Step 3: Calculate totals                      → orders.service.ts:104-107    ✅
Step 4: Create Order + OrderItems (txn)       → orders.service.ts:109-123    ✅
Step 5: Generate pickup code                  → orders.service.ts:127-136    ✅
Step 6: WebSocket "order:new"                 → orders.service.ts:139-150    ✅
Step 7: Stock reservation                     → NÃO EXISTE                   ❌ QUEBRA
Step 8: Loyalty deduction                     → NÃO EXISTE                   ❌ QUEBRA
Status: ⚠️ Funciona parcialmente — stock NÃO reservado na criação (só deduzido no COMPLETED)
```

#### FLOW 2: Order Status → COMPLETED
```
Step 1: Load order                            → orders.service.ts:227        ✅
Step 2: Set COMPLETED + completed_at          → orders.service.ts:239-240    ✅
Step 3: Award loyalty points (non-blocking)   → orders.service.ts:243-248    ✅
Step 4: Stock deduction per item              → orders.service.ts:258-278    ✅
Step 5: Emit 'order.payment.confirmed'        → orders.service.ts:281-284    ✅
Step 6: CRM visit recording                   → orders.service.ts:287-299    ✅
Step 7: Loyalty stamp                         → orders.service.ts:302-310    ✅
Step 8: Review prompt scheduling              → orders.service.ts:312-316    ❌ TODO placeholder
Step 9: Free table + waitlist advance         → orders.service.ts:319-365    ✅
Step 10: NFC-e emission (via event)           → fiscal-event.listener.ts:27  ✅
Status: ✅ Funciona end-to-end (review prompt é TODO menor)
```

#### FLOW 3: Payment Processing (POST /payments/process)
```
Step 1: Rate limiting                         → payments.controller.ts:36    ✅
Step 2: Idempotency key check                 → payments.controller.ts:37    ✅
Step 3: Auth + RBAC                           → payments.controller.ts:29    ✅
Step 4: Verify order ownership                → payments.service.ts:302-314  ✅
Step 5: Validate amount                       → payments.service.ts:317-332  ✅
Step 6a: Wallet payment                       → payments.service.ts:338-360  ✅
Step 6b: Credit card payment                  → payments.service.ts:371      ❌ STUB (TODO)
Step 6c: PIX payment                          → payments.service.ts:382      ❌ STUB (TODO)
Step 7: Transaction commit                    → payments.service.ts:397      ✅
Step 8: Loyalty rewards (async)               → payments.service.ts:400-404  ⚠️ Non-blocking
Step 9: WebSocket notification                → payments.service.ts:424-436  ✅
Status: ⚠️ Só wallet funciona. Card/PIX são stubs.
```

#### FLOW 4: Asaas Webhook Payment Confirmed
```
Step 1: Public endpoint                       → webhook.controller.ts:36     ✅
Step 2: Parse payload                         → payment-webhook.service.ts:58 ✅
Step 3: Validate signature                    → payment-webhook.service.ts:74 ❌ SEMPRE return true (TODO)
Step 4: Lookup GatewayTransaction             → payment-webhook.service.ts:92 ✅
Step 5: Map event to status                   → payment-webhook.service.ts:105 ✅
Step 6: Update transaction                    → payment-webhook.service.ts:121 ✅
Step 7: Save                                  → payment-webhook.service.ts:138 ✅
Step 8: Emit domain event                     → payment-webhook.service.ts:149 ✅
Step 9: Call FinancialEventListener            → payment-webhook.service.ts:347 ✅
Status: ⚠️ Funciona MAS sem validação de assinatura — QUALQUER request forja pagamento
```

#### FLOW 5: Tab Lifecycle
```
Step 1: Create tab                            → tabs.service.ts:29-69        ✅
Step 2: Add items + update totals             → tabs.service.ts:108-148      ✅
Step 3: Repeat round                          → tabs.service.ts:153-190      ✅
Step 4: Request close → PENDING_PAYMENT       → tabs.service.ts:195+         ✅
Step 5: Process payment                       → tab-payments.service.ts:23-62 ✅
Step 6: Close tab                             → auto when fully paid          ✅
Status: ✅ Funciona end-to-end (mas sem idempotency — ver 2.5)
```

#### FLOW 6: Reservation Creation
```
Step 1: Auth required                         → controller                    ✅
Step 2: Chef's table capacity check           → reservations.service.ts:35-57 ✅
Step 3: Create reservation (txn)              → reservations.service.ts:64-70 ✅
Step 4: Save + commit                         → reservations.service.ts:70-71 ✅
Step 5: WebSocket "reservation:created"       → reservations.service.ts:76-83 ✅
Step 6: Table assignment                      → reservations.service.ts:153   ✅
Step 7: Guest notification                    → reservations.service.ts:160   ❌ TODO placeholder
Step 8: Calendar sync                         → NÃO EXISTE                   ❌ QUEBRA
Status: ⚠️ Funciona parcialmente — notificação e calendar sync ausentes
```

#### FLOW 7: Waitlist → Table → Seating
```
Step 1: Join waitlist                         → waitlist.service.ts:33-82     ✅
Step 2: Get position                          → waitlist.service.ts:87-98     ✅
Step 3: Call guest (staff)                    → waitlist.service.ts:131-148   ✅
Step 4: Seat guest                            → waitlist.service.ts:154-176   ✅
Step 5: Auto-advance (when table frees)       → orders.service.ts:338-354    ✅
Step 6: No-show handling                      → waitlist.service.ts:181-202   ✅
Step 7: Cancel entry                          → waitlist.service.ts:208-233   ✅
Status: ✅ Funciona end-to-end (MAS WS events não têm listener — ver 1.3)
```

#### FLOW 8: NFC-e Emission (automatic)
```
Step 1: Order marked COMPLETED                → orders.service.ts:239        ✅
Step 2: Emit 'order.payment.confirmed'        → orders.service.ts:281        ✅
Step 3: FiscalEventListener receives          → fiscal-event.listener.ts:27   ✅
Step 4: Check FiscalConfig                    → fiscal-event.listener.ts:34   ✅
Step 5: Call emitForOrder()                   → fiscal-emission.service.ts:71 ✅
Step 6: Build emission params                 → fiscal-emission.service.ts:105 ✅
Step 7: Call adapter                          → fiscal-emission.service.ts:113 ✅
Step 8: Save FiscalDocument                   → fiscal-emission.service.ts:116 ✅
Step 9: Increment next_number                 → fiscal-emission.service.ts:137 ✅
Step 10: Emit success/failure event           → fiscal-emission.service.ts:142 ✅
Status: ✅ Funciona end-to-end (Focus NFe adapter é placeholder mas arquitetura completa)
```

#### FLOW 9: Stock Depletion → Menu Availability
```
Step 1: Order completed → stock deduction     → orders.service.ts:258        ✅
Step 2: Deduct via recipe                     → stock.service.ts:118-194     ✅
Step 3: Check if depleted                     → stock.service.ts:174-181     ✅
Step 4: Emit 'stock.item.depleted'            → stock.service.ts:175         ✅
Step 5: StockDepletionListener receives       → stock-depletion.listener.ts:25 ✅
Step 6: Find affected menu items              → stock-depletion.listener.ts:33 ✅
Step 7: Auto-86 each affected item            → stock-depletion.listener.ts:54 ✅
Status: ✅ Funciona end-to-end
```

#### FLOW 10: iFood Order Webhook
```
Step 1: Public webhook endpoint               → webhook.controller.ts:69     ✅
Step 2: Identify adapter                      → webhook.controller.ts:82     ✅
Step 3: Validate signature                    → webhook.controller.ts:89     ✅
Step 4: Normalize order                       → webhook.controller.ts:98     ✅
Step 5: Find PlatformConnection               → webhook.controller.ts:101    ✅
Step 6: Load menu mappings                    → webhook.controller.ts:119    ✅
Step 7: Evaluate capacity                     → webhook.controller.ts:131    ✅
Step 8: Handle reject/accept                  → webhook.controller.ts:135    ✅
Step 9: Create internal order                 → webhook.controller.ts:164    ✅
Step 10: Confirm on platform                  → webhook.controller.ts:189    ✅
Status: ✅ Funciona end-to-end (MAS adapter é TODO placeholder — não chama API real)
```

#### FLOW 11: Club Queue
```
Step 1: Join queue                            → queue.service.ts:21-57       ✅
Step 2: Get position                          → queue.service.ts:62-70       ✅
Step 3: Leave (customer)                      → queue.service.ts:75-88       ✅
Step 4: Call next (staff)                     → queue.service.ts:93-114      ✅
Step 5: Confirm entry                         → queue.service.ts:119-139     ✅
Step 6: No-show                               → queue.service.ts:144-160     ✅
Step 7: Stats                                 → queue.service.ts:179-200     ✅
Step 8: WebSocket broadcasts                  → queue.gateway.ts             ✅
Status: ✅ Funciona end-to-end
```

#### FLOW 12: Service Call (Waiter Call)
```
Step 1: Create call                           → calls.service.ts:27-48       ✅
Step 2: WebSocket "call:new"                  → calls.service.ts:41          ✅
Step 3: Find pending calls                    → calls.service.ts:73-82       ✅
Step 4: Acknowledge                           → calls.service.ts:117-150     ✅
Step 5: Push notification to customer         → calls.service.ts:137-140     ❌ TODO placeholder
Step 6: WebSocket "call:updated"              → calls.service.ts:143         ✅
Step 7: Resolve                               → calls.service.ts:155-194     ✅
Status: ⚠️ Funciona parcialmente — push notification é placeholder
```

---

### 2.2 — COMUNICAÇÃO ENTRE APPS

#### Ações do CLIENT que o RESTAURANT nunca vê:

| Ação do Cliente | Restaurant notificado? | Detalhes |
|----------------|----------------------|----------|
| Cliente faz pedido | ✅ Sim | `order:new` via WebSocket |
| Cliente faz reserva | ✅ Sim | `reservation:new` via WebSocket |
| Cliente entra na waitlist | ❌ **NÃO** | Backend NÃO emite evento WS na criação. Sem gateway para waitlist join. |
| Cliente faz pagamento | ⚠️ Parcial | Notification genérica, sem evento `payment:confirmed` específico |
| Cliente chama garçom | ✅ Sim | `call:new` via WebSocket |
| Cliente escreve review | ⚠️ Parcial | Notification genérica apenas |
| Cliente entra na fila do club | ✅ Sim | `queueUpdate` via WebSocket |
| Cliente cancela pedido | ✅ Sim | `order:cancelled` via WebSocket |
| Cliente adiciona items ao pedido aberto | ❌ **NÃO** | Backend NÃO emite evento WS. **BUG CRÍTICO: KDS não vê items adicionados** |

#### Ações do RESTAURANT que o CLIENT nunca vê:

| Ação do Restaurant | Cliente notificado? | Detalhes |
|-------------------|---------------------|----------|
| Confirma pedido | ✅ Sim | `order:update` via WebSocket |
| Marca pedido pronto | ✅ Sim | `order:update` via WebSocket |
| Confirma reserva | ⚠️ Parcial | shared listener existe, mas sem notificação push |
| Chama party da waitlist | ❌ **NÃO** | `waitlist:called` emitido mas NINGUÉM escuta no mobile |
| Responde review | ⚠️ Parcial | Notification genérica |
| Muda status da mesa | ❌ **NÃO** | `table:status_changed` emitido mas NINGUÉM escuta |
| Altera disponibilidade de item | ❌ **NÃO** | Sem gateway para menu items. Sem evento WS. |
| Aprova/rejeita request | ❌ **NÃO** | `approval:new/resolved` emitido mas NINGUÉM escuta |
| Atualiza stock baixo | ❌ **NÃO** | `stock:low` emitido mas NINGUÉM escuta |

#### Dados que mudam no backend sem nenhum app atualizar:

1. **Loyalty points awarded** — EventEmitter2 event, NÃO WS. Cliente não vê pontos em tempo real.
2. **Cash payment confirmed** — Emite `order.payment.confirmed` interno, mas NÃO WS para apps.
3. **Reservation auto-reminders** — Cron emite mas mecanismo de delivery não claro.
4. **Menu item 86'd** (auto-unavailable via stock) — Sem WS para cliente. Precisa refresh manual.

#### Fluxos que deveriam envolver ambos apps mas só envolvem um:

| Fluxo | Esperado | Realidade |
|-------|----------|-----------|
| **Waitlist** | Cliente entra → Restaurant vê → Restaurant chama → Cliente vê | Cliente entra → ❌ Restaurant polls → Restaurant chama → ❌ Cliente polls |
| **Menu availability** | Restaurant 86s item → Cliente vê indisponível | Restaurant 86s → ❌ Cliente precisa refresh |
| **Approvals** | Staff pede → Manager aprova → Staff vê | Staff pede → ❌ Manager polls → Manager aprova → ❌ Staff polls |
| **Tab updates** | Item added → All members see | Item added → ❌ `tabUpdate` emitido mas ninguém escuta |

---

### 2.3 — MÓDULOS DUPLICADOS E ISOLADOS

#### Entidades duplicadas (MESMA TABELA):

| Entidade 1 | Entidade 2 | Tabela | Problema |
|------------|------------|--------|----------|
| `CustomizationGroup` (menu-customization) | `MenuItemCustomizationGroup` (menu-items) | `menu_item_customization_groups` | **2 TypeORM entities na mesma tabela. Race conditions, conflitos de migration.** |

#### Entidades conceitualmente duplicadas:

| Módulo 1 | Módulo 2 | Conceito | Problema |
|----------|----------|----------|----------|
| `inventory` (InventoryItem) | `stock` (StockItem) | Inventory tracking | Dois sistemas paralelos. Inventory = simples, Stock = com ingredientes e movements. Separação unclear. |
| `recipes` (DrinkRecipe) | `cost-control` (Recipe) | Recipes | DrinkRecipe = referência do barman (JSONB). Recipe = custo financeiro. Não se falam. |

#### Módulos que deveriam se falar mas NÃO:

| Módulo A | Módulo B | Deveria | Realidade |
|----------|----------|---------|-----------|
| `reservations` | `tables` | Reserva deveria marcar mesa como "reserved" | **ReservationsModule NÃO importa TablesModule** |
| `restaurant-waitlist` | `tables` | Mesa liberada deveria notificar waitlist | **WaitlistModule NÃO importa TablesModule** |
| `promotions` | `orders` | Desconto aplicado no business logic | **PromotionsModule NÃO importa OrdersModule** |

#### Queries diretas no banco (bypass do service):

| Service que bypassa | Repository injetado | Deveria usar |
|--------------------|--------------------|--------------|
| `fiscal-emission.service.ts:61` | `@InjectRepository(Order)` | OrdersService |
| `cost-control-event.listener.ts:22` | `@InjectRepository(Order)` | OrdersService |
| `stock-depletion.listener.ts:21` | `@InjectRepository(RecipeIngredient)` | RecipeService |
| `payments.service.ts:36` | `@InjectRepository(Order)` | OrdersService |
| `margin-tracker.service.ts:46` | `@InjectRepository(FinancialTransaction)` | FinancialService |

---

### 2.4 — RBAC E SEGURANÇA

#### Achados Críticos (🔴):

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 1 | **Asaas webhook signature NEVER validated** — `validateAsaasSignature()` always returns `true` | `payment-webhook.service.ts:161-175` | Qualquer attacker pode forjar confirmação de pagamento |
| 2 | **Stripe webhook signature NEVER validated** — `validateStripeSignature()` always returns `true` | `payment-webhook.service.ts:304-318` | Qualquer attacker pode forjar evento Stripe |

#### Achados Altos (🟡):

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 3 | **Fiscal certificate password em PLAIN TEXT** | `fiscal-config.entity.ts:95` `certificate_password: string` | Se DB comprometido, certificado exposto |
| 4 | **CSC token em PLAIN TEXT** | `fiscal-config.entity.ts:67` `csc_token: string` | Código de segurança fiscal exposto |
| 5 | **Focus NFe API token em PLAIN TEXT** | `fiscal-config.entity.ts:85` `focus_nfe_token: string` | API credentials expostas |
| 6 | **Fiscal webhook token validation fraca** | `fiscal-webhook.controller.ts:64-68` | Só verifica presença do token, não compara com secret |

#### O que está BOM:

- ✅ JWT configurado com issuer/audience
- ✅ Rate limiting em todos endpoints sensíveis (login 5/60s, register 10/60s, reset 3/60s, OTP 5/60s)
- ✅ HMAC-SHA256 para webhooks customizados (com timing-safe comparison)
- ✅ Audit logging com redação de campos sensíveis
- ✅ Todas queries parameterizadas (sem SQL injection)
- ✅ RBAC enforced via guards e decorators
- ✅ Passwords com bcrypt
- ✅ Secrets externalizados em .env

---

### 2.5 — CONSISTÊNCIA DE DADOS

#### Missing Transactions:

| # | Operação | Arquivo | Linhas | Risco |
|---|----------|---------|--------|-------|
| 1 | `confirmCashPayment()` — 5 operações sequenciais sem transaction | `orders.service.ts` | 438-552 | Se loyalty fail, order já COMPLETED mas sem pontos |
| 2 | `updateStatus(COMPLETED)` — 6 operações non-blocking | `orders.service.ts` | 226-378 | Stock/loyalty/CRM podem falhar independentemente |
| 3 | `addItem()` → updateTabTotals + member update | `tabs.service.ts` | 108-148 | Item existe mas totais errados |
| 4 | Tab payment + totals + close status | `tab-payments.service.ts` | 23-62 | Payment recorded mas tab não fecha |

#### Missing Idempotency:

| # | Operação | Arquivo | Risco |
|---|----------|---------|-------|
| 1 | **rechargeWallet/withdrawWallet SEM idempotency key** | `payments.controller.ts:61-80` | **CRÍTICO: Double-charge em retry** |
| 2 | Tab payment sem duplicate detection | `tab-payments.service.ts:23-62` | Payment duplicado |
| 3 | Loyalty points sem check de ordem já processada | `loyalty.service.ts:291-383` | Pontos dobrados em retry |
| 4 | Stock deduction sem reference_id check | `stock.service.ts:118-194` | Stock deduzido 2x para mesma ordem |

#### Divergent Sync (campos manuais que podem divergir):

| # | Campo stored | Fonte real | Arquivo | Risco |
|---|-------------|-----------|---------|-------|
| 1 | `Tab.subtotal` | SUM(TabItem.total_price) | `tabs.service.ts:225-238` | Race condition: concurrent addItem perde update |
| 2 | `TabMember.amount_consumed` | SUM(TabItem WHERE ordered_by) | `tabs.service.ts:144` | Concurrent updates sem lock |
| 3 | `StockItem.current_quantity` | opening + SUM(movements) | `stock.service.ts:81-83` | **Se movement salva mas stock update falha → overselling** |
| 4 | `LoyaltyProgram.tier` | Calculado de points | `loyalty.service.ts:196-199` | Tier diverge de pontos se update parcial |

#### Stuck Status (sem timeout):

| # | Entity | Status preso | Arquivo | Consequência |
|---|--------|-------------|---------|-------------|
| 1 | Order | `PREPARING` (sem timeout) | `orders.service.ts:449-455` | Pedido fica "preparando" para sempre se POS crashar |
| 2 | Tab | `PENDING_PAYMENT` (sem timeout) | `tabs.service.ts:195-206` | Mesa presa indisponível se cliente navegar fora |
| 3 | CashRegisterSession | `OPEN` (sem timeout) | `cash-register.service.ts:38-62` | Sessão órfã bloqueia próximo turno |

#### Race Conditions:

| # | Operação | Arquivo | Lock? | Risco |
|---|----------|---------|-------|-------|
| 1 | Table updateStatus | `tables.service.ts:120-139` | ❌ Nenhum | Double-book mesa |
| 2 | **Wallet balance deduction** | `payments.service.ts:341-356` | ❌ Dentro de txn mas sem pessimistic lock | **Balance negativo possível** |
| 3 | TabMember amount_consumed | `tabs.service.ts:144-145` | ❌ Nenhum | Valor errado em split |
| 4 | Table assignToReservation | `tables.service.ts:176-220` | ✅ pessimistic_write | OK |
| 5 | Loyalty points | `loyalty.service.ts:309-315` | ✅ pessimistic_write | OK |

---

### 2.6 — CÓDIGO MORTO E PLACEHOLDERS

#### TODOs (56 total):

| Cluster | Count | Impacto |
|---------|-------|---------|
| **Payment Gateway Adapters (Asaas)** | 12 | Todas chamadas API são LOG PLACEHOLDERS |
| **Payment Gateway Adapters (Stripe Terminal)** | 12 | Todas chamadas API são LOG PLACEHOLDERS |
| **iFood Adapter** | 9 | Todas chamadas API são LOG PLACEHOLDERS |
| **Rappi Adapter** | 9 | Todas chamadas API são LOG PLACEHOLDERS |
| **UberEats Adapter** | 9 | Todas chamadas API são LOG PLACEHOLDERS |
| **Payment Webhook Signature** | 6 | Validação stubbed |
| **Push Notifications** | 5 | Reservations, Orders, Calls, Payments: todos logging instead of sending |
| **Other** | 4 | Fiscal events, integration status, KDS availability |

#### NotImplementedException (13 total):

| Service | Count | What's stubbed |
|---------|-------|---------------|
| Google Reserve Adapter | 4 | "Phase 2" — todas operações de reserva Google |
| SEFAZ Direct Adapter | 4 | "Phase 2" — emissão NFC-e direta (sem Focus NFe) |
| Auth Service (phone) | 4 | `sendOTP`, `verifyOTP`, `completeRegistration`, `verifyPhone` |
| Auth Service (social) | 1 | `generateTokenFromSocial` |

#### Placeholder Implementations:

| Service | What's placeholder | Impact |
|---------|-------------------|--------|
| `reviews.service.ts:397` | Sentiment analysis | Simple string matching instead of AI |
| `fiscal-event.service.ts:14-20` | Evento fiscal | Logs instead of EventEmitter2 |
| `item-availability.service.ts:132-168` | External platform sync | Logs "TODO: Call adapter" |
| `payment-webhook.service.ts:161-175` | Asaas signature validation | Always returns `true` |
| `payment-webhook.service.ts:304-318` | Stripe signature validation | Always returns `true` |

#### Todos os adapters de integração externa são 100% placeholder:

- `asaas.adapter.ts` — 12 TODO, all API calls are console.log
- `asaas.pix.service.ts` — 7 TODO, PIX QR code generation is fake
- `stripe-terminal.adapter.ts` — 12 TODO, all terminal ops are console.log
- `ifood.adapter.ts` — 9 TODO, all iFood API calls are fake
- `rappi.adapter.ts` — 9 TODO, all Rappi API calls are fake
- `ubereats.adapter.ts` — 9 TODO, all UberEats API calls are fake

---

## TOP 20 PROBLEMAS MAIS GRAVES

Ordenados por impacto no usuário final:

---

### 1. 🔴 PAYMENT GATEWAY 100% STUB — Nenhum pagamento real funciona
- **Arquivo:** `payment-gateway/adapters/asaas/asaas.adapter.ts:52-367`, `stripe-terminal.adapter.ts:44-345`
- **Fluxos afetados:** FLOW 3 (Payment Processing), FLOW 4 (Webhooks)
- **Impacto:** Nenhum pagamento por cartão, PIX, ou terminal funciona. Só wallet (saldo interno). **Restaurante não pode receber pagamento de cliente.**

---

### 2. 🔴 WEBHOOK SIGNATURE VALIDATION DISABLED — Forja de pagamento possível
- **Arquivo:** `payment-webhook.service.ts:161-175` (Asaas), `:304-318` (Stripe)
- **Fluxos afetados:** FLOW 4 (Asaas Webhook)
- **Impacto:** Qualquer pessoa pode enviar POST para `/payment-gateway/webhooks/asaas` e forjar confirmação de pagamento. **Pedido marcado como pago sem pagamento real.**

---

### 3. 🔴 WALLET BALANCE RACE CONDITION — Saldo negativo possível
- **Arquivo:** `payments.service.ts:341-356`
- **Fluxos afetados:** FLOW 3 (Payment Processing)
- **Impacto:** Duas requests concorrentes de pagamento podem ambas passar validação de saldo. **Cliente gasta mais do que tem.**

---

### 4. 🔴 WALLET RECHARGE SEM IDEMPOTENCY — Double-charge
- **Arquivo:** `payments.controller.ts:61-80`
- **Fluxos afetados:** Wallet recharge flow
- **Impacto:** Retry de request de recarga duplica o valor. **Cliente carregado 2x no cartão.**

---

### 5. 🔴 19 WEBSOCKET EVENTS SEM RECEPTOR — Silêncio completo
- **Arquivo:** Múltiplos gateways (ver seção 1.3)
- **Fluxos afetados:** Waitlist, tabs, approvals, stock alerts, table status, notifications
- **Impacto:** Backend emite 19 eventos que NINGUÉM ouve. **Maitre não vê cliente na waitlist. Garçom não vê tab update. Manager não vê approval.**

---

### 6. 🔴 WAITLIST FLOW 100% POLLING — Sem real-time
- **Arquivo:** `restaurant-waitlist/waitlist.service.ts` (sem gateway connection), `waitlist.gateway.ts:131-177` (emite mas ninguém ouve)
- **Fluxos afetados:** FLOW 7 (Waitlist)
- **Impacto:** Cliente entra na fila → restaurant não sabe em tempo real. Restaurant chama → cliente não sabe em tempo real. **Ambos precisam ficar refreshando manualmente.**

---

### 7. 🔴 DELIVERY PLATFORMS 100% STUB — iFood/Rappi/UberEats não funcionam
- **Arquivo:** `ifood.adapter.ts:17`, `rappi.adapter.ts:16`, `ubereats.adapter.ts:16`
- **Fluxos afetados:** FLOW 10 (Delivery webhooks)
- **Impacto:** Nenhuma integração com plataformas de delivery funciona. **Pedidos de iFood/Rappi não chegam ao KDS.**

---

### 8. 🔴 STOCK NÃO RESERVADO NA CRIAÇÃO DO PEDIDO
- **Arquivo:** `orders.service.ts` (Step 7 missing in FLOW 1)
- **Fluxos afetados:** FLOW 1 (Order Creation)
- **Impacto:** Múltiplos pedidos podem ser aceitos para o mesmo item. Stock só deduzido no COMPLETED. **Overselling garantido em horário de pico.**

---

### 9. 🔴 FISCAL CERTIFICATE PASSWORD EM PLAIN TEXT
- **Arquivo:** `fiscal-config.entity.ts:95`
- **Fluxos afetados:** Fiscal emission
- **Impacto:** Se banco comprometido, certificado digital do restaurante exposto. **Attacker pode emitir NFC-e em nome do restaurante.**

---

### 10. 🔴 DUPLICATE ENTITY NA MESMA TABELA
- **Arquivo:** `menu-customization/entities/customization-group.entity.ts` + `menu-items/entities/menu-item-customization-group.entity.ts`
- **Tabela:** `menu_item_customization_groups`
- **Impacto:** Dois TypeORM entities operando na mesma tabela. **Race conditions, dados corrompidos, lost updates em customizações de menu.**

---

### 11. 🟠 PUSH NOTIFICATIONS NUNCA ENVIADAS — 5 TODOs
- **Arquivo:** `orders.service.ts:235`, `reservations.service.ts:162`, `calls.service.ts:139`, `payments.service.ts:408`
- **Fluxos afetados:** FLOW 2, 6, 12
- **Impacto:** Cliente nunca recebe push notification quando: pedido pronto, reserva confirmada, garçom vindo, pagamento recebido. **Experiência do cliente degradada.**

---

### 12. 🟠 TAB PAYMENT SEM IDEMPOTENCY — Pagamento duplicado
- **Arquivo:** `tab-payments.service.ts:23-62`
- **Fluxos afetados:** FLOW 5 (Tab Lifecycle)
- **Impacto:** Retry de pagamento de tab cria 2 registros. **Cliente cobra 2x na conta do bar.**

---

### 13. 🟠 STOCK current_quantity DIVERGE DE movements
- **Arquivo:** `stock.service.ts:81-83, :152-153`
- **Fluxos afetados:** FLOW 9 (Stock Depletion)
- **Impacto:** Se movement salva mas stock update falha, quantidade reportada é maior que real. **Restaurante acha que tem ingrediente quando não tem.**

---

### 14. 🟠 ORDER ITEM ADDITIONS SEM WS EVENT — KDS NÃO VÊ
- **Arquivo:** Order additions service (sem emissão WS)
- **Fluxos afetados:** Partial order / comanda aberta
- **Impacto:** Cliente adiciona items a pedido aberto mas **cozinha nunca recebe os items novos.**

---

### 15. 🟠 RESERVATIONS NÃO INTEGRA COM TABLES
- **Arquivo:** `reservations.module.ts:17` (NÃO importa TablesModule)
- **Fluxos afetados:** FLOW 6 (Reservations)
- **Impacto:** Reserva NÃO marca mesa como "reserved". **Mesa pode ser ocupada manualmente enquanto reservada.**

---

### 16. 🟠 TAB TOTALS RACE CONDITION — Subtotal errado
- **Arquivo:** `tabs.service.ts:225-238`
- **Fluxos afetados:** FLOW 5 (Tab Lifecycle)
- **Impacto:** Concurrent addItem perde update de subtotal. **Conta do cliente mostra valor errado.**

---

### 17. 🟠 PHONE AUTH 100% STUB
- **Arquivo:** `auth.service.ts:228-264`
- **Fluxos afetados:** Auth flow
- **Impacto:** `sendOTP`, `verifyOTP`, `completeRegistration`, `verifyPhone` todos throw NotImplementedException. **Login por telefone não funciona.**

---

### 18. 🟠 ORDER PREPARING SEM TIMEOUT
- **Arquivo:** `orders.service.ts:449-455`
- **Fluxos afetados:** FLOW 2 (Order Status)
- **Impacto:** Pedido fica em PREPARING para sempre se POS crashar. **Cliente espera indefinidamente.**

---

### 19. 🟡 STOCK DEDUCTION SEM IDEMPOTENCY
- **Arquivo:** `stock.service.ts:118-194`
- **Fluxos afetados:** FLOW 9 (Stock)
- **Impacto:** Se order completion é retried, stock deduzido 2x. **Inventário mostra menos do que realmente tem.**

---

### 20. 🟡 FISCAL EVENTS SEM LISTENER — NFC-e status perdido
- **Arquivo:** `fiscal-emission.service.ts:142-222`
- **Fluxos afetados:** FLOW 8 (NFC-e)
- **Impacto:** Eventos `fiscal.nfce.authorized/failed/cancelled` emitidos mas NINGUÉM ouve. **Restaurant app nunca sabe se NFC-e foi autorizada ou falhou.**

---

## CONCLUSÃO

A plataforma tem **arquitetura sólida** (56 módulos, 120 entidades, 238 fluxos, RBAC consistente, SQL seguro) mas sofre de **3 problemas sistêmicos**:

1. **Integração externa 100% stub:** Payment gateways, delivery platforms, push notifications, Google Reserve, SEFAZ Direct — nenhuma integração externa real funciona.

2. **53% dos eventos WebSocket são emitidos para o vazio:** 19 de 36 eventos não têm receptor. O backend "fala" mas ninguém "escuta". Features inteiras (waitlist, tabs, approvals, stock alerts) funcionam no backend mas são invisíveis nos apps mobile.

3. **Consistência de dados frágil:** Race conditions em wallet balance e tab totals, idempotency ausente em payment/stock/loyalty, e transações multi-tabela sem transaction wrapping.

**Nenhum fix foi aplicado. Este relatório é diagnóstico puro com evidência (arquivo:linha) para cada achado.**
