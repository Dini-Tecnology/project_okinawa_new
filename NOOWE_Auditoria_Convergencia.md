# NOOWE — Auditoria de Convergência (Documento 1)
> Gerado em: 2026-03-23 02:40
> Projeto: NOOWE Platform — Backend NestJS + 2 Mobile Apps (Client & Restaurant)

---

## FASE 1: INVENTÁRIO COMPLETO

### 1A) Código Real (GitHub) — O que EXISTE implementado

#### Backend NestJS — 27 Modules

| # | Module | Controllers | Services/Helpers | Entities | DTOs | Gateway |
|---|--------|-------------|------------------|----------|------|---------|
| 1 | **AuthModule** | auth, phone-auth, social-auth, biometric-auth | auth, otp, mfa, credential, audit-log, social-auth, biometric | user-credential, otp-token, biometric-token, password-reset-token, audit-log | login, register, reset-password, confirm-reset, phone-auth, social-auth, biometric-auth, enable-mfa, update-auth | — |
| 2 | **IdentityModule** | — | audit-log, credential, mfa, password-policy, token-blacklist | audit-log, password-reset-token, token-blacklist, user-credential | — | — |
| 3 | **UsersModule** | users | users | user, profile | create-user, update-user, update-profile | — |
| 4 | **UserRolesModule** | user-roles | user-roles | user-role | assign-role | — |
| 5 | **RestaurantsModule** | restaurants | restaurants | restaurant, restaurant-config, operating-hours | create-restaurant, update-restaurant | — |
| 6 | **OrdersModule** | orders, order-guests | orders, order-guests, kds-formatter, maitre-formatter, order-calculator, waiter-stats | order, order-item, order-guest | create-order, update-order, update-order-status, add-order-guest, get-kds-orders, get-waiter-stats | **orders.gateway** |
| 7 | **MenuItemsModule** | menu-items | menu-items | menu-item, menu-category | create-menu-item, update-menu-item, create-category, update-category | — |
| 8 | **PaymentsModule** | payments, payment-split | payments, payment-split | payment-method, payment-split, wallet, wallet-transaction | process-payment, calculate-split, create-payment-split, process-split-payment, create-payment-method, update-payment-method, recharge-wallet, withdraw-wallet | — |
| 9 | **ReservationsModule** | reservations | reservations | reservation, reservation-guest | create-reservation, update-reservation, cancel-reservation | **reservations.gateway** |
| 10 | **TablesModule** | tables | tables | table, zone | create-table, update-table | — |
| 11 | **TabsModule** | tabs | tabs | tab, tab-item | create-tab, update-tab, add-tab-item | **tabs.gateway** |
| 12 | **TipsModule** | tips | tips | tip | create-tip | — |
| 13 | **FavoritesModule** | favorites | favorites | favorite | add-favorite, update-favorite | — |
| 14 | **LoyaltyModule** | loyalty | loyalty | loyalty-program | add-points, redeem-reward, update-loyalty-program | — |
| 15 | **ReviewsModule** | reviews | reviews | review | create-review | — |
| 16 | **NotificationsModule** | notifications | notifications | notification | create-notification, mark-as-read, update-notification | — |
| 17 | **QRCodeModule** | qr-code | qr-code | qr-code | generate-qr | — |
| 18 | **AnalyticsModule** | analytics | analytics, customer-analytics, forecast, metrics-calculator, performance-metrics, sales-aggregator | — | analytics-query | — |
| 19 | **AIModule** | ai | ai | — | analyze-sentiment, forecast-demand, menu-recommendations | — |
| 20 | **FinancialModule** | financial | financial | financial-transaction | create-transaction, update-transaction, financial-report-query | — |
| 21 | **HRModule** | hr | hr | attendance, leave-request, shift | check-in, create-leave-request, create-shift, review-leave-request, update-attendance, update-shift | — |
| 22 | **ClubModule** | birthday-entry, club-entries, guest-list, lineup, occupancy, promoter, qr-code, queue, vip-table-reservations, vip-table-tabs | birthday-entry, club-entries, guest-list, lineup, occupancy, promoter, qr-code, queue, vip-table-reservations, vip-table-tabs | birthday-entry, club-check-in-out, club-entry, guest-list-entry, lineup, lineup-slot, promoter, queue-entry, vip-table-guest, vip-table-reservation, vip-table-tab, vip-table-tab-item | (index barrel) | **queue.gateway** |
| 23 | **EventsModule** | — | — | — | — | **events.gateway** |
| 24 | **HealthModule** | health | — | — | — | — |
| 25 | **I18nModule** | i18n | — | — | — | — |
| 26 | **WebhooksModule** | webhooks | webhooks | — | — | — |
| 27 | **WorkerModule** | — | — | — | — | — |

