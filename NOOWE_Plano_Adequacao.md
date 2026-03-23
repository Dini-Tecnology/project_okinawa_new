# NOOWE — Plano de Adequação (Documento 2)
> Gerado em: 2026-03-23 02:42
> Projeto: NOOWE Platform — Backend NestJS + 2 Mobile Apps (Client & Restaurant)

---

## FASE 4: PLANO DE ADEQUAÇÃO (Sprint Plan Executável)

### Resumo de Status

| Status | Contagem |
|--------|----------|
| ✅ Completo | 28 funcionalidades |
| ⚠️ Parcial | 20 funcionalidades |
| ❌ Ausente | 7 funcionalidades |

### Dependências Críticas

```
CallsModule ← Chamar Garçom (Client) + Gestão Chamados (Restaurant)
WaitlistModule ← Fila Virtual (Client) + Gestão Fila (Restaurant)
CouponsModule ← Cupons (Client) + Checkout integration
PromotionsModule ← Promoções (Restaurant) + Feed integration
```

---

### SPRINT 1 — Quick Wins: Screens RN Faltantes (Backend pronto)
**Duração:** 2 semanas
**Objetivo:** Criar todas as screens React Native que têm backend pronto mas faltam no mobile.

FRONTEND CLIENT:
- [ ] Screen: NotificationsScreen.tsx — Lista de notificações (ref visual: NotificationsScreenV2). Consome GET /notifications
- [ ] Screen: TabScreen.tsx — Comanda digital Pub & Bar (ref visual: mobile-preview/client/pub-bar/). Consome TabsModule
- [ ] Screen: RoundBuilderSheet.tsx — Montador de rodada para Pub & Bar. Integra com tabs.gateway
- [ ] Screen: TabPaymentScreen.tsx — Fechamento de comanda. Consome PaymentsModule

FRONTEND RESTAURANT:
- [ ] Screen: RoleDashboardScreen.tsx — Dashboard adaptado por cargo (ref: RoleDashboardScreenV2)
- [ ] Screen: ReportsScreen.tsx — Relatórios consumindo GET /analytics (ref: ReportsScreenV2)
- [ ] Screen: ReviewsScreen.tsx — Gestão avaliações consumindo ReviewsModule (ref: ReviewsScreenV2)
- [ ] Screen: LoyaltyManagementScreen.tsx — Gestão fidelidade (ref: LoyaltyManagementScreenV2)

TESTES:
- [ ] Unit: Cada nova screen com render test
- [ ] Integration: Navegação para cada nova screen

---

### SPRINT 2 — Chamados & Fila Virtual (Backend novo + Frontend)
**Duração:** 2 semanas
**Objetivo:** Sistema completo de chamar garçom e fila de espera para restaurantes.

BACKEND:
- [ ] Entity: ServiceCallEntity — campos: id, table_id, restaurant_id, user_id, call_type (waiter|manager|help), status, message, created_at, resolved_at
- [ ] DTO: CreateServiceCallDto, UpdateServiceCallDto
- [ ] Service: CallsService — create(), resolve(), getByRestaurant(), getByTable()
- [ ] Controller: POST /calls, PATCH /calls/:id, GET /restaurants/:id/calls
- [ ] Gateway: calls.gateway — eventos: 'new_call', 'call_resolved'
- [ ] Migration: CreateServiceCallsTable
- [ ] Entity: WaitlistEntryEntity — campos: id, restaurant_id, user_id, party_size, status, estimated_wait, position, created_at
- [ ] Service: WaitlistService — joinQueue(), leaveQueue(), getPosition(), advanceQueue()
- [ ] Controller: POST /waitlist, DELETE /waitlist/:id, GET /restaurants/:id/waitlist
- [ ] Gateway: waitlist.gateway — eventos: 'queue_update', 'called'
- [ ] Migration: CreateWaitlistTable

FRONTEND CLIENT:
- [ ] Screen: CallWaiterScreen.tsx — Atualizar para usar CallsModule (ref: CallWaiterScreenV2, CallWaiterCasualScreenV2)
- [ ] Hook: useCalls.ts — Mutations create/cancel, subscription calls.gateway
- [ ] Hook: useWaitlist.ts — Join, leave, position tracking via waitlist.gateway

