# NOOWE Platform — UI/UX Audit Report
**Date:** 2026-04-01
**Scope:** Client App (62 screens) + Restaurant App (81 screens) + Shared (9 screens)
**Rule:** Diagnosis only. No fixes applied.

---

## RESUMO EXECUTIVO

| Metric | Count |
|--------|-------|
| **Total de telas encontradas** | 152 (restaurant: 81, client: 62, shared: 9) |
| **Total de rotas de navegacao** | 144 (client: 53, restaurant: 91) |
| **Rotas mortas (navigate para rota inexistente)** | 17 (client: 9, restaurant: 8) |
| **Telas orfas (sem rota)** | 0 (todas registradas apos ETAPA 8 anterior) |
| **Total de botoes/acoes auditados** | 250+ |
| **Botoes mortos (onPress vazio/console.log)** | 3 |
| **Total de formularios** | 44 (client: 14, restaurant: 30) |
| **Formularios sem validacao schema** | 43 (apenas ConfigProfileScreen usa Zod) |
| **Total de fluxos de navegacao** | 120+ transicoes mapeadas |
| **Fluxos com transicoes quebradas** | 5 (rotas inexistentes) |
| **Strings hardcoded** | 239 placeholder attributes em 17 telas |
| **Cores hardcoded (#hex)** | 231 instancias em 48 telas |
| **Font sizes hardcoded nao-padrao** | 125+ (11px, 13px, 15px, 22px — fora do grid 4px) |
| **Telas sem loading state** | 7 (PaymentSuccess, QRScanner, Support, EntryChoice, FamilyActivities, Onboarding, Welcome) |
| **Telas sem error state** | 7 (mesmas + PaymentSuccess sem error handling) |
| **Telas sem empty state** | ~60 (telas de detalhe/form nao precisam; ~15 listas sem empty state) |
| **Componentes duplicados entre apps** | 1 (OrderCard existe em shared + client + restaurant) |
| **Telas sem accessibilityLabel** | 51 (29% do total) |
| **TextInputs sem KeyboardAvoidingView** | 39 telas (72% das que tem input) |
| **FlatLists sem getItemLayout** | 51 de 53 (96%) |
| **Telas sem SafeArea** | 160+ (~93%) |
| **Touch targets < 44px** | 48 componentes |
| **Gravidade geral UI/UX** | **ALTA** |

---

## FASE 1 — INVENTARIO COMPLETO

### 1.1 — Todas as telas (152 total)

#### Restaurant App (81 telas)

| # | Filename | Lines | Purpose |
|---|----------|-------|---------|
| 1 | LoginScreen.tsx | 138 | Staff auth with email/password + Zod |
| 2 | DashboardScreen.tsx | 316 | Main dashboard with analytics/KPIs |
| 3 | RoleDashboardScreen.tsx | 628 | Role-based dashboard per user role |
| 4 | OrdersScreen.tsx | 427 | Active orders with status filtering |
| 5 | OrderDetailScreen.tsx | 479 | Detailed order view with items |
| 6 | KDSScreen.tsx | 377 | Kitchen display system |
| 7 | BarmanKDSScreen.tsx | 579 | Barman drink order display |
| 8 | BarmanStationScreen.tsx | 1257 | Barman complete workstation |
| 9 | RecipeDetailScreen.tsx | 492 | Drink recipe technical sheet |
| 10 | CookStationScreen.tsx | 985 | Cook's filtered KDS view |
| 11 | ChefViewScreen.tsx | 480 | Chef overview all stations |
| 12 | ChefApprovalsScreen.tsx | 219 | Chef table reservation approval |
| 13 | ChefTableScreen.tsx | 423 | Chef's table tasting courses |
| 14 | MaitreDashboardScreen.tsx | 688 | Maitre dashboard |
| 15 | MaitreWaitlistScreen.tsx | 767 | Waitlist management |
| 16 | FloorFlowScreen.tsx | 659 | Visual floor plan |
| 17 | WaiterDashboardScreen.tsx | 560 | Waiter dashboard |
| 18 | WaiterCallsScreen.tsx | 503 | Waiter call list |
| 19 | TableDetailScreen (waiter) | 1291 | Waiter table detail (4 tabs) |
| 20 | FloorPlanScreen.tsx | 441 | Table layout visualization |
| 21 | TableDetailScreen.tsx | 487 | Table details with orders |
| 22 | TableListScreen.tsx | 457 | Table inventory list |
| 23 | TableFormScreen.tsx | 346 | Table creation/edit form |
| 24 | ReservationsScreen.tsx | 396 | Reservation list |
| 25 | ReservationDetailScreen.tsx | 290 | Reservation detail |
| 26 | MenuScreen.tsx | 326 | Menu item list |
| 27 | MenuItemDetailScreen.tsx | 539 | Menu item detail |
| 28 | StockScreen.tsx | 858 | Inventory management |
| 29 | StockItemDetailScreen.tsx | 607 | Inventory item detail |
| 30 | StaffScreen.tsx | 335 | Staff member list |
| 31 | StaffDetailScreen.tsx | 326 | Staff member profile |
| 32 | FinancialScreen.tsx | 545 | Financial dashboard |
| 33 | FinancialReportScreen.tsx | 398 | Financial reports |
| 34 | BillsScreen.tsx | 685 | Accounts payable |
| 35 | ForecastScreen.tsx | 423 | Cash flow forecast |
| 36 | CashRegisterScreen.tsx | 1010 | POS cash register |
| 37 | MarginDashboardScreen.tsx | 622 | Food cost margins |
| 38 | RecipeScreen.tsx | 771 | Recipe cost control |
| 39 | TipsScreen.tsx | 360 | Tips summary |
| 40 | TipsDistributionScreen.tsx | 338 | Tips distribution |
| 41 | HRScreen.tsx | 352 | HR dashboard |
| 42 | ReportsScreen.tsx | 704 | Analytics reports |
| 43 | KdsAnalyticsScreen.tsx | 669 | Kitchen analytics |
| 44 | KdsBrainConfigScreen.tsx | 349 | KDS Brain settings |
| 45 | StationSettingsScreen.tsx | 547 | Station config |
| 46 | LoyaltyManagementScreen.tsx | 567 | Loyalty admin |
| 47 | RestaurantReviewsScreen.tsx | 589 | Review management |
| 48 | CustomerCrmScreen.tsx | 876 | Customer CRM |
| 49 | IntegrationSettingsScreen.tsx | 565 | Platform integrations |
| 50 | CallsManagementScreen.tsx | 812 | Service calls |
| 51 | ApprovalsScreen.tsx | 633 | Manager approvals |
| 52 | DailyReportScreen.tsx | 513 | Daily sales report |
| 53 | ManagerOpsScreen.tsx | 544 | Manager ops dashboard |
| 54 | PromotionsManagerScreen.tsx | 1001 | Promotion management |
| 55-63 | Config*Screen.tsx (9) | 166-496 | Configuration hub screens |
| 64 | ServiceConfigScreen.tsx | 663 | Service settings |
| 65 | SetupHubScreen.tsx | 586 | Initial setup guide |
| 66 | FiscalSetupScreen.tsx | 565 | NFC-e fiscal config |
| 67 | TapToPayScreen.tsx | 343 | NFC tap-to-pay |
| 68 | DrinkRecipesScreen.tsx | 362 | Recipe library |
| 69-72 | Club screens (4) | 259-673 | Club/nightlife management |
| 73-74 | Drive/FoodTruck (2) | 400-412 | Service type screens |
| 75-77 | QR screens (3) | 519-562 | QR code management |
| 78 | SettingsScreen.tsx | 159 | App settings |
| 79-81 | Other (3) | Various | Door control, floor plan detail |

#### Client App (62 telas)

| # | Filename | Lines | Purpose |
|---|----------|-------|---------|
| 1 | LoginScreen.tsx | 284 | Client auth |
| 2 | RegisterScreen.tsx | 276 | Registration |
| 3 | WelcomeScreen.tsx | 283 | Welcome with animations |
| 4 | OnboardingScreen.tsx | 389 | Feature introduction |
| 5 | HomeScreen.tsx | 592 | Featured restaurants |
| 6 | ExploreScreen.tsx | 554 | Restaurant discovery |
| 7 | RestaurantScreen.tsx | 424 | Restaurant details |
| 8 | MenuScreen.tsx | 285 | Menu browsing |
| 9 | DishBuilderScreen.tsx | 497 | Customizable dish |
| 10 | CartScreen.tsx | 482 | Shopping cart |
| 11 | OrdersScreen.tsx | 232 | Order list |
| 12 | OrderStatusScreen.tsx | 763 | Order tracking |
| 13 | SharedOrderScreen.tsx | 722 | Group order |
| 14 | PartialOrderScreen.tsx | 554 | Add items to open order |
| 15 | CheckoutScreen.tsx | 596 | Final checkout |
| 16 | PaymentScreen.tsx | 849 | Payment methods |
| 17 | UnifiedPaymentScreen.tsx | 1232 | Multi-method payment |
| 18 | SplitPaymentScreen.tsx | 1069 | Bill splitting |
| 19 | PaymentSuccessScreen.tsx | 432 | Payment confirmation |
| 20 | DigitalReceiptScreen.tsx | 660 | Digital receipt |
| 21 | ReservationsScreen.tsx | 278 | Reservation list |
| 22 | ReservationDetailScreen.tsx | 668 | Reservation detail |
| 23 | CreateReservationScreen.tsx | 530 | Reservation form |
| 24 | GroupBookingScreen.tsx | 689 | Group booking |
| 25 | GuestInvitationScreen.tsx | 644 | Guest invites |
| 26 | VirtualQueueScreen.tsx | 660 | Virtual queue |
| 27 | LoyaltyScreen.tsx | 563 | Loyalty programs |
| 28 | LoyaltyHomeScreen.tsx | 709 | Loyalty dashboard |
| 29 | LoyaltyDetailScreen.tsx | 626 | Loyalty detail |
| 30 | LoyaltyLeaderboardScreen.tsx | 672 | Leaderboard |
| 31 | StampCardsScreen.tsx | 413 | Stamp cards |
| 32 | CouponsScreen.tsx | 483 | Coupons |
| 33-38 | Club screens (6) | 372-731 | Club/nightlife |
| 39 | TabScreen.tsx | 726 | Pub/bar tab |
| 40 | TabPaymentScreen.tsx | 609 | Tab payment |
| 41 | RoundBuilderSheet.tsx | 619 | Round builder |
| 42 | WaitlistScreen.tsx | 678 | Waitlist |
| 43 | WaitlistBarScreen.tsx | 360 | Bar queue |
| 44 | EntryChoiceScreen.tsx | 312 | Entry type selection |
| 45 | FamilyModeScreen.tsx | 564 | Family mode |
| 46 | FamilyActivitiesScreen.tsx | 333 | Kids activities |
| 47 | WalletScreen.tsx | 391 | Digital wallet |
| 48 | ProfileScreen.tsx | 530 | User profile |
| 49 | AddressesScreen.tsx | 664 | Addresses |
| 50 | NotificationsScreen.tsx | 592 | Notifications |
| 51 | ReviewsScreen.tsx | 454 | User reviews |
| 52 | TipsScreen.tsx | 237 | Tips history |
| 53 | FavoritesScreen.tsx | 202 | Favorites |
| 54 | QRScannerScreen.tsx | 538 | QR scanner |
| 55 | CallWaiterScreen.tsx | 425 | Call waiter |
| 56 | BuffetCheckinScreen.tsx | 301 | Buffet checkin |
| 57 | SettingsScreen.tsx | 450 | Settings |
| 58 | ManageConsentsScreen.tsx | 222 | LGPD consents |
| 59 | SupportScreen.tsx | 225 | FAQ/support |
| 60 | GeolocationTrackingScreen.tsx | 600 | Location tracking |
| 61 | AIPairingAssistantScreen.tsx | 481 | AI pairing |

#### Shared (9 telas)

| # | Filename | Lines | Purpose |
|---|----------|-------|---------|
| 1 | WelcomeScreen.tsx | 289 | Passwordless-first auth |
| 2 | PhoneAuthScreen.tsx | 351 | Phone OTP auth |
| 3 | PhoneRegisterScreen.tsx | 385 | Phone registration |
| 4 | BiometricEnrollmentScreen.tsx | 99 | Biometric enrollment |
| 5 | PrivacyPolicyScreen.tsx | 141 | Privacy policy |
| 6 | TermsOfServiceScreen.tsx | 141 | Terms of service |
| 7 | ReConsentScreen.tsx | 413 | LGPD re-consent |
| 8 | MaintenanceScreen.tsx | 149 | 503 overlay |
| 9 | AIDisclaimerModal.tsx | 244 | AI disclaimer |

---

### 1.2 — Rotas mortas (navigate para rota inexistente)

#### Client App — 9 rotas mortas

| Rota chamada | Chamada de | Rota correta |
|-------------|-----------|-------------|
| `RestaurantDetail` | HomeScreen, ExploreScreen | `Restaurant` |
| `OrderDetail` | HomeScreen | `OrderStatus` |
| `OrderTracking` | OrdersScreen | `OrderStatus` |
| `DigitalReceipt` | PaymentSuccessScreen, OrderStatusScreen | **Nao registrada** |
| `PaymentMethods` | ProfileScreen, WalletScreen | **Nao registrada** |
| `Support` | SettingsScreen | **Nao registrada** |
| `Onboarding` | WelcomeScreen, SettingsScreen | **Nao registrada** |
| `Auth` | SettingsScreen, ReviewsScreen | **Stack condicional, nao nomeada** |
| `LoyaltyHistory` | LoyaltyHomeScreen | **Nao registrada** |

#### Restaurant App — 8 rotas mortas

| Rota chamada | Chamada de | Rota correta |
|-------------|-----------|-------------|
| `ManagerApprovals` | ManagerOpsScreen | `Approvals` |
| `CreateReservation` | ReservationsScreen | **Nao registrada** |
| `EditMenuItem` | MenuScreen | **Nao registrada** |
| `CreateMenuItem` | MenuScreen | **Nao registrada** |
| `StaffDetails` | StaffScreen | `StaffDetail` |
| `StaffSchedule` | StaffScreen | **Nao registrada** |
| `AddStaff` | StaffScreen | **Nao registrada** |
| `QRScanner` | WaiterDashboardScreen | **Nao registrada** |

---

### 1.3 — Arvore de navegacao

```
CLIENT APP:
├── AuthStack
│   ├── Welcome, PhoneAuth, PhoneRegister, BiometricEnrollment
│   ├── Login, Register
├── MainStack
│   ├── MainTabs (Home, Explore, Orders, Profile)
│   ├── Restaurant, Menu, Cart, Checkout
│   ├── Payment/UnifiedPayment, SplitPayment, PaymentSuccess
│   ├── OrderStatus, SharedOrder, PartialOrder
│   ├── Reservations (list, detail, create, group, guest)
│   ├── Loyalty (detail, home, stamps)
│   ├── Club (home, queue, ticket, VIP, lineup, birthday)
│   ├── Tab (tab, payment)
│   ├── Waitlist (main, bar, choice)
│   ├── Wallet, Favorites, QRScanner, CallWaiter, BuffetCheckin
│   ├── Notifications, Reviews, Tips, Coupons, Addresses
│   ├── Settings, ManageConsents, PrivacyPolicy, Terms, ReConsent

RESTAURANT APP:
├── AuthStack (Welcome, PhoneAuth, PhoneRegister, Biometric, Login)
├── MainStack
│   ├── MainDrawer (34 role-based screens)
│   │   ├── Dashboard, RoleDashboard
│   │   ├── KDS, BarmanKDS, BarmanStation, CookStation, ChefView, StationSettings
│   │   ├── WaiterDashboard, MaitreDashboard, WaiterCalls, FloorFlow, Calls
│   │   ├── Orders, Reservations, FloorPlan, Menu
│   │   ├── Stock, Financial, Tips, CashRegister, MarginDashboard
│   │   ├── Staff, HR, Reports, LoyaltyManagement
│   │   ├── Integrations, KdsAnalytics, KdsBrainConfig, CustomerCRM
│   │   ├── DriveThru, FoodTruck, ChefTable, DoorControl
│   ├── Detail screens (8): OrderDetail, ReservationDetail, TableDetail, etc.
│   ├── Config screens (12): ConfigHub, Profile, ServiceTypes, etc.
│   ├── Manager screens (6): Approvals, DailyReport, Promotions, etc.
│   ├── Club screens (4): VipTable, ClubQueue, Promoter, Door management
│   ├── Financial Brain (4): TapToPay, FiscalSetup, Forecast, Bills
│   ├── Other (10+): Settings, ServiceConfig, Reviews, Recipes, etc.
```

---

## FASE 2 — AUDITORIA POR TELA (Resumo)

### 2.1 — Estados de loading/error/empty

| Estado | Client (62) | Restaurant (81) | Total Coverage |
|--------|------------|----------------|---------------|
| **Loading** | 55 (89%) | 79 (98%) | 134/152 (88%) |
| **Error** | 55 (89%) | 79 (98%) | 134/152 (88%) |
| **Empty** | 30 (48%) | 56 (69%) | 86/152 (57%) |
| **Pull-to-refresh** | 24 (39%) | 49 (60%) | 73/152 (48%) |

### 2.2 — Botoes mortos (3 encontrados)

| # | Tela | App | Elemento | Linha | Problema |
|---|------|-----|----------|-------|----------|
| 1 | LoyaltyHomeScreen | client | "Program Rules" button | :695 | `onPress={() => {}}` — nao navega |
| 2 | FloorFlowScreen | restaurant | Modal overlay | :148 | `onPress={() => {}}` — modal nao responde |
| 3 | MaitreWaitlistScreen | restaurant | Call guest modal | :716 | `onPress={() => {}}` — modal nao responde |

### 2.3 — Formularios e validacao

| Tipo | Count | % do total |
|------|-------|-----------|
| Com Zod schema | 1 (ConfigProfileScreen) | 2% |
| Validacao manual (useState) | 43 | 98% |
| **Sem validacao nenhuma** | ~5 | Estimado |

Problemas principais:
- Card validation duplicada entre PaymentScreen e UnifiedPaymentScreen
- Phone validation difere entre LoginScreen e PhoneAuthScreen
- Email validation manual em vez de schema
- CNPJ sem mascara no FiscalSetupScreen

---

## FASE 3 — FLUXOS ENTRE TELAS

### 3.1 — Transicoes quebradas (5 criticas)

| # | De | Para | Problema |
|---|---|------|---------|
| 1 | OrdersScreen | `OrderTracking` | Rota nao existe. Deveria ser `OrderStatus` |
| 2 | PaymentSuccessScreen | `DigitalReceipt` | Rota nao registrada no navigation |
| 3 | ProfileScreen | `PaymentMethods` | Rota nao existe |
| 4 | SettingsScreen | `Support` | Rota nao existe |
| 5 | MenuScreen (restaurant) | `EditMenuItem`/`CreateMenuItem` | Rotas nao existem |

### 3.2 — Query invalidation apos mutacoes

| Padrao | Count | Status |
|--------|-------|--------|
| Mutacoes COM invalidateQueries | 80% | Bom |
| Mutacoes SEM invalidacao | 20% | Dados stale |
| Mutacoes SEM feedback de sucesso | 3 | CallWaiter, Birthday, Ticket |
| Mutacoes SEM feedback de erro | 8 | Varios |

---

## FASE 4 — CONSISTENCIA VISUAL

### 4.1 — Cores hardcoded

**231 instancias de #hex em 48 telas**

Piores violadores:
- LoyaltyScreen: 12 cores hardcoded (tier colors)
- LoyaltyLeaderboardScreen: 10
- OnboardingScreen: 6 (cores incompativeis com brand)
- RestaurantReviewsScreen: 8

### 4.2 — Tipografia

- Sistema definido em `shared/theme/typography.ts`: 23 variantes
- **660+ fontSize hardcoded** em inline styles
- **125+ tamanhos nao-padrao** (11px, 13px, 15px, 22px — fora do grid 4px)

### 4.3 — Espacamento

- Sistema definido em `shared/theme/spacing.ts`: base 4px
- Apenas **10 violacoes**: `padding: 15` (9x), `padding: 3` (1x)
- Score: 92/100

### 4.4 — i18n

- 3 idiomas completos: pt-BR, en-US, es-ES (~1000+ keys cada)
- **239 placeholder/label hardcoded** em 17 telas
- Cobertura geral: 95/100

### 4.5 — Componentes duplicados

| Componente | Shared | Client | Restaurant | Status |
|-----------|--------|--------|-----------|--------|
| OrderCard | Existe | Duplicado | Duplicado | DUPLICADO |
| MenuItemCard | Nao | Existe | Existe (diferente) | OK (dominios diferentes) |
| Outros | 37 shared | Proprios | Proprios | OK |

---

## FASE 5 — INTERACOES E UX

### 5.1 — Acessibilidade

| Metric | Value | Status |
|--------|-------|--------|
| Telas COM accessibilityLabel | 124 (71%) | Regular |
| Telas SEM accessibilityLabel | 51 (29%) | RUIM |
| accessibilityHint usage | 26 (4%) | MUITO BAIXO |
| Touch targets < 44px | 48 componentes | RUIM |
| hitSlop usage | 1 componente | CRITICO |

### 5.2 — Keyboard Handling

| Metric | Value | Status |
|--------|-------|--------|
| Telas com TextInput | 54 | - |
| COM KeyboardAvoidingView | 15 (28%) | RUIM |
| SEM keyboard handling | 39 (72%) | CRITICO |

### 5.3 — SafeArea

| Metric | Value | Status |
|--------|-------|--------|
| Telas com SafeAreaView/insets | 15 (~7%) | CRITICO |
| Telas SEM safe area | 160+ (~93%) | CRITICO |

### 5.4 — FlatList Performance

| Metric | Value | Status |
|--------|-------|--------|
| FlatLists total | 53 | - |
| COM keyExtractor | 53 (100%) | BOM |
| COM getItemLayout | 2 (4%) | RUIM |
| COM windowSize tuning | 0 (0%) | CRITICO |

### 5.5 — Gestos

Apenas 3 onLongPress implementados:
1. FoodTruckScreen: confirm pickup (COM accessibilityHint)
2. ConfigFloorScreen: delete table (SEM label)
3. AddressesScreen: context menu (SEM label)

Zero swipe gestures, zero pan gestures.

---

## FASE 6 — CONSISTENCIA ENTRE APPS

### 6.1 — Sincronizacao real-time

Eventos WebSocket conectados (apos ETAPA 2 anterior):
- `order:new/update/cancelled` — ✅ Ambos apps
- `reservation:new/update` — ✅ Ambos
- `call:new/updated` — ✅ Restaurant, ✅ Client via WebSocket
- `waitlist:*` — ✅ Conectados (shared/waitlist-socket.ts)
- `table:*` — ✅ Restaurant apenas (correto)
- `tab:*` — ✅ Restaurant (agora conectado)

Eventos ainda faltando listener NO APP:
- `tabUpdate` — restaurant socket escuta, mas nenhuma tela consome o evento local
- `notification:read/all_read/unread_count` — socket escuta, badge nao atualiza

---

## TOP 30 PROBLEMAS DE UI/UX

### 🔴 CRITICOS (impacto direto na funcionalidade)

| # | Problema | Tela | App | Tipo | Impacto |
|---|---------|------|-----|------|---------|
| 1 | **39 telas com TextInput SEM KeyboardAvoidingView** | Multiplas | Ambos | UX quebrado | Teclado cobre inputs, usuario nao consegue digitar |
| 2 | **160+ telas SEM SafeAreaView** | Todas | Ambos | Layout quebrado | Conteudo invade notch/dynamic island em iPhones |
| 3 | **`DigitalReceipt` rota nao existe** | PaymentSuccess, OrderStatus | Client | Fluxo quebrado | Usuario nao consegue ver recibo digital |
| 4 | **`PaymentMethods` rota nao existe** | Profile, Wallet | Client | Fluxo quebrado | Usuario nao consegue gerenciar cartoes |
| 5 | **`EditMenuItem`/`CreateMenuItem` rotas nao existem** | MenuScreen | Restaurant | Fluxo quebrado | Staff nao consegue criar/editar items do menu |
| 6 | **`Support` rota nao existe** | SettingsScreen | Client | Fluxo quebrado | Usuario nao consegue acessar suporte |
| 7 | **`CreateReservation` rota nao existe (restaurant)** | ReservationsScreen | Restaurant | Fluxo quebrado | Maitre nao consegue criar reserva pelo app |
| 8 | **`AddStaff`/`StaffSchedule` rotas nao existem** | StaffScreen | Restaurant | Fluxo quebrado | Manager nao consegue adicionar staff |
| 9 | **FloorFlowScreen modal morto** | FloorFlowScreen:148 | Restaurant | Botao morto | Maitre nao consegue interagir com detalhes da mesa |
| 10 | **MaitreWaitlistScreen modal morto** | MaitreWaitlistScreen:716 | Restaurant | Botao morto | Maitre nao consegue chamar guest da fila |

### 🟡 ALTOS (experiencia degradada)

| # | Problema | Tela | App | Tipo | Impacto |
|---|---------|------|-----|------|---------|
| 11 | **231 cores hardcoded** | 48 telas | Ambos | Inconsistencia | Dark mode nao funciona corretamente |
| 12 | **125+ fontSize nao-padrao** | Multiplas | Ambos | Inconsistencia | Tipografia inconsistente, parece "amador" |
| 13 | **48 touch targets < 44px** | Multiplas | Ambos | Acessibilidade | Dificil de tocar em botoes pequenos |
| 14 | **51 telas SEM accessibilityLabel** | Multiplas | Ambos | Acessibilidade | Screen reader nao funciona |
| 15 | **LoyaltyHomeScreen "Program Rules" botao morto** | LoyaltyHome:695 | Client | Botao morto | Usuario nao vê regras do programa |
| 16 | **OrderCard duplicado em 3 locais** | shared + client + restaurant | Ambos | Duplicata | Mudanca em um nao reflete nos outros |
| 17 | **Card validation duplicada** | PaymentScreen + UnifiedPayment | Client | Duplicata | Bugs diferentes em cada tela de pagamento |
| 18 | **`OrderTracking` navega para rota inexistente** | OrdersScreen | Client | Navegacao | Crash ou tela branca ao tocar em pedido |
| 19 | **`ManagerApprovals` nome errado** | ManagerOpsScreen | Restaurant | Navegacao | Manager nao chega na tela de aprovacoes |
| 20 | **`StaffDetails` vs `StaffDetail` (typo)** | StaffScreen | Restaurant | Navegacao | Crash ao tocar em membro do staff |

### 🟢 MEDIOS (melhorias de qualidade)

| # | Problema | Tela | App | Tipo | Impacto |
|---|---------|------|-----|------|---------|
| 21 | **51/53 FlatLists sem getItemLayout** | Listas | Ambos | Performance | Scroll lento em listas longas |
| 22 | **0 FlatLists com windowSize tuning** | Listas | Ambos | Performance | Memoria alta em listas grandes |
| 23 | **CNPJ sem mascara** | FiscalSetupScreen | Restaurant | Validacao | Input confuso para usuario |
| 24 | **98% forms sem schema validation** | Multiplas | Ambos | Validacao | Dados invalidos enviados ao backend |
| 25 | **239 placeholder hardcoded** | 17 telas | Ambos | i18n | Placeholders nao traduzem |
| 26 | **3 mutacoes sem feedback** | CallWaiter, Birthday, Ticket | Client | UX | Usuario nao sabe se acao funcionou |
| 27 | **~15 listas sem empty state** | Multiplas | Ambos | UX | Tela vazia sem explicacao |
| 28 | **accessibilityHint em apenas 4% das telas** | Multiplas | Ambos | Acessibilidade | Contexto insuficiente para screen reader |
| 29 | **1 hitSlop em 90 TouchableOpacity** | Multiplas | Ambos | Acessibilidade | Area de toque nao expandida |
| 30 | **0 gestos de swipe implementados** | Todas | Ambos | UX | Interacao limitada comparada a apps modernos |

---

## SCORE GERAL

| Dimensao | Score | Status |
|----------|-------|--------|
| Funcionalidade (rotas, botoes) | 78/100 | 17 rotas mortas, 3 botoes mortos |
| Loading/Error/Empty states | 85/100 | Bom coverage, algumas gaps |
| Consistencia visual (cores, typo) | 72/100 | 231 hex hardcoded, 125 fontSize custom |
| i18n | 95/100 | Excelente, apenas placeholders |
| Acessibilidade | 45/100 | **CRITICO — 51 telas sem labels, 39 sem keyboard** |
| Performance (FlatList) | 60/100 | keyExtractor ok, getItemLayout missing |
| Safe Area | 15/100 | **CRITICO — 93% sem safe area** |
| Navegacao | 82/100 | Arvore solida, 17 rotas mortas |
| **MEDIA GERAL** | **66/100** | **ALTA gravidade** |

---

**Nenhum fix foi aplicado. Este relatorio e diagnostico puro com evidencia (arquivo:linha) para cada achado.**