#### Backend — Common Infrastructure

| Category | Files |
|----------|-------|
| **Guards** | jwt-auth, roles, password-expiry, ip-rate-limit, restaurant-owner, menu-item-owner, idempotency |
| **Interceptors** | transform-response, idempotency |
| **Middleware** | csrf |
| **Filters** | sentry-exception |
| **Decorators** | @CurrentUser, @Language, @Public, @Roles, @SkipTransform |
| **Enums** | club-entry, order-status, order-type, payment-method, reservation-status, service-type, tab-status, user-role |
| **Services** | cache, email, translation, structured-logger, tracing, idempotency |
| **DTOs** | error-response, pagination |

#### Backend — Migrations (8)

| Migration | Purpose |
|-----------|---------|
| CreateOTPTokensTable | OTP authentication |
| CreateBiometricTokensTable | Biometric auth tokens |
| AddDeletedAtToProfile | Soft delete for profiles |
| AddDatabaseIndexes | Performance indexes |
| AddMissingForeignKeyIndexes | FK indexes |
| AddEntityConstraintsAndIndexes | Constraints |
| OrdersTablePartitioning | Orders partitioning |
| AddCompositeIndexes | Composite indexes |

#### Backend — WebSocket Gateways (5)

| Gateway | Purpose |
|---------|---------|
| orders.gateway | Real-time order status updates |
| reservations.gateway | Live reservation changes |
| tabs.gateway | Tab updates (Pub & Bar) |
| queue.gateway | Club queue management |
| events.gateway | General event broadcasting |

#### Backend — Tests

| Type | Files |
|------|-------|
| E2E | auth, auth-mfa, orders, payments, reservations, restaurants |
| Integration | auth-flow, restaurant-order-flow |

---

#### Mobile Client App — 38 Screens

| Domain | Screens |
|--------|---------|
| Auth | LoginScreen, RegisterScreen, WelcomeScreen |
| Onboarding | OnboardingScreen |
| Home | HomeScreen, ExploreScreen |
| Restaurant | RestaurantScreen |
| Menu | MenuScreen, MenuItemCard, DishBuilderScreen |
| Cart | CartScreen |
| Orders | OrdersScreen, OrderStatusScreen, OrderCard, SharedOrderScreen |
| Payment | PaymentScreen, SplitPaymentScreen, DigitalReceiptScreen |
| Reservations | ReservationsScreen, ReservationDetailScreen, CreateReservationScreen, GuestInvitationScreen, VirtualQueueScreen |
| QR Scanner | QRScannerScreen (×2 — /qr-scanner and /scanner) |
| Service | CallWaiterScreen |
| AI | AIPairingAssistantScreen |
| Location | GeolocationTrackingScreen |
| Loyalty | LoyaltyScreen, LoyaltyLeaderboardScreen |
| Reviews | ReviewsScreen |
| Profile | ProfileScreen |
| Settings | SettingsScreen |
| Support | SupportScreen |
| Tips | TipsScreen |
| Wallet | WalletScreen |
| Favorites | FavoritesScreen, FavoriteCard |

#### Mobile Restaurant App — 28 Screens

| Domain | Screens |
|--------|---------|
| Auth | LoginScreen |
| Dashboard | DashboardScreen |
| Orders | OrdersScreen, OrderDetailScreen |
| KDS | KDSScreen, BarmanKDSScreen |
| Floor Plan | FloorPlanScreen, TableDetailScreen |
| Tables | TableListScreen, TableFormScreen |
| Menu | MenuScreen, MenuItemDetailScreen |
| Reservations | ReservationsScreen, ReservationDetailScreen |
| Maitre | MaitreDashboardScreen |
| Waiter | WaiterDashboardScreen |
| Staff | StaffScreen, StaffDetailScreen |
| HR | HRScreen |
| Financial | FinancialScreen, FinancialReportScreen |
| Tips | TipsScreen, TipsDistributionScreen |
| QR Codes | QRCodeGeneratorScreen, QRCodeBatchScreen |
| Service Config | ServiceConfigScreen |
| Setup | SetupHubScreen |
| Settings | SettingsScreen |

#### Mobile Shared — Hooks (12), Services (13), Components (17)

**Hooks:** useAnalytics, useAuth, useBiometricAuth, useFavorites, useI18n, useNotifications, useOffline, useOrders, useOrdersQuery, useRestaurants, useWebSocket

**Services:** analytics, api, auth, biometric-auth, notifications-socket, orders-socket, otp-auth, push-notifications, reservations-socket, secure-storage, social-auth, socket