FRONTEND RESTAURANT:
- [ ] Screen: CallsManagementScreen.tsx — Lista de chamados ativos com ação resolve (ref: CallsManagementScreenV2)
- [ ] Screen: WaitlistManagementScreen.tsx — Gestão fila de espera (ref: WaitlistManagementScreenV2)
- [ ] Hook: useRestaurantCalls.ts — Lista e resolve calls
- [ ] Hook: useRestaurantWaitlist.ts — Gerenciar fila

REAL-TIME:
- [ ] Gateway: CallsGateway — join room by restaurant_id, emit on new/resolved
- [ ] Gateway: WaitlistGateway — emit position updates on queue changes

TESTES:
- [ ] Unit: CallsService.spec.ts, WaitlistService.spec.ts
- [ ] E2E: /calls endpoint, /waitlist endpoint

---

### SPRINT 3 — Cupons, Endereços & Promoções (Novos módulos)
**Duração:** 2 semanas
**Objetivo:** Criar os 3 módulos ausentes: Cupons, Endereços e Promoções.

BACKEND:
- [ ] Entity: CouponEntity — id, code, discount_type (percentage|fixed), discount_value, min_order, max_uses, used_count, valid_from, valid_until, restaurant_id, active
- [ ] Entity: CouponUsageEntity — id, coupon_id, user_id, order_id, used_at
- [ ] Service: CouponsService — validate(), apply(), create(), deactivate()
- [ ] Controller: POST /coupons, GET /coupons/validate/:code, POST /coupons/apply
- [ ] Migration: CreateCouponsTable
- [ ] Entity: AddressEntity — id, user_id, label, street, number, complement, neighborhood, city, state, zip, lat, lng, is_default
- [ ] Service: AddressesService — CRUD + setDefault()
- [ ] Controller: CRUD /addresses
- [ ] Migration: CreateAddressesTable
- [ ] Entity: PromotionEntity — id, restaurant_id, title, description, image_url, discount_type, discount_value, valid_from, valid_until, target_service_types[], active
- [ ] Service: PromotionsService — CRUD + getActive()
- [ ] Controller: CRUD /promotions, GET /restaurants/:id/promotions
- [ ] Migration: CreatePromotionsTable

FRONTEND CLIENT:
- [ ] Screen: CouponsScreen.tsx — Lista cupons, validação e resgate (ref: CouponsScreenV2)
- [ ] Screen: AddressesScreen.tsx — CRUD endereços (ref: AddressesScreenV2)
- [ ] Hook: useCoupons.ts, useAddresses.ts

FRONTEND RESTAURANT:
- [ ] Screen: PromotionsScreen.tsx — Criar/gerenciar promoções (ref: PromotionsScreenV2)
- [ ] Hook: usePromotions.ts

TESTES:
- [ ] Unit: CouponsService.spec.ts, AddressesService.spec.ts, PromotionsService.spec.ts
- [ ] E2E: /coupons, /addresses, /promotions endpoints

---

### SPRINT 4 — Customizações de Menu, Recibos & Geofencing
**Duração:** 2 semanas
**Objetivo:** Backend para Dish Builder, Recibo Digital e Geofencing.

BACKEND:
- [ ] Entity: MenuItemCustomizationEntity — id, menu_item_id, group_name, options[] (name, price_delta, calories), min_select, max_select
- [ ] Service: Estender MenuItemsService — getWithCustomizations(), priceCalculator()
- [ ] Migration: CreateMenuCustomizationsTable
- [ ] Entity: ReceiptEntity — id, order_id, payment_id, user_id, items_snapshot (jsonb), total, tax, tip, generated_at
- [ ] Service: ReceiptsService — generate() (from Order+Payment), getByUser()
- [ ] Controller: GET /receipts/:orderId, GET /users/:id/receipts
- [ ] Migration: CreateReceiptsTable
- [ ] Extension: RestaurantsModule — adicionar campos lat, lng, geofence_radius à entity Restaurant
- [ ] Service: Estender RestaurantsService — findNearby(lat, lng, radius)
- [ ] Migration: AddGeofenceColumnsToRestaurants

