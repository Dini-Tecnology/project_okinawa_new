# NOOWE Platform — Sprint Plan Completo
**Data:** 2026-04-01
**Base:** Audit Report (backend) + UI/UX Audit Report (mobile)
**Total de issues:** 103 (27 criticas, 35 altas, 35 medias, 6 baixas)
**Esforco estimado:** ~540h de codigo + integracao externa (dependente de credenciais)
**Sprints:** 8 sprints de 2 semanas = 16 semanas (~4 meses)
**Modelo:** 2 devs full-time (~80h/sprint disponiveis para codigo)

---

## VISAO GERAL DOS SPRINTS

```
Sprint 1 (Sem 1-2)  ████████████████  SEGURANCA & DADOS         — 80h
Sprint 2 (Sem 3-4)  ████████████████  NAVEGACAO & FLUXOS        — 78h
Sprint 3 (Sem 5-6)  ████████████████  SAFE AREA & KEYBOARD      — 76h
Sprint 4 (Sem 7-8)  ████████████████  TEMA & TIPOGRAFIA         — 80h
Sprint 5 (Sem 9-10) ████████████████  ACESSIBILIDADE & PERF     — 78h
Sprint 6 (Sem 11-12)████████████████  FORMS & VALIDACAO         — 72h
Sprint 7 (Sem 13-14)████████████████  INTEGRACAO EXTERNA (1)    — 80h
Sprint 8 (Sem 15-16)████████████████  INTEGRACAO EXTERNA (2)    — 80h
```

---

## SPRINT 1 — SEGURANCA & CONSISTENCIA DE DADOS
**Duracao:** Semanas 1-2
**Foco:** Eliminar vulnerabilidades de seguranca e race conditions
**Risco se nao fizer:** Exploits, double-charge, saldo negativo, dados inconsistentes

### Tarefas

| # | Issue | Arquivo | Esforco | Prioridade |
|---|-------|---------|---------|------------|
| 1.1 | ~~Criptografar fiscal fields (certificate_password, csc_token, focus_nfe_token)~~ | fiscal-config.entity.ts | ~~4h~~ | ✅ FEITO |
| 1.2 | ~~Webhook signature Asaas (timingSafeEqual)~~ | payment-webhook.service.ts | ~~2h~~ | ✅ FEITO |
| 1.3 | ~~Webhook signature Stripe (HMAC-SHA256 + replay)~~ | payment-webhook.service.ts | ~~2h~~ | ✅ FEITO |
| 1.4 | ~~Webhook signature Focus NFe~~ | fiscal-webhook.controller.ts | ~~2h~~ | ✅ FEITO |
| 1.5 | ~~Wallet pessimistic lock (processPayment, recharge, withdraw)~~ | payments.service.ts | ~~3h~~ | ✅ FEITO |
| 1.6 | ~~Tab payment idempotency key~~ | tab-payments.service.ts | ~~2h~~ | ✅ FEITO |
| 1.7 | ~~Stock deduction idempotency~~ | stock.service.ts | ~~2h~~ | ✅ FEITO |
| 1.8 | ~~Loyalty points idempotency~~ | loyalty.service.ts | ~~2h~~ | ✅ FEITO |
| 1.9 | ~~Tab addItem transaction + lock~~ | tabs.service.ts | ~~3h~~ | ✅ FEITO |
| 1.10 | ~~Tab processPayment transaction~~ | tab-payments.service.ts | ~~3h~~ | ✅ FEITO |
| 1.11 | ~~Stock movements consistency (transaction + lock)~~ | stock.service.ts | ~~3h~~ | ✅ FEITO |
| 1.12 | ~~Table status pessimistic lock~~ | tables.service.ts | ~~2h~~ | ✅ FEITO |
| 1.13 | ~~Stuck orders cron (PREPARING >2h)~~ | orders.service.ts | ~~2h~~ | ✅ FEITO |
| 1.14 | ~~Stuck tabs cron (PENDING_PAYMENT >1h)~~ | tabs.service.ts | ~~2h~~ | ✅ FEITO |
| 1.15 | ~~Stuck cash register cron (>24h)~~ | cash-register.service.ts | ~~2h~~ | ✅ FEITO |
| 1.16 | Wallet recharge idempotency (DTO field + check) | payments.controller.ts, payments.service.ts | 3h | 🔴 PENDENTE |
| 1.17 | Wallet withdraw idempotency | payments.controller.ts, payments.service.ts | 3h | 🔴 PENDENTE |
| 1.18 | confirmCashPayment() wrap em transaction | orders.service.ts:438-552 | 4h | 🟡 PENDENTE |
| 1.19 | Inventory ↔ Stock unificacao (deprecar inventory) | inventory.module.ts, stock.module.ts | 6h | 🟡 PENDENTE |
| 1.20 | DrinkRecipe estimado_cost field + calc | recipes/entities/drink-recipe.entity.ts | 4h | 🟢 PENDENTE |