**Components:** Avatar, Badge, Button, Card, EmptyState, ErrorBoundary, ErrorMessage, Input, LanguagePicker, LiquidGlassNav, LoadingSpinner, RestaurantLiquidGlassNav, Skeleton, StatusBadge, Text + auth components

---

### 1B) Preview /mobile-v2 — O que está DESENHADO

#### Client App — 38 Telas V2

| # | Tela | Propósito | Dados |
|---|------|-----------|-------|
| 1 | OnboardingScreenV2 | Tutorial inicial | Steps, ilustrações |
| 2 | WelcomeScreenV2 | Porta de entrada (Social/Biometric) | Auth methods |
| 3 | PhoneAuthScreenV2 | OTP por telefone | Phone, OTP code |
| 4 | BiometricEnrollmentScreenV2 | Cadastro biometria | Biometric data |
| 5 | LoginScreenV2 | Login legado | Email, password |
| 6 | HomeScreenV2 | Feed principal | Restaurantes, promoções |
| 7 | ExploreScreenV2 | Busca por mapa/filtros | Localização, filtros |
| 8 | RestaurantDetailScreenV2 | Perfil do restaurante | Menu, horários, avaliações |
| 9 | NewReservationScreenV2 | Criar reserva | Data, hora, convidados |
| 10 | ReservationsScreenV2 | Lista de reservas | Reservations[] |
| 11 | ReservationDetailScreenV2 | Detalhe da reserva | Reservation + guests |
| 12 | VirtualQueueScreenV2 | Fila virtual | Position, ETA |
| 13 | QRScannerScreenV2 | Scan de mesa | Camera, QR data |
| 14 | CallWaiterScreenV2 | Chamar garçom/gerente | Request type, message |
| 15 | DishBuilderScreenV2 | Montador de prato | Ingredients, nutrition |
| 16 | PairingAssistantScreenV2 | Harmonização IA | Dish + wine suggestions |
| 17 | CartScreenV2 | Carrinho | Items, quantities, total |
| 18 | CheckoutScreenV2 | Finalizar pedido | Order summary |
| 19 | UnifiedPaymentScreenV2 | Pagamento unificado | Payment methods, tips |
| 20 | SplitPaymentScreenV2 | Split completo | Split modes, participants |
| 21 | SplitByItemScreenV2 | Dividir por item | Items per person |
| 22 | SplitBillCasualScreenV2 | Split casual | Simplified split |
| 23 | SharedOrderScreenV2 | Pedido compartilhado | Guest orders sync |
| 24 | OrdersScreenV2 | Lista pedidos | Orders[] |
| 25 | OrderStatusScreenV2 | Status em tempo real | Status pipeline |
| 26 | DigitalReceiptScreenV2 | Recibo digital | Receipt data |
| 27 | TrackLocationScreenV2 | Rastreamento GPS | Coordinates, ETA |
| 28 | PartialOrderScreenV2 | Pedido parcial | Partial items |
| 29 | CallWaiterCasualScreenV2 | Chamar garçom (casual) | Call types |
| 30 | WaitlistScreenV2 | Fila de espera | Queue position |
| 31 | NotificationsScreenV2 | Notificações | Notification[] |
| 32 | FavoritesScreenV2 | Favoritos | Favorite[] |
| 33 | WalletScreenV2 | Carteira digital | Balance, transactions |
| 34 | CouponsScreenV2 | Cupons | Coupon[] |
| 35 | LoyaltyScreenV2 | Programa fidelidade | Points, tier |
| 36 | LoyaltyDetailScreenV2 | Detalhe fidelidade | Rewards catalog |
| 37 | LoyaltyLeaderboardScreenV2 | Leaderboard | Rankings |
| 38 | RatingScreenV2 | Avaliação | Stars, comment |
| 39 | ProfileScreenV2 | Perfil | User data |
| 40 | SettingsScreenV2 | Configurações | Preferences |
| 41 | AddressesScreenV2 | Endereços | Address[] |
| 42 | SupportScreenV2 | Suporte | FAQ, ticket |
| 43 | TipScreenV2 | Gorjeta | Tip amount |
| 44 | GroupBookingScreenV2 | Reserva grupo | Group details |

#### Restaurant App — 28 Telas V2