FRONTEND CLIENT:
- [ ] Screen: DishBuilderScreen.tsx — Atualizar para consumir customizations do backend
- [ ] Screen: DigitalReceiptScreen.tsx — Atualizar para consumir ReceiptsModule
- [ ] Screen: GeolocationTrackingScreen.tsx — Atualizar para usar geofence_radius do restaurante

TESTES:
- [ ] Unit: MenuItemsService customization tests
- [ ] Unit: ReceiptsService.spec.ts

---

### SPRINT 5 — Club & Balada Frontend + Reserva de Grupo
**Duração:** 2 semanas
**Objetivo:** Criar todas as screens mobile para Club (backend já pronto) e reserva de grupo.

FRONTEND CLIENT:
- [ ] Screen: TicketPurchaseScreen.tsx — Compra ingressos (ref: mobile-preview/client/club/)
- [ ] Screen: ClubQueueScreen.tsx — Fila do club com QR (ref: QueueScreen)
- [ ] Screen: VipTableScreen.tsx — Reserva mesa VIP (ref: VipTableScreen)
- [ ] Screen: LineupScreen.tsx — Ver lineup de eventos
- [ ] Screen: BirthdayEntryRequestScreen.tsx — Pedido aniversário
- [ ] Screen: GroupBookingScreen.tsx — Reserva de grupo (ref: GroupBookingScreenV2)
- [ ] Hook: useClub.ts — tickets, queue, VIP
- [ ] Navigation: Adicionar rotas club no ClientNavigator

FRONTEND RESTAURANT:
- [ ] Screen: DoorControlScreen.tsx — Check-in/out na porta (ref: mobile-preview/restaurant/club/)
- [ ] Screen: ClubQueueManagementScreen.tsx — Gerenciar fila
- [ ] Screen: VipTableManagementScreen.tsx — Gerenciar mesas VIP
- [ ] Screen: PromoterManagementScreen.tsx — Gerenciar promoters
- [ ] Navigation: Adicionar rotas club no RestaurantNavigator

BACKEND:
- [ ] Extension: ReservationsService — addGroupBookingLogic (group_size, pre_fixed_menu)
- [ ] Migration: AddGroupColumnsToReservations

TESTES:
- [ ] Unit: Club screens render tests
- [ ] Integration: Club flow navigation

---

### SPRINT 6 — Pedido Parcial, Casual Dining Config & Polish
**Duração:** 2 semanas
**Objetivo:** Features restantes + polish cross-cutting.

BACKEND:
- [ ] Extension: OrdersService — addItemsToExistingOrder(), status "open_for_additions"
- [ ] DTO: AddItemsToOrderDto

FRONTEND CLIENT:
- [ ] Screen: PartialOrderScreen.tsx — Adicionar itens a pedido aberto (ref: PartialOrderScreenV2)

FRONTEND RESTAURANT:
- [ ] Screen: CasualDiningConfigScreen.tsx — Configuração Casual Dining (ref: CasualDiningConfigScreenV2)
- [ ] Extension: SetupHubScreen — Integrar referência visual do V2

CROSS-CUTTING:
- [ ] Verificar cobertura i18n (PT/EN/ES) em todas as novas screens
- [ ] Verificar dark mode em todas as novas screens
- [ ] Audit de acessibilidade (labels, contrast)
- [ ] Performance audit (lazy loading, bundle size)

TESTES:
- [ ] E2E: Fluxo completo Fine Dining (reserva → pedido → pagamento → avaliação)
- [ ] E2E: Fluxo completo Pub & Bar (comanda → rodadas → split → fechamento)
- [ ] E2E: Fluxo Club (ticket → queue → VIP → tab)

---

## FASE 5: MAPA DE TELAS CONSOLIDADO

### Client App — Mapa Completo (60 telas)