### Validacao end-to-end Sprint 1

```
TESTES DE SEGURANCA:
□ Enviar webhook Asaas com token invalido → deve retornar 401
□ Enviar webhook Stripe com signature invalida → deve retornar 401
□ Enviar webhook Focus NFe com token errado → deve retornar 401
□ Ler fiscal_configs do banco → csc_token, focus_nfe_token, certificate_password devem estar criptografados
□ Ler gateway_configs.credentials do banco → deve estar criptografado
□ Ler platform_connections.credentials e webhook_secret → devem estar criptografados

TESTES DE RACE CONDITION:
□ 2 requests simultaneas de pagamento wallet (mesmo user, saldo 100, cada uma paga 80) → segunda deve falhar
□ 2 requests simultaneas de recarga wallet → saldo final = soma das duas (nao duplica)
□ 2 requests simultaneas de addItem na mesma tab → subtotal correto
□ 2 requests simultaneas updateStatus na mesma mesa → uma deve falhar ou serializar

TESTES DE IDEMPOTENCY:
□ Enviar mesma tab payment 2x com mesmo idempotency_key → segunda retorna existente
□ Completar mesma order 2x → stock deduzido apenas 1x
□ Award points para mesma order 2x → pontos creditados apenas 1x

TESTES DE STUCK STATUS:
□ Criar order, mover para PREPARING, esperar 5 min → cron emite 'order:stuck' via WS
□ Abrir cash register, esperar 6h da manha seguinte → cron loga warning
```

### Criterio de aceite Sprint 1
- Zero `return true` em validacao de webhook
- Zero campos sensiveis em plaintext no banco
- Todos os testes de race condition passam com requests concorrentes
- Cron jobs logando warnings para status presos

---

## SPRINT 2 — NAVEGACAO, FLUXOS E MODULOS
**Duracao:** Semanas 3-4
**Foco:** Corrigir todas as rotas mortas, botoes mortos, e wiring entre modulos
**Risco se nao fizer:** Crash ao navegar, features invisiveis, fluxos quebrados

### Tarefas

| # | Issue | Arquivo | Esforco | Prioridade |
|---|-------|---------|---------|------------|
| 2.1 | ~~19 WebSocket event listeners (restaurant + client + shared)~~ | socket.ts, waitlist-socket.ts, reservations-socket.ts | ~~6h~~ | ✅ FEITO |
| 2.2 | ~~Reservations ↔ Tables (reserve/free on create/cancel)~~ | reservations.module.ts, reservations.service.ts | ~~3h~~ | ✅ FEITO |
| 2.3 | ~~Waitlist ↔ Tables (mark occupied on seat)~~ | waitlist.module.ts, waitlist.service.ts | ~~3h~~ | ✅ FEITO |
| 2.4 | ~~Fiscal notification listener (authorized/failed/cancelled)~~ | fiscal-notification.listener.ts (novo) | ~~3h~~ | ✅ FEITO |
| 2.5 | ~~Order additions → WebSocket broadcast~~ | order-additions.service.ts | ~~2h~~ | ✅ FEITO |
| 2.6 | ~~Duplicate CustomizationGroup entity → consolidar~~ | menu-customization/, menu-items/ | ~~4h~~ | ✅ FEITO |
| 2.7 | ~~5 repository bypasses → service calls~~ | fiscal, cost-control, kds, payments, margin | ~~5h~~ | ✅ FEITO |
| 2.8 | ~~Stock availability check na criacao de pedido~~ | orders.service.ts, stock.service.ts | ~~3h~~ | ✅ FEITO |
| 2.9 | ~~46 telas sem navegacao → registrar~~ | navigation/index.tsx (ambos apps) | ~~6h~~ | ✅ FEITO |
| 2.10 | Fix `RestaurantDetail` → `Restaurant` (client) | HomeScreen.tsx, ExploreScreen.tsx | 1h | 🔴 PENDENTE |
| 2.11 | Fix `OrderDetail` → `OrderStatus` (client) | HomeScreen.tsx | 1h | 🔴 PENDENTE |
| 2.12 | Fix `OrderTracking` → `OrderStatus` (client) | OrdersScreen.tsx | 1h | 🔴 PENDENTE |
| 2.13 | Registrar rota `DigitalReceipt` (client) | navigation/index.tsx | 2h | 🔴 PENDENTE |
| 2.14 | Registrar rota `PaymentMethods` (client) — ou usar PaymentScreen | navigation/index.tsx | 2h | 🔴 PENDENTE |
| 2.15 | Registrar rota `Support` (client) | navigation/index.tsx | 1h | 🔴 PENDENTE |
| 2.16 | Registrar rota `Onboarding` (client) | navigation/index.tsx | 1h | 🟡 PENDENTE |
| 2.17 | Fix `Auth` stack reference (client) | navigation/index.tsx | 1h | 🟡 PENDENTE |
| 2.18 | Registrar rota `LoyaltyHistory` (client) | navigation/index.tsx | 1h | 🟡 PENDENTE |
| 2.19 | Fix `ManagerApprovals` → `Approvals` (restaurant) | ManagerOpsScreen.tsx | 1h | 🔴 PENDENTE |
| 2.20 | Fix `StaffDetails` → `StaffDetail` (restaurant) | StaffScreen.tsx | 1h | 🔴 PENDENTE |
| 2.21 | Registrar rota `CreateReservation` (restaurant) | navigation/index.tsx | 2h | 🔴 PENDENTE |
| 2.22 | Registrar rotas `EditMenuItem`/`CreateMenuItem` (restaurant) | navigation/index.tsx, MenuItemDetailScreen | 3h | 🔴 PENDENTE |
| 2.23 | Registrar rotas `StaffSchedule`/`AddStaff` (restaurant) | navigation/index.tsx | 4h | 🟡 PENDENTE |
| 2.24 | Registrar rota `QRScanner` (restaurant) | navigation/index.tsx | 1h | 🟡 PENDENTE |
| 2.25 | Fix 3 dead buttons (LoyaltyHome, FloorFlow, MaitreWaitlist) | 3 screen files | 3h | 🔴 PENDENTE |
| 2.26 | Promotions ↔ Orders (aplicar desconto no business logic) | promotions.module.ts, orders.service.ts | 4h | 🟡 PENDENTE |
| 2.27 | 3 mutacoes sem feedback (CallWaiter, Birthday, Ticket) | 3 screen files | 3h | 🟡 PENDENTE |
| 2.28 | ~15 listas sem empty state | 15 screen files | 8h | 🟡 PENDENTE |