| # | Tela | Propósito |
|---|------|-----------|
| 1 | RestaurantLoginScreenV2 | Login staff |
| 2 | RestaurantPhoneAuthScreenV2 | Phone auth staff |
| 3 | RestaurantSelectorScreenV2 | Multi-restaurante selector |
| 4 | RestaurantDashboardScreenV2 | Dashboard principal |
| 5 | RestaurantOrdersScreenV2 | Gestão pedidos |
| 6 | OrderPaymentTrackingScreenV2 | Rastreio pagamentos |
| 7 | KitchenDisplayScreenV2 | KDS Cozinha |
| 8 | BarKDSScreenV2 | KDS Bar |
| 9 | TablesScreenV2 | Mapa de mesas |
| 10 | QRCodeGeneratorScreenV2 | Gerar QR único |
| 11 | QRCodeBatchScreenV2 | QR em lote |
| 12 | MaitreScreenV2 | Painel Maitre |
| 13 | WaiterScreenV2 | Painel Garçom |
| 14 | RoleDashboardScreenV2 | Dashboard por cargo |
| 15 | RestaurantMenuScreenV2 | Gestão cardápio |
| 16 | RestaurantReservationsScreenV2 | Gestão reservas |
| 17 | StaffManagementScreenV2 | Gestão equipe |
| 18 | TipsManagementScreenV2 | Gestão gorjetas |
| 19 | ServiceTypeConfigScreenV2 | Config tipo serviço |
| 20 | LoyaltyManagementScreenV2 | Gestão fidelidade |
| 21 | FinancialScreenV2 | Financeiro |
| 22 | ReportsScreenV2 | Relatórios |
| 23 | ReviewsScreenV2 | Avaliações |
| 24 | PromotionsScreenV2 | Promoções |
| 25 | RestaurantSettingsScreenV2 | Configurações |
| 26 | WaitlistManagementScreenV2 | Gestão fila espera |
| 27 | CallsManagementScreenV2 | Gestão chamados |
| 28 | CasualDiningConfigScreenV2 | Config Casual Dining |

---

### 1C) Demo /demo — O que está IDEALIZADO

#### Client Demo — 11 Experiências de Serviço

| # | Tipo de Serviço | Arquivo | Telas | Etapas Jornada | Âncora Funcional |
|---|----------------|---------|-------|----------------|------------------|
| 1 | Fine Dining | FineDiningDemo.tsx | 18 | 11 | Harmonização IA, Split por Item |
| 2 | Quick Service | QuickServiceDemo.tsx | 9 | 8 | Skip the Line, Preparo 4-estágios |
| 3 | Fast Casual | FastCasualDemo.tsx | 12 | 7 | Dish Builder, Nutrição/Alérgenos |
| 4 | Café & Bakery | CafeBakeryDemo.tsx | 9 | 6 | Work Mode, Refill |
| 5 | Buffet | BuffetDemo.tsx | 10 | 7 | Balança NFC |
| 6 | Drive-Thru | DriveThruDemo.tsx | 11 | 7 | Geofencing GPS 500m |
| 7 | Food Truck | FoodTruckDemo.tsx | 12 | 7 | Mapa RT, Fila Virtual |
| 8 | Chef's Table | ChefsTableDemo.tsx | 13 | 9 | Menu Degustação, Notas Sommelier |
| 9 | Casual Dining | CasualDiningDemo.tsx | 15 | 9 | Smart Waitlist, Modo Família |
| 10 | Pub & Bar | PubBarDemo.tsx | 15 | 9 | Comanda Digital, Round Builder |
| 11 | Club & Balada | ClubDemo.tsx | 18 | 9 | QR Animado, VIP, Consumo Mínimo |

#### Restaurant Demo — 7 Roles × 22 Screens

| Role | Screens | Funcionalidades Chave |
|------|---------|----------------------|
| **Owner** | Dashboard, Financial, Analytics, Staff, Settings | Visão 360°, aprovações, KPIs |
| **Manager** | Dashboard, Orders, Approvals, Reports, Staff | Gestão operacional, aprovações |
| **Maitre** | Floor Plan, Reservations, Queue, Check-in | Controle de salão |
| **Chef** | KDS, Pipeline, SLA Tracking, Prep Stations | Comando de cozinha |
| **Barman** | Bar KDS, Recipes, Stock, Priority | KDS bar separado |
| **Cook** | My Station, Prep List, Timers | Estação individual |
| **Waiter** | Table Map, Orders, Calls, Split Bill | Orquestração de mesa |

#### Shared Demo Components

| Component | LOC | Purpose |
|-----------|-----|---------|
| DemoShared.tsx | ~200 | PhoneShell, BottomNav, GuidedHint, SERVICE_TYPES |
| DemoPayment.tsx | ~310 | Payment panel with tips, loyalty, methods |
| DemoOrderStatus.tsx | ~400 | Order tracking with per-service pipelines |
| DemoSplitBill.tsx | ~230 | 4-mode split bill |
| DemoPaymentSuccess.tsx | ~150 | Payment confirmation |
| FoodImages.tsx | ~200 | 100+ Unsplash photo URLs |
| DemoI18n.tsx | ~300 | MutationObserver translation engine |
| DemoFeedbackWidget.tsx | ~300 | Contextual feedback collection |