| # | Tela | Fonte | Fluxo | Backend Endpoint | Status | Sprint |
|---|------|-------|-------|-----------------|--------|--------|
| 1 | WelcomeScreen | V2 + RN | Auth | POST /auth/social | ✅ | — |
| 2 | PhoneAuthScreen | V2 | Auth | POST /auth/phone | ⚠️ | — |
| 3 | BiometricEnrollmentScreen | V2 | Auth | POST /auth/biometric | ⚠️ | — |
| 4 | LoginScreen | V2 + RN | Auth | POST /auth/login | ✅ | — |
| 5 | RegisterScreen | RN | Auth | POST /auth/register | ✅ | — |
| 6 | OnboardingScreen | V2 + RN | Onboarding | — (client-side) | ✅ | — |
| 7 | HomeScreen | V2 + RN + Demo | Core | GET /restaurants | ✅ | — |
| 8 | ExploreScreen | V2 + RN + Demo | Discovery | GET /restaurants?filter | ✅ | — |
| 9 | RestaurantScreen | V2 + RN + Demo | Discovery | GET /restaurants/:id | ✅ | — |
| 10 | MenuScreen | RN + Demo | Order | GET /restaurants/:id/menu | ✅ | — |
| 11 | DishBuilderScreen | V2 + RN + Demo | Order | GET /menu-items/:id/customizations | ⚠️ | S4 |
| 12 | AIPairingAssistantScreen | V2 + RN + Demo | Order | POST /ai/recommendations | ✅ | — |
| 13 | CartScreen | V2 + RN + Demo | Order | — (CartContext) | ✅ | — |
| 14 | CheckoutScreen | V2 + Demo | Order | POST /orders | ⚠️ | — |
| 15 | SharedOrderScreen | V2 + RN + Demo | Order | POST /order-guests | ✅ | — |
| 16 | PartialOrderScreen | V2 + Demo | Order | PATCH /orders/:id/items | ❌ | S6 |
| 17 | OrdersScreen | V2 + RN + Demo | Orders | GET /orders | ✅ | — |
| 18 | OrderStatusScreen | V2 + RN + Demo | Orders | WS orders.gateway | ✅ | — |
| 19 | PaymentScreen | V2 + RN + Demo | Payment | POST /payments | ✅ | — |
| 20 | UnifiedPaymentScreen | V2 + Demo | Payment | POST /payments | ✅ | — |
| 21 | SplitPaymentScreen | V2 + RN + Demo | Payment | POST /payment-splits | ✅ | — |
| 22 | SplitByItemScreen | V2 + Demo | Payment | POST /payment-splits | ✅ | — |
| 23 | TipsScreen | V2 + RN + Demo | Payment | POST /tips | ✅ | — |
| 24 | DigitalReceiptScreen | V2 + RN + Demo | Payment | GET /receipts/:orderId | ⚠️ | S4 |
| 25 | ReservationsScreen | V2 + RN + Demo | Reservations | GET /reservations | ✅ | — |
| 26 | ReservationDetailScreen | V2 + RN + Demo | Reservations | GET /reservations/:id | ✅ | — |
| 27 | CreateReservationScreen | RN + Demo | Reservations | POST /reservations | ✅ | — |
| 28 | NewReservationScreen | V2 | Reservations | POST /reservations | ✅ | — |
| 29 | GuestInvitationScreen | RN | Reservations | POST /reservations/:id/guests | ⚠️ | — |
| 30 | GroupBookingScreen | V2 | Reservations | POST /reservations (group) | ❌ | S5 |
| 31 | VirtualQueueScreen | V2 + RN + Demo | Queue | POST /waitlist | ⚠️ | S2 |
| 32 | WaitlistScreen | V2 | Queue | GET /waitlist/position | ⚠️ | S2 |
| 33 | QRScannerScreen | V2 + RN + Demo | Service | POST /qr-codes/validate | ✅ | — |
| 34 | CallWaiterScreen | V2 + RN + Demo | Service | POST /calls | ⚠️ | S2 |
| 35 | GeolocationTrackingScreen | V2 + RN + Demo | Service | GET /restaurants/:id (geofence) | ⚠️ | S4 |
| 36 | TabScreen | V1 + Demo | Pub & Bar | GET /tabs/:id, WS tabs.gateway | ⚠️ | S1 |
| 37 | RoundBuilderSheet | V1 + Demo | Pub & Bar | POST /tabs/:id/items | ⚠️ | S1 |
| 38 | TabPaymentScreen | V1 + Demo | Pub & Bar | POST /payments (tab) | ⚠️ | S1 |
| 39 | TicketPurchaseScreen | V1 + Demo | Club | POST /club/entries | ❌ | S5 |
| 40 | ClubQueueScreen | V1 + Demo | Club | WS queue.gateway | ❌ | S5 |
| 41 | VipTableScreen | V1 + Demo | Club | POST /club/vip-tables | ❌ | S5 |
| 42 | LineupScreen | V1 + Demo | Club | GET /club/lineups | ❌ | S5 |
| 43 | BirthdayEntryRequestScreen | V1 + Demo | Club | POST /club/birthday-entries | ❌ | S5 |
| 44 | NotificationsScreen | V2 | Notifications | GET /notifications | ⚠️ | S1 |
| 45 | FavoritesScreen | V2 + RN | Profile | GET /favorites | ✅ | — |
| 46 | WalletScreen | V2 + RN | Wallet | GET /wallet, POST /wallet/recharge | ✅ | — |
| 47 | CouponsScreen | V2 | Wallet | GET /coupons, POST /coupons/apply | ❌ | S3 |
| 48 | AddressesScreen | V2 | Profile | CRUD /addresses | ❌ | S3 |
| 49 | LoyaltyScreen | V2 + RN + Demo | Loyalty | GET /loyalty | ✅ | — |
| 50 | LoyaltyDetailScreen | V2 + RN | Loyalty | GET /loyalty/:id | ✅ | — |
| 51 | LoyaltyLeaderboardScreen | V2 + RN + Demo | Loyalty | GET /loyalty/leaderboard | ✅ | — |
| 52 | RatingScreen | V2 + RN + Demo | Reviews | POST /reviews | ✅ | — |
| 53 | ReviewsScreen | RN | Reviews | GET /reviews | ✅ | — |
| 54 | ProfileScreen | V2 + RN | Profile | GET /users/me | ✅ | — |
| 55 | SettingsScreen | V2 + RN | Profile | PATCH /users/me | ✅ | — |
| 56 | SupportScreen | V2 + RN | Support | — (no backend) | ⚠️ | — |