### Validacao end-to-end Sprint 2

```
TESTES DE NAVEGACAO (CLIENT):
□ HomeScreen → tocar em restaurante → abre RestaurantScreen (nao crash)
□ HomeScreen → tocar em pedido → abre OrderStatusScreen (nao crash)
□ OrdersScreen → tocar em "acompanhar" → abre OrderStatusScreen
□ PaymentSuccessScreen → "Ver Recibo" → abre DigitalReceiptScreen
□ ProfileScreen → "Meus Cartoes" → abre PaymentMethods ou Payment
□ SettingsScreen → "Suporte" → abre SupportScreen
□ WalletScreen → "Gerenciar cartoes" → abre PaymentMethods
□ LoyaltyHomeScreen → "Regras do programa" → navega (nao e botao morto)

TESTES DE NAVEGACAO (RESTAURANT):
□ ManagerOpsScreen → "Aprovacoes" → abre ApprovalsScreen
□ StaffScreen → tocar em membro → abre StaffDetailScreen (nao crash)
□ MenuScreen → "Novo item" → abre CreateMenuItem ou MenuItemDetailScreen
□ MenuScreen → tocar em item → abre EditMenuItem ou MenuItemDetailScreen
□ ReservationsScreen → "Nova reserva" → abre CreateReservation
□ FloorFlowScreen → tocar em mesa → modal responde (nao morto)
□ MaitreWaitlistScreen → "Chamar" → modal funciona

TESTES DE MODULOS:
□ Criar reserva com table_id → mesa muda para status "reserved"
□ Cancelar reserva → mesa volta para "available"
□ Waitlist → seatGuest → mesa muda para "occupied"
□ Adicionar items a pedido aberto → KDS recebe via WebSocket
□ fiscal.nfce.failed → restaurante recebe WS 'fiscal:error'
□ Criar pedido com ingrediente sem estoque → log warning (nao bloqueia)
```

### Criterio de aceite Sprint 2
- Zero rotas mortas (navigate para rota inexistente)
- Zero botoes mortos (onPress vazio)
- Todos os modulos criticos conectados (reservations↔tables, waitlist↔tables)
- Todas as listas com empty state

---

## SPRINT 3 — SAFE AREA & KEYBOARD HANDLING
**Duracao:** Semanas 5-6
**Foco:** Corrigir layout em dispositivos com notch/dynamic island e teclado
**Risco se nao fizer:** Interface quebrada em iPhones modernos, campos cobertos pelo teclado

### Tarefas