---

## FASE 2: MATRIZ DE CONVERGÊNCIA

### Client App — Funcionalidades Cruzadas

| Funcionalidade | Demo /demo | Mobile-V2 | Código (Backend + Mobile) | Status |
|---|---|---|---|---|
| **Autenticação (Email/Password)** | — | LoginScreenV2 | AuthModule + LoginScreen | ✅ Completo |
| **Auth Social (Google/Apple)** | — | WelcomeScreenV2 | social-auth controller + social-auth.service | ✅ Completo |
| **Auth Phone (OTP)** | — | PhoneAuthScreenV2 | phone-auth controller + OTPService + PhoneAuthScreen (missing RN screen) | ⚠️ Parcial |
| **Auth Biometria** | — | BiometricEnrollmentScreenV2 | biometric controller + BiometricService | ⚠️ Parcial |
| **Onboarding** | — | OnboardingScreenV2 | OnboardingScreen | ✅ Completo |
| **Home/Feed** | 11× explore screens | HomeScreenV2 | HomeScreen | ✅ Completo |
| **Explore/Busca** | 11× explore screens | ExploreScreenV2 | ExploreScreen + RestaurantsModule | ✅ Completo |
| **Restaurant Detail** | 11× restaurant views | RestaurantDetailScreenV2 | RestaurantScreen | ✅ Completo |
| **Menu Interativo** | 11× menu screens | — (in RestaurantDetail) | MenuScreen + MenuItemsModule | ✅ Completo |
| **Carrinho** | 11× cart screens | CartScreenV2 | CartScreen (no backend cart entity) | ⚠️ Parcial |
| **Checkout** | 11× checkout | CheckoutScreenV2 | — (no CheckoutScreen RN) | ⚠️ Parcial |
| **Pedidos (CRUD)** | 11× order flows | OrdersScreenV2, OrderStatusScreenV2 | OrdersModule + OrdersScreen + OrderStatusScreen | ✅ Completo |
| **Pedido Compartilhado** | Fine Dining, Casual | SharedOrderScreenV2 | SharedOrderScreen + OrderGuestsController | ✅ Completo |
| **Status em Tempo Real** | 11× pipelines | OrderStatusScreenV2 | orders.gateway + OrderStatusScreen | ✅ Completo |
| **Pagamento** | 11× payment | UnifiedPaymentScreenV2 | PaymentsModule + PaymentScreen | ✅ Completo |
| **Split Payment (4 modos)** | Fine Dining, Casual, Pub | SplitPaymentScreenV2, SplitByItemScreenV2 | PaymentSplitController + SplitPaymentScreen | ✅ Completo |
| **Gorjeta** | 11× tip | TipScreenV2 | TipsModule + TipsScreen | ✅ Completo |
| **Recibo Digital** | 11× receipt | DigitalReceiptScreenV2 | DigitalReceiptScreen (no backend receipt entity) | ⚠️ Parcial |
| **Reservas** | Fine Dining, Chef's Table | ReservationsScreenV2, NewReservationScreenV2, ReservationDetailScreenV2 | ReservationsModule + Screens | ✅ Completo |
| **Convite de Convidados** | Fine Dining | — | GuestInvitationScreen + reservation-guest entity | ⚠️ Parcial |
| **Fila Virtual** | Food Truck, Casual | VirtualQueueScreenV2, WaitlistScreenV2 | VirtualQueueScreen (no dedicated backend queue for restaurants) | ⚠️ Parcial |
| **QR Scanner** | 11× scan | QRScannerScreenV2 | QRScannerScreen + QRCodeModule | ✅ Completo |
| **Chamar Garçom** | Fine Dining, Casual | CallWaiterScreenV2, CallWaiterCasualScreenV2 | CallWaiterScreen (no backend call entity) | ⚠️ Parcial |
| **Dish Builder** | Fast Casual | DishBuilderScreenV2 | DishBuilderScreen (no backend customization entity) | ⚠️ Parcial |
| **Harmonização IA** | Fine Dining | PairingAssistantScreenV2 | AIPairingAssistantScreen + AIModule | ✅ Completo |
| **Geolocation Tracking** | Drive-Thru | TrackLocationScreenV2 | GeolocationTrackingScreen (no backend geofence) | ⚠️ Parcial |
| **Favoritos** | — | FavoritesScreenV2 | FavoritesModule + FavoritesScreen | ✅ Completo |
| **Carteira Digital** | — | WalletScreenV2 | Wallet entity + WalletScreen | ✅ Completo |
| **Cupons** | — | CouponsScreenV2 | — (no backend coupons module) | ❌ Ausente |
| **Fidelidade** | 11× loyalty | LoyaltyScreenV2, LoyaltyDetailScreenV2, LoyaltyLeaderboardScreenV2 | LoyaltyModule + LoyaltyScreen + LeaderboardScreen | ✅ Completo |
| **Avaliação/Rating** | 11× rating | RatingScreenV2 | ReviewsModule + ReviewsScreen | ✅ Completo |
| **Notificações** | — | NotificationsScreenV2 | NotificationsModule (no RN NotificationsScreen) | ⚠️ Parcial |
| **Perfil** | — | ProfileScreenV2 | ProfileScreen + UsersModule | ✅ Completo |
| **Configurações** | — | SettingsScreenV2 | SettingsScreen | ✅ Completo |
| **Endereços** | — | AddressesScreenV2 | — (no backend addresses entity) | ❌ Ausente |
| **Suporte** | — | SupportScreenV2 | SupportScreen (no backend support module) | ⚠️ Parcial |
| **Reserva Grupo** | — | GroupBookingScreenV2 | — (no specific group booking) | ❌ Ausente |
| **Pedido Parcial** | Casual Dining | PartialOrderScreenV2 | — (no partial order logic) | ❌ Ausente |
| **Comanda Digital (Tab)** | Pub & Bar | — | TabsModule + tabs.gateway | ⚠️ Parcial |
| **Club & Balada** | Full flow in demo | — | ClubModule (full) | ⚠️ Parcial |