### Restaurant App — Mapa Completo (38 telas)

| # | Tela | Fonte | Backend Endpoint | Status | Sprint |
|---|------|-------|-----------------|--------|--------|
| 1 | LoginScreen | V2 + RN | POST /auth/login | ✅ | — |
| 2 | PhoneAuthScreen | V2 | POST /auth/phone | ⚠️ | — |
| 3 | RestaurantSelectorScreen | V2 | GET /restaurants?owner=me | ⚠️ | — |
| 4 | SetupHubScreen | RN | — (client-side wizard) | ⚠️ | S6 |
| 5 | DashboardScreen | V2 + RN + Demo | GET /analytics/dashboard | ✅ | — |
| 6 | OrdersScreen | V2 + RN + Demo | GET /orders | ✅ | — |
| 7 | OrderDetailScreen | RN + Demo | GET /orders/:id | ✅ | — |
| 8 | OrderPaymentTrackingScreen | V2 | GET /payments?restaurant=:id | ⚠️ | — |
| 9 | KDSScreen | V2 + RN + Demo | WS orders.gateway (KDS) | ✅ | — |
| 10 | BarmanKDSScreen | V2 + RN + Demo | WS orders.gateway (Bar) | ✅ | — |
| 11 | FloorPlanScreen | RN + Demo | GET /tables?restaurant=:id | ✅ | — |
| 12 | TableDetailScreen | RN | GET /tables/:id | ✅ | — |
| 13 | TablesScreen | V2 | GET /tables | ✅ | — |
| 14 | TableListScreen | RN | GET /tables | ✅ | — |
| 15 | TableFormScreen | RN | POST/PATCH /tables | ✅ | — |
| 16 | QRCodeGeneratorScreen | V2 + RN | POST /qr-codes | ✅ | — |
| 17 | QRCodeBatchScreen | V2 + RN | POST /qr-codes/batch | ✅ | — |
| 18 | MaitreDashboardScreen | V2 + RN + Demo | GET /reservations + /waitlist | ✅ | — |
| 19 | WaiterDashboardScreen | V2 + RN + Demo | GET /orders?waiter=:id | ✅ | — |
| 20 | RoleDashboardScreen | V2 + Demo | GET /analytics/role/:role | ⚠️ | S1 |
| 21 | MenuScreen | V2 + RN + Demo | CRUD /menu-items | ✅ | — |
| 22 | MenuItemDetailScreen | RN | GET /menu-items/:id | ✅ | — |
| 23 | ReservationsScreen | V2 + RN + Demo | GET /reservations | ✅ | — |
| 24 | ReservationDetailScreen | RN | GET /reservations/:id | ✅ | — |
| 25 | StaffScreen | V2 + RN + Demo | GET /users?restaurant=:id | ✅ | — |
| 26 | StaffDetailScreen | RN | GET /users/:id | ✅ | — |
| 27 | HRScreen | RN + Demo | GET /hr/shifts | ⚠️ | — |
| 28 | TipsScreen | V2 + RN + Demo | GET /tips | ✅ | — |
| 29 | TipsDistributionScreen | RN | POST /tips/distribute | ✅ | — |
| 30 | ServiceConfigScreen | V2 + RN + Demo | PATCH /restaurants/:id/config | ✅ | — |
| 31 | FinancialScreen | V2 + RN + Demo | GET /financial | ✅ | — |
| 32 | FinancialReportScreen | RN | GET /financial/report | ✅ | — |
| 33 | SettingsScreen | V2 + RN | PATCH /restaurants/:id | ✅ | — |
| 34 | ReportsScreen | V2 + Demo | GET /analytics | ⚠️ | S1 |
| 35 | ReviewsScreen | V2 | GET /reviews?restaurant=:id | ⚠️ | S1 |
| 36 | LoyaltyManagementScreen | V2 | CRUD /loyalty | ⚠️ | S1 |
| 37 | PromotionsScreen | V2 | CRUD /promotions | ❌ | S3 |
| 38 | CallsManagementScreen | V2 + Demo | GET /calls, WS calls.gateway | ❌ | S2 |
| 39 | WaitlistManagementScreen | V2 + Demo | GET /waitlist, WS waitlist.gateway | ❌ | S2 |
| 40 | CasualDiningConfigScreen | V2 | — (extends ServiceConfig) | ❌ | S6 |
| 41 | DoorControlScreen | V1 + Demo | POST /club/check-in | ❌ | S5 |
| 42 | ClubQueueManagementScreen | V1 + Demo | GET /club/queue | ❌ | S5 |
| 43 | VipTableManagementScreen | V1 + Demo | CRUD /club/vip-tables | ❌ | S5 |
| 44 | PromoterManagementScreen | V1 + Demo | CRUD /club/promoters | ❌ | S5 |