| # | Issue | Escopo | Esforco | Prioridade |
|---|-------|--------|---------|------------|
| 3.1 | Criar wrapper `ScreenContainer` shared | shared/components/ScreenContainer.tsx | 4h | 🔴 |
| 3.2 | Aplicar SafeAreaView em 81 restaurant screens | restaurant/src/screens/**/*.tsx | 20h | 🔴 |
| 3.3 | Aplicar SafeAreaView em 62 client screens | client/src/screens/**/*.tsx | 16h | 🔴 |
| 3.4 | Aplicar SafeAreaView em 9 shared screens | shared/screens/**/*.tsx | 3h | 🔴 |
| 3.5 | Aplicar KeyboardAvoidingView em 21 restaurant screens com TextInput | restaurant screens com forms | 10h | 🔴 |
| 3.6 | Aplicar KeyboardAvoidingView em 18 client screens com TextInput | client screens com forms | 9h | 🔴 |
| 3.7 | Testar em iPhone 15 Pro (Dynamic Island) | Manual/simulador | 4h | 🔴 |
| 3.8 | Testar em Android com navigation bar | Manual/simulador | 4h | 🟡 |
| 3.9 | ~~Dead code cleanup (adapter stubs, push TODOs)~~ | Multiplos | ~~4h~~ | ✅ FEITO |

**Estrategia:** Criar `ScreenContainer` wrapper que encapsula SafeAreaView + KeyboardAvoidingView + StatusBar. Aplicar em todas as telas sistematicamente.

```typescript
// shared/components/ScreenContainer.tsx
export function ScreenContainer({ children, hasKeyboard = false, ...props }) {
  const insets = useSafeAreaInsets();
  const Container = hasKeyboard ? KeyboardAvoidingView : View;
  return (
    <Container
      style={[{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }, props.style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {children}
    </Container>
  );
}
```

### Validacao end-to-end Sprint 3

```
TESTES EM DISPOSITIVOS:
□ iPhone 15 Pro (Dynamic Island): todas as 152 telas nao tem conteudo cortado no topo
□ iPhone SE (sem notch): layout nao tem espaco excessivo no topo
□ Android com barra de navegacao inferior: conteudo nao fica atras da barra
□ Rotacao (landscape): layout adapta sem quebrar

TESTES DE TECLADO:
□ LoginScreen: teclado abre, campos visiveis, scroll funciona
□ FiscalSetupScreen: teclado abre, CNPJ visivel
□ RegisterScreen: teclado abre, todos os campos acessiveis
□ PaymentScreen: campos de cartao visiveis com teclado aberto
□ Todas as 39 telas com TextInput: campo nao fica coberto
```

### Criterio de aceite Sprint 3
- 100% das telas com SafeArea (zero conteudo cortado em notch)
- 100% dos forms com KeyboardAvoidingView (zero campo coberto)
- Testado em pelo menos 3 dispositivos diferentes

---

## SPRINT 4 — TEMA, TIPOGRAFIA & CORES
**Duracao:** Semanas 7-8
**Foco:** Eliminar cores hardcoded, padronizar tipografia, suportar dark mode
**Risco se nao fizer:** Dark mode quebrado, visual inconsistente, "aspecto amador"

### Tarefas

| # | Issue | Escopo | Esforco | Prioridade |
|---|-------|--------|---------|------------|
| 4.1 | Criar tokens de cor para loyalty tiers (Bronze, Silver, Gold, Platinum) | shared/theme/colors.ts | 2h | 🟡 |
| 4.2 | Criar tokens de cor para status (pending, confirmed, cancelled, etc.) | shared/theme/colors.ts | 2h | 🟡 |
| 4.3 | Refatorar 12 hardcoded colors em LoyaltyScreen | client/screens/loyalty/LoyaltyScreen.tsx | 2h | 🟡 |
| 4.4 | Refatorar 10 colors em LoyaltyLeaderboardScreen | client/screens/loyalty/LoyaltyLeaderboardScreen.tsx | 2h | 🟡 |
| 4.5 | Refatorar 6 colors em OnboardingScreen | client/screens/onboarding/OnboardingScreen.tsx | 1h | 🟡 |
| 4.6 | Refatorar 8 colors em RestaurantReviewsScreen | restaurant/screens/reviews/ | 1h | 🟡 |
| 4.7 | Refatorar 195 remaining hardcoded colors em 44 screens | 44 screen files | 24h | 🟡 |
| 4.8 | Criar ESLint rule para bloquear cores hex em styles | .eslintrc.js | 3h | 🟡 |
| 4.9 | Refatorar 125 non-standard fontSize para grid 4px | Multiplos files | 12h | 🟡 |
| 4.10 | Refatorar top-50 fontSize hardcoded → typography tokens | Multiplos files | 8h | 🟡 |
| 4.11 | Fix padding: 15 → 16 (9 instancias) | 9 files | 1h | 🟢 |
| 4.12 | Fix padding: 3 → 4 (1 instancia) | 1 file | 0.5h | 🟢 |
| 4.13 | Consolidar OrderCard (3 locais → 1 shared) | shared/components/orders/OrderCard.tsx | 3h | 🟡 |
| 4.14 | Consolidar card validation (2 locais → 1 shared) | shared/utils/card-validation.ts | 2h | 🟡 |
| 4.15 | Consolidar phone validation | shared/utils/phone-validation.ts | 1h | 🟡 |
| 4.16 | Extrair 239 placeholder strings para i18n | 17 screen files + i18n files | 10h | 🟡 |