### Restaurant App — Funcionalidades Cruzadas

| Funcionalidade | Demo /demo/restaurant | Mobile-V2 | Código (Backend + Mobile) | Status |
|---|---|---|---|---|
| **Login Staff** | Setup Wizard | RestaurantLoginScreenV2, PhoneAuthScreenV2 | LoginScreen + AuthModule | ✅ Completo |
| **Multi-Restaurante** | — | RestaurantSelectorScreenV2 | RestaurantsModule | ⚠️ Parcial |
| **Dashboard** | Owner/Manager dashboards | RestaurantDashboardScreenV2 | DashboardScreen | ✅ Completo |
| **Gestão Pedidos** | Orders across roles | RestaurantOrdersScreenV2 | OrdersScreen + OrderDetailScreen | ✅ Completo |
| **Pagamentos/Track** | — | OrderPaymentTrackingScreenV2 | — (no dedicated tracking screen) | ⚠️ Parcial |
| **KDS Cozinha** | Chef role screens | KitchenDisplayScreenV2 | KDSScreen | ✅ Completo |
| **KDS Bar** | Barman role | BarKDSScreenV2 | BarmanKDSScreen | ✅ Completo |
| **Mapa Mesas** | Maitre floor plan | TablesScreenV2 | FloorPlanScreen + TableDetailScreen + TablesModule | ✅ Completo |
| **QR Code Geração** | — | QRCodeGeneratorScreenV2, QRCodeBatchScreenV2 | QRCodeGeneratorScreen + QRCodeBatchScreen + QRCodeModule | ✅ Completo |
| **Maitre Painel** | Maitre journey | MaitreScreenV2 | MaitreDashboardScreen | ✅ Completo |
| **Garçom Painel** | Waiter journey | WaiterScreenV2 | WaiterDashboardScreen | ✅ Completo |
| **Dashboard por Cargo** | Role-based views | RoleDashboardScreenV2 | — (no RoleDashboardScreen RN) | ⚠️ Parcial |
| **Gestão Cardápio** | Menu management | RestaurantMenuScreenV2 | MenuScreen + MenuItemDetailScreen | ✅ Completo |
| **Gestão Reservas** | Maitre reservations | RestaurantReservationsScreenV2 | ReservationsScreen + ReservationDetailScreen | ✅ Completo |
| **Gestão Equipe** | Staff management | StaffManagementScreenV2 | StaffScreen + StaffDetailScreen + HRModule | ✅ Completo |
| **Gestão Gorjetas** | — | TipsManagementScreenV2 | TipsScreen + TipsDistributionScreen | ✅ Completo |
| **Config Tipo Serviço** | Setup wizard | ServiceTypeConfigScreenV2 | ServiceConfigScreen | ✅ Completo |
| **Gestão Fidelidade** | — | LoyaltyManagementScreenV2 | — (no restaurant loyalty mgmt screen RN) | ⚠️ Parcial |
| **Financeiro** | Owner financial | FinancialScreenV2 | FinancialScreen + FinancialReportScreen + FinancialModule | ✅ Completo |
| **Relatórios** | Analytics dashboards | ReportsScreenV2 | — (no ReportsScreen RN, but AnalyticsModule exists) | ⚠️ Parcial |
| **Avaliações** | — | ReviewsScreenV2 | ReviewsModule (no restaurant ReviewsScreen RN) | ⚠️ Parcial |
| **Promoções** | — | PromotionsScreenV2 | — (no PromotionsModule backend) | ❌ Ausente |
| **Configurações** | Settings screens | RestaurantSettingsScreenV2 | SettingsScreen | ✅ Completo |
| **Fila de Espera** | Queue management | WaitlistManagementScreenV2 | — (no restaurant waitlist screen RN) | ⚠️ Parcial |
| **Gestão Chamados** | Waiter calls | CallsManagementScreenV2 | — (no calls management) | ❌ Ausente |
| **Config Casual Dining** | — | CasualDiningConfigScreenV2 | — (no specific config screen) | ❌ Ausente |
| **Setup Hub** | Setup wizard | — | SetupHubScreen | ⚠️ Parcial |
| **HR (Escala/Ponto)** | Staff scheduling | — | HRScreen + HRModule | ⚠️ Parcial |