---

### Cronograma Visual

```
Sprint 1 (Sem 1-2):  Quick Wins — 8 screens RN faltantes (backend pronto)
Sprint 2 (Sem 3-4):  Chamados + Fila Virtual — 2 novos modules + 4 screens + 2 gateways
Sprint 3 (Sem 5-6):  Cupons + Endereços + Promoções — 3 novos modules + 3 screens
Sprint 4 (Sem 7-8):  Dish Builder + Recibos + Geofencing — Extensões backend + 3 screens
Sprint 5 (Sem 9-10): Club Frontend + Reserva Grupo — 10 screens (backend Club já pronto)
Sprint 6 (Sem 11-12): Pedido Parcial + Config + Polish — Features finais + QA
```

**Total estimado:** 12 semanas (6 sprints de 2 semanas)
**Novas entidades backend:** 7 (ServiceCall, WaitlistEntry, Coupon, CouponUsage, Address, Promotion, Receipt, MenuItemCustomization)
**Novas screens RN:** ~25 (Client: ~17, Restaurant: ~8)
**Novos WebSocket gateways:** 2 (calls, waitlist)
**Novos modules NestJS:** 5 (Calls, Waitlist, Coupons, Addresses, Promotions)

---

*Fim do Documento 2 — Plano de Adequação*