### Validacao end-to-end Sprint 4

```
TESTES VISUAIS:
□ Ativar dark mode → todas as telas legiveis (sem texto branco em fundo branco)
□ LoyaltyScreen: tier colors vem do theme (nao hardcoded)
□ OnboardingScreen: cores alinhadas com brand (nao #FF6B6B)
□ Nenhum screen file contem #hex em inline styles (ESLint clean)
□ grep '#[0-9a-fA-F]{3,8}' em screens → 0 resultados

TESTES DE TIPOGRAFIA:
□ grep 'fontSize: 11\b|fontSize: 13\b|fontSize: 15\b|fontSize: 22\b' → 0 resultados
□ Hierarquia visual consistente (H1 > H2 > body > caption em todas as telas)

TESTES DE i18n:
□ Mudar idioma para EN → todos os placeholders em ingles (nao portugues)
□ Mudar idioma para ES → todos os placeholders em espanhol
```

### Criterio de aceite Sprint 4
- Zero cores hardcoded em screen files
- Zero fontSize nao-padrao (fora do grid 4px)
- Dark mode funcional em 100% das telas
- 100% strings traduzidas (inclusive placeholders)

---

## SPRINT 5 — ACESSIBILIDADE & PERFORMANCE
**Duracao:** Semanas 9-10
**Foco:** Screen readers, touch targets, FlatList performance
**Risco se nao fizer:** App inacessivel para deficientes visuais, listas lentas

### Tarefas

| # | Issue | Escopo | Esforco | Prioridade |
|---|-------|--------|---------|------------|
| 5.1 | Adicionar accessibilityLabel em 51 screens | 51 screen files | 20h | 🟡 |
| 5.2 | Adicionar accessibilityHint em componentes de gesto | 3 files com onLongPress | 2h | 🟡 |
| 5.3 | Aumentar touch targets < 44px → minimo 48px | 48 componentes | 8h | 🟡 |
| 5.4 | Adicionar hitSlop em 89 TouchableOpacity que faltam | 89 componentes | 8h | 🟡 |
| 5.5 | Adicionar getItemLayout em 51 FlatLists | 51 screen files | 15h | 🟡 |
| 5.6 | Adicionar windowSize/initialNumToRender em FlatLists grandes | ~10 screens com listas longas | 5h | 🟡 |
| 5.7 | Adicionar CNPJ mask no FiscalSetupScreen | FiscalSetupScreen.tsx | 1h | 🟡 |
| 5.8 | Adicionar phone mask nos inputs de telefone | Multiplos | 2h | 🟡 |
| 5.9 | Adicionar CEP mask nos inputs de CEP | AddressesScreen.tsx | 1h | 🟡 |
| 5.10 | Testar com VoiceOver (iOS) | Manual | 4h | 🟡 |
| 5.11 | Testar com TalkBack (Android) | Manual | 4h | 🟡 |

### Validacao end-to-end Sprint 5

```
TESTES DE ACESSIBILIDADE:
□ VoiceOver (iOS): navegar por todas as telas do client app → todos os elementos lidos
□ TalkBack (Android): navegar por todas as telas → todos os elementos lidos
□ Nenhum TouchableOpacity com dimensao < 44px (grep + manual)
□ FiscalSetupScreen: CNPJ formata como XX.XXX.XXX/XXXX-XX ao digitar
□ Telefone formata como (XX) XXXXX-XXXX

TESTES DE PERFORMANCE:
□ StockScreen com 500 items → scroll suave (60fps)
□ OrdersScreen com 100 orders → scroll suave
□ CustomerCrmScreen com 1000 clientes → scroll suave
□ FlatList com 50+ items nao mostra warning "VirtualizedList: missing keys"
```

### Criterio de aceite Sprint 5
- 100% dos screens com accessibilityLabel
- Zero touch targets < 44px
- VoiceOver/TalkBack funcional em todas as telas criticas
- FlatLists com getItemLayout (scroll suave em listas longas)

---