---

## FASE 3: GAP ANALYSIS DETALHADO

### GAP 1: Cupons (❌ AUSENTE)

**Demo espera:** Nenhum fluxo específico na demo.
**Mobile-V2 mostra:** CouponsScreenV2 — tela com lista de cupons disponíveis, resgate e aplicação no checkout.
**Código tem:** Nada — nenhum módulo, entity ou screen.
**Falta implementar:**
- Backend: CouponsModule (entity: Coupon, CouponUsage), DTOs (create-coupon, apply-coupon), CouponsController, CouponsService
- Frontend Client: CouponsScreen.tsx, useCoupons hook
- Banco: coupons table, coupon_usages table

### GAP 2: Endereços (❌ AUSENTE)

**Demo espera:** Nenhum fluxo específico.
**Mobile-V2 mostra:** AddressesScreenV2 — CRUD de endereços com geolocalização.
**Código tem:** Nada.
**Falta implementar:**
- Backend: AddressesModule (entity: Address), AddressesController, AddressesService
- Frontend Client: AddressesScreen.tsx, useAddresses hook
- Banco: addresses table com FK para users

### GAP 3: Reserva de Grupo (❌ AUSENTE)

**Demo espera:** Nenhum fluxo específico.
**Mobile-V2 mostra:** GroupBookingScreenV2 — reserva para grupos grandes com pré-configuração.
**Código tem:** ReservationsModule existe mas sem lógica de grupo.
**Falta implementar:**
- Backend: Estender ReservationsService com lógica de grupo (mínimo, menu pré-fixado)
- Frontend Client: GroupBookingScreen.tsx
- Banco: Colunas group_size, pre_fixed_menu na tabela reservations

### GAP 4: Pedido Parcial (❌ AUSENTE)

**Demo espera:** Casual Dining permite pedidos parciais (pedir agora, adicionar depois).
**Mobile-V2 mostra:** PartialOrderScreenV2.
**Código tem:** OrdersModule (mas sem lógica de parcial/incremental).
**Falta implementar:**
- Backend: Estender OrdersService — método addItemsToOrder, status "open_for_additions"
- Frontend Client: PartialOrderScreen.tsx

### GAP 5: Promoções Restaurante (❌ AUSENTE)

**Demo espera:** Nenhum fluxo direto.
**Mobile-V2 mostra:** PromotionsScreenV2 — criar/gerenciar promoções.
**Código tem:** Nada.
**Falta implementar:**
- Backend: PromotionsModule (entity: Promotion), PromotionsController, PromotionsService
- Frontend Restaurant: PromotionsScreen.tsx
- Banco: promotions table

### GAP 6: Gestão de Chamados (❌ AUSENTE)

**Demo espera:** Waiter recebe chamados de clientes.
**Mobile-V2 mostra:** CallsManagementScreenV2.
**Código tem:** Nenhum módulo de chamados.
**Falta implementar:**
- Backend: CallsModule (entity: ServiceCall), CallsController, CallsService, calls.gateway (WebSocket)
- Frontend Client: CallWaiterScreen envia call
- Frontend Restaurant: CallsManagementScreen.tsx recebe calls
- Real-time: calls.gateway para push notifications

### GAP 7: Config Casual Dining (❌ AUSENTE)

**Demo espera:** Setup com funcionalidades Casual Dining (Waitlist, Modo Família).
**Mobile-V2 mostra:** CasualDiningConfigScreenV2.
**Código tem:** ServiceConfigScreen (genérico).
**Falta implementar:**
- Frontend Restaurant: CasualDiningConfigScreen.tsx (ou extend ServiceConfigScreen)

### GAP 8: Chamar Garçom — Backend (⚠️ PARCIAL)