## SPRINT 6 — FORMS, VALIDACAO & EMPTY STATES
**Duracao:** Semanas 11-12
**Foco:** Padronizar validacao de forms, adicionar empty states, feedback de acoes
**Risco se nao fizer:** Dados invalidos no backend, telas vazias sem explicacao

### Tarefas

| # | Issue | Escopo | Esforco | Prioridade |
|---|-------|--------|---------|------------|
| 6.1 | Criar Zod schemas compartilhados (email, phone, CNPJ, card, address) | shared/validators/ | 6h | 🟡 |
| 6.2 | Migrar LoginScreen para Zod + react-hook-form | client LoginScreen | 3h | 🟡 |
| 6.3 | Migrar RegisterScreen para Zod | client RegisterScreen | 3h | 🟡 |
| 6.4 | Migrar PaymentScreen para Zod (consolidar card validation) | client PaymentScreen | 4h | 🟡 |
| 6.5 | Migrar UnifiedPaymentScreen para Zod | client UnifiedPayment | 4h | 🟡 |
| 6.6 | Migrar FiscalSetupScreen para Zod | restaurant Fiscal | 3h | 🟡 |
| 6.7 | Migrar CreateReservationScreen para Zod | client Reservations | 3h | 🟡 |
| 6.8 | Migrar GroupBookingScreen para Zod | client GroupBooking | 3h | 🟡 |
| 6.9 | Migrar TableFormScreen para Zod | restaurant TableForm | 2h | 🟡 |
| 6.10 | Migrar RecipeScreen para Zod | restaurant Recipe | 3h | 🟡 |
| 6.11 | Migrar BillsScreen para Zod | restaurant Bills | 3h | 🟡 |
| 6.12 | Migrar AddressesScreen para Zod | client Addresses | 3h | 🟡 |
| 6.13 | Migrar StockItemDetailScreen para Zod | restaurant Stock | 2h | 🟡 |
| 6.14 | Adicionar empty states em 15 listas que faltam | 15 screen files | 12h | 🟡 |
| 6.15 | Adicionar feedback em 3 mutacoes (CallWaiter, Birthday, Ticket) | 3 screen files | 3h | 🟡 |
| 6.16 | Push notification stubs → emit via NotificationsService (internal, sem FCM) | orders, reservations, calls, payments services | 8h | 🟡 |

### Validacao end-to-end Sprint 6

```
TESTES DE VALIDACAO:
□ LoginScreen: email invalido → mostra erro inline (nao Alert generico)
□ RegisterScreen: senha fraca → mostra criterios nao atendidos
□ PaymentScreen: cartao invalido (Luhn) → mostra "Numero invalido"
□ FiscalSetupScreen: CNPJ incompleto → mostra "CNPJ invalido"
□ CreateReservationScreen: data no passado → mostra erro
□ RecipeScreen: quantidade negativa → mostra erro
□ BillsScreen: valor zero → mostra erro

TESTES DE EMPTY STATE:
□ StockScreen sem items → mostra "Nenhum item no estoque"
□ OrdersScreen sem pedidos → mostra "Nenhum pedido encontrado"
□ ReservationsScreen sem reservas → mostra "Nenhuma reserva"
□ Todas as 15 listas → empty state com icone + texto + acao

TESTES DE FEEDBACK:
□ CallWaiterScreen → tocar "Chamar" → loading + toast sucesso
□ BirthdayBookingScreen → tocar "Reservar" → loading + toast sucesso
□ TicketPurchaseScreen → tocar "Comprar" → loading + toast sucesso
```

### Criterio de aceite Sprint 6
- Top 15 forms migrados para Zod (80% cobertura)
- 100% das listas com empty state
- 100% das mutacoes com feedback (sucesso + erro)
- Notificacoes internas funcionais (sem FCM, via NotificationsService)

---

## SPRINT 7 — INTEGRACAO EXTERNA (Parte 1)
**Duracao:** Semanas 13-14
**Foco:** Asaas (pagamentos), Focus NFe (fiscal real)
**Pre-requisito:** Credenciais de sandbox obtidas pela equipe

### Tarefas

| # | Issue | Escopo | Esforco | Prioridade |
|---|-------|--------|---------|------------|
| 7.1 | Implementar Asaas adapter real (card payment) | asaas.adapter.ts | 12h | 🔴 EXTERNAL |
| 7.2 | Implementar Asaas PIX real (QR code generation) | asaas.pix.service.ts | 8h | 🔴 EXTERNAL |
| 7.3 | Implementar Focus NFe adapter real (NFC-e emission) | focus-nfe.adapter.ts | 12h | 🔴 EXTERNAL |
| 7.4 | Teste end-to-end: pagamento cartao → NFC-e automatica | Full flow | 8h | 🔴 |
| 7.5 | Teste end-to-end: pagamento PIX → confirmacao via webhook | Full flow | 8h | 🔴 |
| 7.6 | Implementar SMS/OTP via Twilio (phone auth) | auth.service.ts | 12h | 🔴 EXTERNAL |
| 7.7 | Teste end-to-end: login por telefone → OTP → autenticado | Full flow | 4h | 🔴 |

### Pre-requisitos (acao humana ANTES do sprint)
- [ ] Conta Asaas sandbox criada
- [ ] API key Asaas obtida
- [ ] Webhook URL Asaas configurada
- [ ] Conta Focus NFe sandbox criada
- [ ] Token Focus NFe obtido
- [ ] Conta Twilio criada (ou AWS SNS)
- [ ] API key SMS obtida

### Validacao end-to-end Sprint 7

```
TESTES ASAAS (SANDBOX):
□ Criar cobranca cartao → Asaas retorna ID
□ Asaas envia webhook PAYMENT_CONFIRMED → order muda para COMPLETED
□ NFC-e emitida automaticamente apos pagamento confirmado
□ Criar cobranca PIX → QR code gerado
□ Simular pagamento PIX → webhook recebido → order COMPLETED
□ Solicitar reembolso → Asaas processa → transaction atualizada

TESTES FOCUS NFE (SANDBOX):
□ Emitir NFC-e para pedido → documento criado com status "processing"
□ Focus NFe webhook autorizado → documento atualiza para "authorized"
□ Focus NFe webhook erro → documento atualiza para "failed" + alerta WS
□ Cancelar NFC-e → documento cancelado

TESTES PHONE AUTH:
□ Digitar telefone → OTP enviado via SMS
□ Digitar OTP correto → usuario autenticado
□ Digitar OTP incorreto → erro mostrado
□ OTP expira apos 5 min → nova solicitacao necessaria
```

### Criterio de aceite Sprint 7
- Pagamento cartao funcional em sandbox Asaas
- Pagamento PIX funcional em sandbox Asaas
- NFC-e emissao funcional em sandbox Focus NFe
- Login por telefone funcional via SMS

---

## SPRINT 8 — INTEGRACAO EXTERNA (Parte 2) & POLISH FINAL
**Duracao:** Semanas 15-16
**Foco:** Delivery platforms, Stripe Terminal, polimento final
**Pre-requisito:** Credenciais de parceiros obtidas

### Tarefas

| # | Issue | Escopo | Esforco | Prioridade |
|---|-------|--------|---------|------------|
| 8.1 | Implementar Stripe Terminal adapter real | stripe-terminal.adapter.ts | 16h | 🔴 EXTERNAL |
| 8.2 | Implementar iFood adapter real | ifood.adapter.ts | 12h | 🔴 EXTERNAL |
| 8.3 | Implementar Rappi adapter real | rappi.adapter.ts | 12h | 🔴 EXTERNAL |
| 8.4 | Implementar UberEats adapter real | ubereats.adapter.ts | 12h | 🔴 EXTERNAL |
| 8.5 | Push notifications via Firebase (FCM) | notifications.service.ts | 12h | 🔴 EXTERNAL |
| 8.6 | Regression test completo — todos os 238 fluxos | Full platform | 16h | 🔴 |

### Pre-requisitos (acao humana ANTES do sprint)
- [ ] Stripe Terminal sandbox + entitlements Apple
- [ ] iFood conta parceiro + credenciais API
- [ ] Rappi conta parceiro + credenciais API
- [ ] UberEats conta parceiro + credenciais API
- [ ] Firebase project + google-services.json + APNs key

### Validacao end-to-end Sprint 8

```
TESTES STRIPE TERMINAL:
□ Tap to Pay → pagamento processado → recibo emitido
□ Pagamento falha → erro mostrado ao operador

TESTES DELIVERY (SANDBOX):
□ iFood envia webhook novo pedido → aparece no KDS
□ Aceitar pedido iFood → confirmacao enviada ao iFood
□ Rejeitar pedido iFood → rejeicao enviada ao iFood
□ Rappi/UberEats: mesmos testes

TESTES PUSH:
□ Order ready → push notification chega no app do cliente
□ Reservation confirmed → push chega
□ Waiter call acknowledged → push chega
□ Stock low → push chega no manager

REGRESSION TEST COMPLETO:
□ 12 fluxos criticos end-to-end (order, payment, reservation, waitlist, tab, club queue, etc.)
□ Todos os WebSocket events funcionais
□ Dark mode em todas as telas
□ VoiceOver funcional
□ Performance ok (listas de 500+ items)
```

---

## CHECKLIST FINAL POS-SPRINT 8