**Demo espera:** Cliente chama garçom/gerente; garçom recebe notificação.
**Mobile-V2 mostra:** CallWaiterScreenV2, CallWaiterCasualScreenV2.
**Código tem:** CallWaiterScreen (frontend RN) mas sem backend entity/module.
**Falta:** Ver GAP 6 — precisa de CallsModule completo.

### GAP 9: Carrinho sem Backend Entity (⚠️ PARCIAL)

**Demo espera:** Carrinho stateful em todas as 11 experiências.
**Mobile-V2 mostra:** CartScreenV2.
**Código tem:** CartScreen no RN + CartContext no shared — mas sem backend persistência.
**Decisão:** Carrinho pode ser client-side only (CartContext). ✅ Aceitável se não precisar de persistência cross-device.

### GAP 10: Recibo Digital sem Backend (⚠️ PARCIAL)

**Código tem:** DigitalReceiptScreen RN, mas sem entity Receipt no backend.
**Falta:** ReceiptsModule ou gerar receipt a partir de Order+Payment.

### GAP 11: Fila Virtual — Backend Restaurante (⚠️ PARCIAL)

**Demo espera:** Fila virtual para restaurantes lotados.
**Código tem:** VirtualQueueScreen (client RN) + queue.gateway (club only).
**Falta:**
- Backend: Estender ou criar WaitlistModule para restaurantes (separado de ClubModule)
- Frontend Restaurant: WaitlistManagementScreen (V2 existe, RN não)
- Real-time: waitlist.gateway

### GAP 12: Geofencing sem Backend (⚠️ PARCIAL)

**Demo espera:** Drive-Thru — trigger a 500m.
**Código tem:** GeolocationTrackingScreen RN, mas sem backend geofence entity.
**Falta:**
- Backend: GeofenceModule ou integrar com RestaurantsModule (coordinates, radius)

### GAP 13: Dish Builder sem Backend (⚠️ PARCIAL)

**Código tem:** DishBuilderScreen RN, mas sem backend customization/composition entity.
**Falta:**
- Backend: Estender MenuItemsModule — entity MenuItemCustomization, dto CreateCustomization

### GAP 14: Notificações Screen RN (⚠️ PARCIAL)

**Código tem:** NotificationsModule (backend completo), mas sem NotificationsScreen no RN.
**Falta:**
- Frontend Client: NotificationsScreen.tsx

### GAP 15: Role Dashboard RN (⚠️ PARCIAL)

**Mobile-V2 mostra:** RoleDashboardScreenV2.
**Código tem:** RoleDashboardScreen não existe no RN restaurant app.
**Falta:**
- Frontend Restaurant: RoleDashboardScreen.tsx

### GAP 16: Reports Screen RN (⚠️ PARCIAL)

**Mobile-V2 mostra:** ReportsScreenV2.
**Código tem:** AnalyticsModule (backend), mas sem ReportsScreen no RN.
**Falta:**
- Frontend Restaurant: ReportsScreen.tsx consumindo AnalyticsController

### GAP 17: Reviews Screen Restaurant RN (⚠️ PARCIAL)

**Mobile-V2 mostra:** ReviewsScreenV2.
**Código tem:** ReviewsModule (backend), mas sem ReviewsScreen no restaurant RN.
**Falta:**
- Frontend Restaurant: ReviewsScreen.tsx

### GAP 18: Loyalty Management Restaurant RN (⚠️ PARCIAL)

**Mobile-V2 mostra:** LoyaltyManagementScreenV2.
**Código tem:** LoyaltyModule (backend), mas sem LoyaltyManagementScreen no RN restaurant.
**Falta:**
- Frontend Restaurant: LoyaltyManagementScreen.tsx

### GAP 19: Comanda Digital — Frontend (⚠️ PARCIAL)

**Demo espera:** Pub & Bar com comanda digital, Round Builder.
**Código tem:** TabsModule + tabs.gateway (backend completo), mas sem TabScreen/RoundBuilder no client RN.
**Falta:**
- Frontend Client: TabScreen.tsx, RoundBuilderSheet.tsx
- Frontend Client: Tab hooks (useTab)

### GAP 20: Club & Balada — Frontend (⚠️ PARCIAL)

**Demo espera:** Full journey (tickets, queue, VIP, lineup, consumo mínimo).
**Código tem:** ClubModule COMPLETO no backend (11 controllers, 11 services, 12 entities, queue.gateway).
**Mobile-V2 mostra:** Club screens em mobile-preview V1 (not V2).
**RN Mobile tem:** Nenhuma screen específica de club.
**Falta:**
- Frontend Client: TicketPurchaseScreen, QueueScreen, VipTableScreen, LineupScreen, etc.
- Frontend Restaurant: DoorControlScreen, QueueManagementScreen, VipTableManagementScreen, PromoterManagementScreen