### Backend
- [ ] Zero `return true` em webhook validation
- [ ] Zero campos sensiveis em plaintext
- [ ] Todos os race conditions resolvidos (pessimistic locks)
- [ ] Todos os idempotency checks implementados
- [ ] Todos os cron jobs para stuck status ativos
- [ ] Todos os modulos criticos conectados
- [ ] Zero entidades duplicadas na mesma tabela
- [ ] Zero repository bypasses
- [ ] Todos os eventos WebSocket com pelo menos 1 listener
- [ ] Todos os adapters de pagamento funcional (sandbox)
- [ ] NFC-e funcional (sandbox)
- [ ] Phone auth funcional
- [ ] Push notifications funcional

### Mobile — Client App
- [ ] Zero rotas mortas
- [ ] Zero botoes mortos
- [ ] 100% telas com SafeArea
- [ ] 100% forms com KeyboardAvoidingView
- [ ] 100% telas com accessibilityLabel
- [ ] Zero cores hardcoded
- [ ] Zero fontSize nao-padrao
- [ ] 100% strings traduzidas (pt-BR, en, es)
- [ ] 100% listas com empty state
- [ ] 100% mutacoes com feedback
- [ ] Dark mode funcional
- [ ] VoiceOver funcional

### Mobile — Restaurant App
- [ ] Mesmos criterios do client app
- [ ] Roles RBAC corretos em todas as telas do drawer
- [ ] WebSocket funcional para todas as operacoes real-time

### Performance
- [ ] FlatLists com getItemLayout
- [ ] Listas de 500+ items: scroll a 60fps
- [ ] App startup < 3s

---

## METRICAS DE PROGRESSO

| Metrica | Antes | Apos Sprint 1-2 | Apos Sprint 3-4 | Apos Sprint 5-6 | Apos Sprint 7-8 |
|---------|-------|-----------------|-----------------|-----------------|-----------------|
| Rotas mortas | 17 | 0 | 0 | 0 | 0 |
| Botoes mortos | 3 | 0 | 0 | 0 | 0 |
| SafeArea coverage | 7% | 7% | 100% | 100% | 100% |
| Keyboard coverage | 28% | 28% | 100% | 100% | 100% |
| Accessibility labels | 71% | 71% | 71% | 100% | 100% |
| Cores hardcoded | 231 | 231 | 231 | 0 | 0 |
| Forms com Zod | 2% | 2% | 2% | 80% | 80% |
| Payment adapters | stub | stub | stub | stub | funcional |
| Push notifications | stub | stub | stub | internal | FCM |
| Score UI/UX | 66/100 | 75/100 | 85/100 | 92/100 | 98/100 |

---

## DEPENDENCIAS EXTERNAS (Timeline sugerida)

| Acao | Responsavel | Deadline | Necessario para |
|------|------------|----------|----------------|
| Criar conta Asaas sandbox | Product Owner | Antes Sprint 7 (Sem 12) | Sprint 7 |
| Obter API key Asaas | Product Owner | Antes Sprint 7 (Sem 12) | Sprint 7 |
| Criar conta Focus NFe sandbox | Product Owner | Antes Sprint 7 (Sem 12) | Sprint 7 |
| Obter token Focus NFe | Product Owner | Antes Sprint 7 (Sem 12) | Sprint 7 |
| Criar conta Twilio/AWS SNS | Product Owner | Antes Sprint 7 (Sem 12) | Sprint 7 |
| Criar projeto Firebase | Product Owner | Antes Sprint 8 (Sem 14) | Sprint 8 |
| Obter google-services.json | Product Owner | Antes Sprint 8 (Sem 14) | Sprint 8 |
| Configurar APNs key (Apple) | Product Owner | Antes Sprint 8 (Sem 14) | Sprint 8 |
| Conta parceiro iFood | Product Owner | Antes Sprint 8 (Sem 14) | Sprint 8 |
| Conta parceiro Rappi | Product Owner | Antes Sprint 8 (Sem 14) | Sprint 8 |
| Conta parceiro UberEats | Product Owner | Antes Sprint 8 (Sem 14) | Sprint 8 |
| Stripe Terminal + Apple entitlement | Product Owner | Antes Sprint 8 (Sem 14) | Sprint 8 |
| Certificado digital A1 (restaurante teste) | Product Owner | Antes Sprint 7 (Sem 12) | Sprint 7 NFC-e |

---

**Este plano endereca todos os 103 issues identificados nos dois relatorios de auditoria.**
**Itens ja feitos estao marcados com ✅. Itens pendentes estao priorizados por cor (🔴🟡🟢).**
**Cada sprint tem validacao end-to-end com testes especificos e criterios de aceite claros.**
