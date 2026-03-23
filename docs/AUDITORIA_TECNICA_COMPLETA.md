# AUDITORIA TÉCNICA COMPLETA — NOOWE PLATFORM
> **Data:** 23/03/2026 | **Versão:** 1.0 | **Auditor:** Claude Code (AI Senior Engineer)

---

## ÍNDICE

1. [Mapeamento Estrutural](#fase-1-mapeamento-estrutural)
2. [Qualidade Técnica do Código](#fase-2-qualidade-técnica-do-código)
3. [Segurança](#fase-3-segurança)
4. [Validação e Testes](#fase-4-validação-e-testes)
5. [UX e Funcionalidade](#fase-5-ux-e-funcionalidade)
6. [Design e UI](#fase-6-design-e-ui)
7. [Prontidão para Produção](#fase-7-prontidão-para-produção)
8. [Relatório Final Consolidado](#fase-8-relatório-final-consolidado)

---

## FASE 1: MAPEAMENTO ESTRUTURAL

### Árvore de Diretórios

```
project_okinawa/
├── platform/
│   ├── backend/          ← NestJS 10.4 API (39 módulos)
│   │   ├── src/
│   │   │   ├── modules/  ← 39 módulos de domínio
│   │   │   ├── common/   ← Guards, filters, interceptors, middlewares
│   │   │   ├── config/   ← typeorm, throttler, swagger, validation
│   │   │   └── database/ ← migrations (38), seeds
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── mobile/
│   │   ├── apps/
│   │   │   ├── client/   ← 69 telas (usuário final)
│   │   │   └── restaurant/ ← 73 telas (estabelecimento)
│   │   └── shared/       ← theme, i18n, components, services, contexts
│   └── supabase/
│       ├── migrations/
│       └── functions/
├── site/                 ← React/Vite (marketing + demo)
├── docs/                 ← 45+ documentos
├── docker-compose.yml
└── README.md
```

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | NestJS | 10.4 |
| Linguagem | TypeScript | 5.x |
| Banco de Dados | PostgreSQL | 16 |
| ORM | TypeORM | 0.3 |
| Cache | Redis | 7 |
| Filas | Bull | 4.16 |
| Real-time | Socket.IO | 4.8 |
| Mobile | React Native | 0.74.5 |
| Mobile Framework | Expo | 51 |
| Navegação | React Navigation | 6 |
| State/Fetching | TanStack Query | 5 |
| Forms | React Hook Form | 7 |
| Validação | Zod | 4 |
| UI Components | React Native Paper | 5 |

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         NOOWE PLATFORM                           │
├────────────────────────┬────────────────────────────────────────┤
│   CLIENT APP (mobile)  │     RESTAURANT APP (mobile)            │
│   69 telas             │     73 telas                           │
│   React Native 0.74    │     React Native 0.74                  │
│   Expo 51              │     Expo 51                            │
└────────────┬───────────┴────────────┬───────────────────────────┘
             │ HTTPS REST + WebSocket │
             ▼                        ▼
┌────────────────────────────────────────────────────────────────┐
│                    NESTJS API (backend)                         │
│   39 módulos │ JWT Auth │ CORS │ Helmet │ Rate Limiting │ CSRF  │
│   Swagger │ Global Validation │ Exception Filters │ Sentry      │
└────────┬───────────────────────────────────────┬───────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────────┐              ┌─────────────────────────┐
│   PostgreSQL 16     │              │       Redis 7            │
│   TypeORM + PostGIS │              │  Cache │ Bull Queues      │
│   38 Migrations     │              │  Token Blacklist         │
└─────────────────────┘              └─────────────────────────┘
```

### Contagem de Arquivos

| Tipo | Quantidade |
|------|-----------|
| Arquivos de código backend (.ts) | ~450 |
| Módulos backend | 39 |
| Migrations | 38 |
| Telas Client App | 69 |
| Telas Restaurant App | 73 |
| Arquivos de teste (.spec.ts) | 93 |
| Documentos (.md) | 45+ |
| Componentes shared | ~40 |

---

## FASE 2: QUALIDADE TÉCNICA DO CÓDIGO

### 2.1 — Arquitetura e Padrões

#### Backend (NestJS)
- **Padrão**: Monolito Modular com separação Controller → Service → Repository
- **Status**: ✅ Bem implementado na maioria dos módulos
- **Violações encontradas**:

🔴 **`AuthService`** (`platform/backend/src/modules/auth/auth.service.ts`) — **580 linhas**
- Responsabilidades misturadas: password reset, token generation, token blacklist, OTP, social auth, legacy migration
- **Solução**: Extrair `PasswordResetService`, `TokenService`, `SocialAuthService`

🔴 **`OrdersService`** (`platform/backend/src/modules/orders/orders.service.ts`) — **597 linhas**
- Responsabilidades misturadas: CRUD, cálculos, KDS formatação, waiter stats, maitre dashboard, partial orders
- **Solução**: Extrair `OrderCalculatorService`, `KdsService`, `WaiterStatsService`

🟡 **`TabsService`** (~400 linhas) e **`FinancialService`** (~350 linhas) — Limítrofes de god class

#### Client App
- **Padrão**: Feature-based screens + shared context + TanStack Query
- **Status**: ✅ Bem estruturado
- **Violações**:

🔴 **`SharedOrderScreen.tsx`** — **709 linhas**
🔴 **`OrderStatusScreen.tsx`** — **671 linhas**
🔴 **`PartialOrderScreen.tsx`** — **552 linhas**
🟡 **`NotificationsScreen.tsx`** — 586 linhas

#### Restaurant App
- **Padrão**: Idêntico ao Client App
- **Violações**:

🔴 **`FloorPlanScreen.tsx`** — Import incorreto de `useColors`:
```typescript
// ERRADO (linha 6):
import { useColors } from '@okinawa/shared/theme';
// CORRETO:
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
```

### 2.2 — Duplicações de Código

🟡 **Telas duplicadas no Client App** (mesmos arquivos em 2 pastas):
- `pub/TabScreen.tsx` ≡ `pub-bar/TabScreen.tsx`
- `pub/TabPaymentScreen.tsx` ≡ `pub-bar/TabPaymentScreen.tsx`
- `pub/RoundBuilderSheet.tsx` ≡ `pub-bar/RoundBuilderSheet.tsx`
- `scanner/QRScannerScreen.tsx` ≡ `qr-scanner/QRScannerScreen.tsx`
- `calls/CallWaiterScreen.tsx` ≡ `service/CallWaiterScreen.tsx`

**Ação**: Remover duplicatas, manter apenas um caminho.

### 2.3 — Qualidade do Código

| Problema | Backend | Client App | Restaurant App |
|---------|---------|-----------|----------------|
| `console.log` em produção | ✅ Nenhum (seeds OK) | 🔴 44 ocorrências em 30 telas | 🟡 Alguns presentes |
| `any` em TypeScript | 🟡 373 ocorrências | 🟡 Presente em alguns hooks | 🟡 Presente em event types |
| Magic strings hardcoded | ✅ Minimizado | 🟡 54+ strings em UI | 🟡 Strings em StaffScreen, WaiterCommandCenter |
| Funções >50 linhas | 🟡 `login()` 81 linhas | 🔴 Telas inteiras >500 linhas | 🔴 `handleStatusChange` longa |
| TODO/FIXME | 🟢 Não identificado | 🟡 Alguns presentes | 🟡 Alguns presentes |

### 2.4 — Gerenciamento de Estado

#### Backend
- ✅ Stateless (JWT + Redis para sessões)

#### Mobile (ambos apps)
- **Solução**: Context API + TanStack Query (v5)
- ✅ `ThemeContext`, `CartContext`, `AnalyticsContext`, `RestaurantContext`
- ✅ `QueryClientProvider` configurado no App.tsx
- ✅ `staleTime: 5min`, `retry: 2`

🔴 **`useWaiterTables` no Restaurant App** — usa dados **mock** em vez de API real:
```typescript
// ATUAL (problema):
const [tables, setTables] = useState<WaiterTable[]>(MOCK_WAITER_TABLES);

// CORRETO:
return useQuery({
  queryKey: ['waiter', 'tables'],
  queryFn: () => ApiService.get('/orders/waiter/my-tables'),
  refetchInterval: 15 * 1000,
});
```

🔴 **`useWaiterLiveFeed`** — dados iniciais com `LIVE_FEED_MOCK` (fake data)

### 2.5 — Performance

🟡 **FlatList sem otimização** em múltiplas telas (deveria ser FlashList ou ter flags de otimização):
- Client: HomeScreen, ExploreScreen, CartScreen, ProfileScreen (6 telas)
- Restaurant: OrdersScreen, MenuScreen, ReservationsScreen, StaffScreen

🟡 **FloorPlanScreen** usa `setInterval` de 10s para polling em vez de WebSocket

🟡 **`DashboardScreen`** e **`FinancialScreen`** no Restaurant App não têm atualização em tempo real

---

## FASE 3: SEGURANÇA

### 3.1 — Autenticação e Autorização

| Controle | Status | Detalhes |
|---------|--------|---------|
| JWT com JTI (blacklist) | ✅ | `auth.service.ts:367-391` — UUID único por token |
| Refresh Token Rotation | ✅ | Tokens revogados na renovação |
| MFA (TOTP) | ✅ | Com backup codes |
| Social Login | ✅ | Google, Apple, Microsoft |
| Phone OTP | ✅ | Via Twilio |
| Biometric Auth | ✅ | Expo Local Authentication |
| bcrypt (salt=12) | ✅ | `credential.service.ts:25` |
| Account Lockout | ✅ | 5 tentativas → bloqueio 30min |
| Rate Limiting | ✅ | 3 perfis: default(100/min), strict(10/min), payment(30/min) |
| Guards em rotas protegidas | ✅ | JwtAuthGuard + RolesGuard + proprietário |
| IDOR prevention | ✅ | RestaurantOwnerGuard |
| CSRF Protection | ✅ | Middleware global (csrf.middleware.ts) |

🔴 **CRÍTICO — CORS vazio em produção** (`main.ts:106-108`):
```typescript
// PROBLEMA: se CORS_ORIGIN não está no .env, API rejeita TODAS as requisições
if (nodeEnv === 'production' && !corsOrigin) {
  logger.warn('CORS_ORIGIN not set in production'); // só avisa, não falha!
}
```
**Fix**: Validação obrigatória via Joi (já usado em `validation.config.ts`):
```typescript
CORS_ORIGIN: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() })
```

### 3.2 — Proteção de Dados

| Controle | Status | Detalhes |
|---------|--------|---------|
| Secrets hardcoded | ✅ | Nenhum encontrado |
| .env no .gitignore | ✅ | Confirmado |
| Input validation/sanitization | ✅ | Global ValidationPipe (whitelist, forbidNonWhitelisted) |
| SQL Injection | ✅ | TypeORM parametrizado, zero raw queries |
| XSS | ✅ | CSP via Helmet |
| CSRF | ✅ | Middleware global |
| Dados sensíveis em logs | ✅ | SentryFilter redacta: password, token, card_number, cvv |
| HTTPS enforced | ✅ | HSTS via Helmet em produção |

🔴 **`DATABASE_SSL` opcional** — deveria ser obrigatório em produção:
```env
# ATUAL (.env.example): optional
DATABASE_SSL=false

# CORRETO:
DATABASE_SSL=true  # required em prod, com validação Joi
```

🟡 **.env.example com senhas de teste** (`line 10, 18`):
```
DATABASE_PASSWORD=okinawa_dev_password  # risco: copiar para prod acidentalmente
```
**Fix**: Substituir por `CHANGE_ME_DATABASE_PASSWORD`

### 3.3 — Vulnerabilidades de Infraestrutura

🔴 **Sem certificate pinning no mobile** — apps vulneráveis a MITM em redes controladas
**Fix**: Implementar TrustKit (iOS) / Network Security Config (Android)

🔴 **Sem estratégia de rotação de secrets** — JWT_SECRET nunca rotacionado
**Fix**: Documentar e implementar rotação de 90 dias com zero downtime

🟡 **`supabase/config.toml`**: `verify_jwt = false` nas edge functions de demo-code — avaliar se necessário em produção

---

## FASE 4: VALIDAÇÃO E TESTES

### 4.1 — Cobertura de Testes

#### Backend (93 arquivos .spec.ts)

| Módulo | Status | Observação |
|--------|--------|-----------|
| auth | ✅ | service, controller, jwt.strategy, guards |
| orders | ✅ | service, controller, gateway |
| payments | ✅ | controller, payment-split |
| loyalty | ✅ | |
| reviews | ✅ | |
| tabs | ✅ | happy-hour, waiter-calls, integration |
| club | ✅ | queue, entries, qr-code, integration |
| identity | ✅ | credential, audit-log, mfa, token-blacklist |
| reservations | ✅ | |
| financial | ✅ | |
| users | ❌ | Sem testes |
| ai | ❌ | Sem testes |
| addresses | ❌ | Sem testes |
| receipts | ❌ | Sem testes |
| menu-customization | ❌ | Sem testes |
| geofencing | ❌ | Sem testes |
| health | ❌ | Sem testes |

**Estimativa de cobertura**: ~50% dos módulos têm testes

🟡 **Sem threshold de coverage** no CI/CD — falhas de cobertura não bloqueiam PRs

#### Mobile
🔴 Sem testes unitários em nenhuma tela do Client App ou Restaurant App
🔴 Sem testes de integração para fluxos críticos (pedido, pagamento, reserva)

### 4.2 — Validação de Formulários

✅ Zod schemas em Login, Register, PaymentScreen
✅ Validação Luhn para número de cartão (`PaymentScreen.tsx:13-40`)
✅ Email normalization (lowercase + trim) no backend
✅ Password com regex: minúsculas + maiúsculas + números + especiais
✅ Rate limiting em endpoints de autenticação

🟡 **Formulários sem validação visual imediata** em algumas telas:
- `CasualDiningConfigScreen`, `ConfigExperienceScreen`

### 4.3 — Edge Cases

| Cenário | Status |
|---------|--------|
| Perda de conexão durante pedido | 🟡 Parcial (retry logic no ApiService) |
| Sessão expirada | ✅ JWT refresh automático |
| Backend fora do ar | 🟡 Parcial (sem offline mode) |
| Timeout de requisições | ✅ Axios timeout configurado |
| Pagamento falha após confirmação | 🔴 Não documentado/testado |
| Restaurante fecha durante pedido | 🔴 Não documentado/testado |
| Push notifications quando app fechado | ✅ Background modes configurados |
| Biometrics não disponível | ✅ Fallback para senha |

---

## FASE 5: UX E FUNCIONALIDADE

### 5.1 — Fluxos Críticos Implementados

#### Client App

| Fluxo | Status | Observação |
|-------|--------|-----------|
| Registro → verificação → login | ✅ | Passwordless-first (OTP, biometric, social) |
| Busca de restaurante | ✅ | Com filtros e mapa |
| Criar pedido → pagamento → confirmação | ✅ | Fluxo completo com split payment |
| Reserva de mesa | ✅ | Com convite de convidados |
| Programa de lealdade | ✅ | Tiers, stamps, recompensas |
| Club/Balada (fila, ingressos, VIP) | ✅ | Completo |
| Pub/Bar (comanda, rounds) | ✅ | TabScreen completo |
| Avaliações/reviews | ✅ | |
| Recuperação de senha | ✅ | Via email/OTP |
| Histórico de pedidos | ✅ | |
| Notificações push | ✅ | |

#### Restaurant App

| Fluxo | Status | Observação |
|-------|--------|-----------|
| Dashboard com KPIs | ✅ | Mas sem real-time WebSocket |
| Receber/aceitar/rejeitar pedido | ✅ | Fluxo de status completo |
| Kitchen Display System | ✅ | Com WebSocket real-time |
| Gestão de cardápio (CRUD) | ✅ | |
| Gestão de mesas + floor plan | ✅ | Com status visual |
| Relatórios/analytics | ✅ | |
| Configurações do restaurante | ✅ | 11 sub-telas |
| Gestão de staff/roles | ✅ | |
| Sistema de aprovações | ✅ | |
| Clube (fila, porta, VIP) | ✅ | |
| Estoque/Inventário | ✅ | |
| Waiter Command Center | ✅ | 4 tabs, mas live feed usa mock data |

### 5.2 — Feedback ao Usuário

✅ Loading states implementados em ~70% das telas (skeleton em muitas)
✅ Empty states implementados em ~60% das telas
✅ RefreshControl (pull-to-refresh) implementado
✅ Haptics feedback em ações principais
✅ Toast/snackbars para ações confirmadas

🔴 **Telas sem loading state**: `WelcomeScreen`, `BuffetCheckinScreen`, `GeolocationTrackingScreen`, `AIPairingAssistantScreen`, `MenuScreen` (restaurant)
🔴 **Telas sem empty state**: `FavoritesScreen`, `WalletScreen`, `SupportScreen`

### 5.3 — Acessibilidade

🔴 **CRÍTICO — Estado alarmante**:
- `accessibilityLabel` presente em apenas **~17% das telas** (12 de 69 no Client App)
- Telas críticas como `HomeScreen`, `CartScreen`, `MenuScreen`, `CheckoutScreen` **sem nenhum** label de acessibilidade
- Não compatível com WCAG AA mínimo

Telas com acessibilidade implementada:
- ✅ `NotificationsScreen` (12 elementos)
- ✅ `FamilyModeScreen` (14 elementos)
- ✅ `WaitlistScreen` (10 elementos)

### 5.4 — Internacionalização

✅ 3 idiomas: pt-BR (padrão), en-US, es-ES
✅ Função `t(keyPath, params)` com interpolação
✅ Hook `useTranslations()` disponível

🟡 **~100+ strings hardcoded** sem tradução:

```typescript
// PROBLEMA (OrderCard.tsx:29-47):
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',     // hardcoded PT-BR
  confirmed: 'Confirmado', // hardcoded PT-BR
  // ...
};

// CORRETO:
const STATUS_LABELS = {
  pending: t('orders.status.pending'),
  confirmed: t('orders.status.confirmed'),
};
```

Exemplos adicionais de strings hardcoded:
- `StaffScreen.tsx`: "Search staff members", "No staff members found", "Start Break", "End Break"
- `HomeScreen.tsx`: Cuisine type labels
- `ExploreScreen.tsx`: 'Todos' (linha 72, 313)
- `WaiterCommandCenter.tsx`: Múltiplos labels de UI

---

## FASE 6: DESIGN E UI

### 6.1 — Design System

✅ **Excellente estrutura** em `platform/mobile/shared/theme/`:
- `colors.ts` — Semantic tokens light/dark (285 linhas)
- `typography.ts` — Escala tipográfica
- `spacing.ts` — Grid 4px com nomenclatura Tailwind
- `shadows.ts` — Elevação consistente
- `animations.ts` — Presets de animação

✅ Componentes reutilizáveis em `shared/components/ui/`:
`GradientButton`, `GradientHeader`, `GradientHeaderDark`, `IconContainer`, `StatusBadge`, `SectionTitle`, `PremiumCard`, `SkeletonBlock`

✅ Uso de `useColors()` em ~90% das telas

### 6.2 — Inconsistências Identificadas

🟡 **Cores hardcoded** em algumas telas:
```typescript
// WaiterCommandCenter.tsx:116-145
headerShiftLabel: { color: '#FFFFFF99' }  // ⚠️ hardcoded

// StaffScreen.tsx:82
roleColors['owner'] = '#9C27B0'           // ⚠️ hardcoded

// ApprovalsScreen.tsx:282-284
backgroundColor: `${typeColor}1A`        // ⚠️ opacidade hardcoded
```

🟡 **Spacing inconsistente**:
- `DashboardScreen`: `paddingHorizontal: 20`
- `MenuScreen`: `margin: 15`
- `StaffScreen`: `margin: 15`
- Deveria usar `spacing[4]` (16px) ou `spacing[5]` (20px) do design system

🟡 **Componentes UI compartilhados subutilizados** — telas do Restaurant App reimplementam componentes que existem em `shared/components/ui/` (`GradientButton`, `StatusBadge`, etc)

🟡 **Border radius inconsistente** entre telas

### 6.3 — Responsividade

✅ Safe area configurada (`SafeAreaProvider` + `useSafeAreaInsets`)
✅ `orientation: portrait` fixado em ambos apps
✅ Tamanho máximo de conteúdo `428px` (iPhone 14 Pro Max)

🟡 Não testado em dispositivos menores (iPhone SE: 375px)
🟡 Sem suporte landscape intencional

---

## FASE 7: PRONTIDÃO PARA PRODUÇÃO

### 7.1 — Docker & CI/CD

✅ **Dockerfile multi-stage** (base → development → production)
✅ Non-root user `nestjs` (UID 1001) com `dumb-init`
✅ `.dockerignore` configurado
✅ **docker-compose.yml** com todos os serviços (PostgreSQL, Redis, Backend, Worker, pgAdmin)
✅ Healthchecks em todos os serviços
✅ Network interna `okinawa-network`

✅ **CI/CD** (GitHub Actions) cobrindo:
- Lint + TypeScript check
- Testes com coverage
- Build validation
- Docker build validation
- Security scan (npm audit + secrets scan)
- Dependabot configurado (weekly, 10 PRs max)

🟡 **Sem threshold de coverage mínimo** no CI
🟡 **Sem SAST** (CodeQL/SonarQube)
🟡 **Sem upload de coverage** para serviço externo (Codecov)

### 7.2 — Banco de Dados

✅ 38 migrations versionadas
✅ `synchronize: false` em produção
✅ Connection pool configurado (max: 10 dev, 20 prod)
✅ Redis cache habilitado em produção (TTL: 60s)

🔴 **Sem estratégia de backup** documentada ou automatizada
🟡 **Timestamps duplicados** em 2 migrations: `1765000000001-CreateDrinkRecipesTable` e `1765000000001-CreateWaitlistEntriesTable` — risco de conflito

### 7.3 — Observabilidade

✅ Sentry integrado (backend + mobile — via `@sentry/react-native`)
✅ Structured logging com `StructuredLoggerService` + correlation IDs
✅ Health check completo: `/api/v1/health`, `/health/live`, `/health/ready`
✅ Indicadores: DB ping, memory heap (<500MB), disk (>10% livre)

🟡 **Sem APM** (Datadog/New Relic) para latência e throughput
🟡 **Sem Prometheus/Grafana** para métricas
🟡 **Sem alertas** configurados

### 7.4 — Configuração Mobile (Stores)

| Item | Client App | Restaurant App |
|------|-----------|----------------|
| Bundle ID | ✅ `com.okinawa.client` | ✅ `com.okinawa.restaurant` |
| Versão | ✅ 1.0.0 | ✅ 1.0.0 |
| Ícone | ✅ | ✅ |
| Splash Screen | ✅ | ✅ |
| Permissões mínimas | ✅ | ✅ |
| Deep Linking | ✅ | ✅ |
| Push Notifications | ✅ | ✅ |
| EAS Build | ✅ | ✅ |
| ProGuard/Signing | 🟡 Não documentado | 🟡 Não documentado |

### 7.5 — Documentação

✅ README.md completo (58KB, bilíngue)
✅ 17 épicos documentados
✅ SECURITY.md, TESTING.md, CONTRIBUTING.md
✅ DEVELOPMENT_GUIDE.md, INSTALLATION_GUIDE.md
✅ PRODUCTION_CHECKLIST.md
✅ Swagger (desabilitado em produção)
✅ `.env.example` com 99 variáveis documentadas

🟡 Sem `CHANGELOG.md`
🟡 Sem runbook operacional (procedimentos de incidente)
🟡 Sem documentação de SLA/RPO/RTO

---

## FASE 8: RELATÓRIO FINAL CONSOLIDADO

### SCORECARD

| Categoria | Nota | Status |
|-----------|------|--------|
| Arquitetura e Padrões | 7.5/10 | 🟡 |
| Qualidade do Código | 6.0/10 | 🟡 |
| Segurança | 7.5/10 | 🟡 |
| Cobertura de Testes | 4.5/10 | 🔴 |
| Validação e Edge Cases | 6.0/10 | 🟡 |
| UX e Funcionalidade | 7.0/10 | 🟡 |
| Design e UI | 7.0/10 | 🟡 |
| Performance | 6.5/10 | 🟡 |
| Prontidão para Produção | 7.0/10 | 🟡 |
| Documentação | 8.0/10 | 🟢 |
| Acessibilidade | 2.5/10 | 🔴 |
| **NOTA GERAL** | **6.5/10** | 🟡 |

---

### TOP 10 PROBLEMAS MAIS CRÍTICOS

#### #1 🔴 Sem estratégia de backup do banco de dados
- **Onde**: Infraestrutura geral
- **Por que é grave**: Perda total de dados em falha de disco/acidente. Sem RPO/RTO definidos, recuperação pode levar dias.
- **Solução**:
```yaml
# Adicionar ao docker-compose.yml ou cron externo:
pg_backup:
  image: prodrigestivill/postgres-backup-local
  environment:
    POSTGRES_HOST: postgres
    POSTGRES_DB: ${DATABASE_NAME}
    POSTGRES_USER: ${DATABASE_USER}
    POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    SCHEDULE: "@daily"
    BACKUP_KEEP_DAYS: 7
    BACKUP_KEEP_WEEKS: 4
  volumes:
    - ./backups:/backups
```

#### #2 🔴 CORS vazio em produção bloqueia todas as requisições
- **Onde**: `platform/backend/src/main.ts:106-108`
- **Por que é grave**: Em produção sem `CORS_ORIGIN` no `.env`, a API rejeita 100% das chamadas do frontend/mobile. O sistema fica inoperante.
- **Solução**:
```typescript
// validation.config.ts — adicionar:
CORS_ORIGIN: Joi.string().when('NODE_ENV', {
  is: 'production',
  then: Joi.required().error(new Error('CORS_ORIGIN é obrigatório em produção'))
})
```

#### #3 🔴 Acessibilidade críicamente ausente (83% das telas)
- **Onde**: `platform/mobile/apps/client/src/screens/` — HomeScreen, CartScreen, MenuScreen, CheckoutScreen, etc.
- **Por que é grave**: Viola WCAG AA, impede uso por deficientes visuais, pode bloquear aprovação nas lojas (App Store/Google Play).
- **Solução** (padrão a aplicar em cada tela):
```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel={t('cart.addItem', { name: item.name })}
  accessibilityHint={t('cart.addItemHint')}
>
```

#### #4 🔴 `useWaiterTables` e `useWaiterLiveFeed` com dados mock em produção
- **Onde**: `platform/mobile/apps/restaurant/src/hooks/useWaiterTables.ts`
- **Por que é grave**: O Waiter Command Center (tela mais usada pelos garçons) exibe dados falsos em produção.
- **Solução**:
```typescript
export function useWaiterTables() {
  return useQuery({
    queryKey: ['waiter', 'tables'],
    queryFn: () => ApiService.get<WaiterTable[]>('/orders/waiter/my-tables'),
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}
```

#### #5 🔴 `DATABASE_SSL` não enforced em produção
- **Onde**: `platform/backend/.env.example`, `platform/backend/src/config/typeorm.config.ts`
- **Por que é grave**: Comunicação backend→banco sem TLS em rede não confiável expõe todas as credenciais.
- **Solução**: Tornar `DATABASE_SSL=true` obrigatório em produção via Joi.

#### #6 🔴 Sem certificate pinning no mobile
- **Onde**: `platform/mobile/apps/client/` e `platform/mobile/apps/restaurant/`
- **Por que é grave**: Apps vulneráveis a ataques MITM em redes controladas.
- **Solução** (React Native):
```typescript
// Usar react-native-ssl-pinning no ApiService:
import { fetch } from 'react-native-ssl-pinning';
const response = await fetch(url, {
  sslPinning: { certs: ['certificate'] }
});
```

#### #7 🔴 44 `console.log` em produção no Client App
- **Onde**: 30 telas do Client App
- **Por que é grave**: Exposição de dados de usuário em logs, possíveis vazamentos de tokens/dados sensíveis.
- **Solução**: Substituir por logger abstrato que desabilita em produção:
```typescript
// shared/utils/logger.ts
const logger = {
  log: (...args: any[]) => __DEV__ && console.log(...args),
  error: (...args: any[]) => __DEV__ && console.error(...args),
};
export default logger;
```

#### #8 🔴 God classes: AuthService (580 linhas) e OrdersService (597 linhas)
- **Onde**: `platform/backend/src/modules/auth/auth.service.ts`, `platform/backend/src/modules/orders/orders.service.ts`
- **Por que é grave**: Testabilidade impossível, manutenção arriscada, viola Single Responsibility Principle.
- **Solução**: Extrair serviços dedicados (PasswordResetService, TokenService, KdsService, WaiterStatsService).

#### #9 🔴 `FloorPlanScreen.tsx` import incorreto pode causar crash em runtime
- **Onde**: `platform/mobile/apps/restaurant/src/screens/floor-plan/FloorPlanScreen.tsx:6`
- **Por que é grave**: Import de `useColors` do path errado → runtime error → tela principal de gestão de mesas quebra.
- **Solução**:
```typescript
// REMOVER:
import { useColors } from '@okinawa/shared/theme';
// ADICIONAR:
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
```

#### #10 🔴 Timestamps duplicados em migrations
- **Onde**: `platform/backend/src/database/migrations/`
- **Por que é grave**: `1765000000001-CreateDrinkRecipesTable` e `1765000000001-CreateWaitlistEntriesTable` têm o mesmo timestamp — TypeORM pode executar fora de ordem ou pular uma delas.
- **Solução**:
```bash
# Renomear uma delas:
mv 1765000000001-CreateWaitlistEntriesTable.ts 1765000000002-CreateWaitlistEntriesTable.ts
# Atualizar o nome da classe interna correspondentemente
```

---

### PLANO DE AÇÃO PRIORIZADO

#### Sprint 1 — Bloqueadores (ANTES do deploy, ~1 semana)

| # | Ação | Arquivo | Esforço |
|---|------|---------|---------|
| 1 | Implementar backup automático PostgreSQL | infra/docker-compose | 4h |
| 2 | Tornar CORS_ORIGIN obrigatório em prod | main.ts + validation.config.ts | 1h |
| 3 | Corrigir import FloorPlanScreen | floor-plan/FloorPlanScreen.tsx | 15min |
| 4 | Corrigir timestamps duplicados nas migrations | database/migrations/ | 30min |
| 5 | Tornar DATABASE_SSL obrigatório em prod | .env.example + typeorm.config.ts | 30min |
| 6 | Substituir mock data em useWaiterTables | hooks/useWaiterTables.ts | 3h |
| 7 | Substituir mock data em useWaiterLiveFeed | hooks/useWaiterLiveFeed.ts | 3h |
| 8 | Remover todos console.log do Client App | 30 arquivos | 2h |

#### Sprint 2 — Críticos (1ª semana após deploy)

| # | Ação | Arquivo | Esforço |
|---|------|---------|---------|
| 9 | Adicionar accessibilityLabel em 50+ telas prioritárias | screens/ | 12h |
| 10 | Implementar rotação de secrets (JWT, OAuth) | Política + documentação | 4h |
| 11 | Implementar certificate pinning mobile | ApiService.ts | 4h |
| 12 | Remover/consolidar telas duplicadas (pub vs pub-bar, etc.) | navigation + screens | 3h |
| 13 | Corrigir strings hardcoded em OrderCard, StaffScreen, HomeScreen | 8 arquivos | 6h |
| 14 | Adicionar threshold de coverage 80% no CI | ci.yml | 1h |
| 15 | Enforçar DATABASE_SSL em produção | validation.config.ts | 1h |

#### Sprint 3 — Importantes (1º mês)

| # | Ação | Esforço |
|---|------|---------|
| 16 | Refatorar AuthService → PasswordResetService + TokenService | 8h |
| 17 | Refatorar OrdersService → KdsService + WaiterStatsService | 8h |
| 18 | Substituir FlatList por FlashList em 10 telas | 4h |
| 19 | Adicionar WebSocket real-time ao DashboardScreen | 4h |
| 20 | Adicionar WebSocket real-time ao FinancialScreen | 3h |
| 21 | Completar cobertura de testes dos 15 módulos sem testes | 20h |
| 22 | Reduzir 373 usos de `any` para <50 | 8h |
| 23 | Adicionar SAST (CodeQL) ao CI/CD | 2h |
| 24 | Adicionar testes unitários básicos para screens mobile | 20h |

#### Sprint 4 — Melhorias (1º trimestre)

| # | Ação | Esforço |
|---|------|---------|
| 25 | Configurar APM (Datadog ou New Relic) | 4h |
| 26 | Configurar Prometheus + Grafana | 8h |
| 27 | Adicionar WAF/DDoS (Cloudflare) | 2h |
| 28 | Criar CHANGELOG.md e processo de versionamento | 2h |
| 29 | Criar runbook operacional | 8h |
| 30 | Decompor telas >500 linhas em componentes | 16h |
| 31 | Aplicar tokens de spacing nos lugares com valores hardcoded | 8h |
| 32 | PKCE flow para OAuth em mobile | 4h |
| 33 | Documentar SLA/RPO/RTO | 4h |

---

### VEREDICTO FINAL

#### O app está pronto para ir para produção?

> ## ⚠️ NÃO — com condicionais

O projeto está **tecnicamente bem estruturado** e próximo da produção, mas existem **8 bloqueadores** que devem ser resolvidos antes do go-live:

1. ✋ Corrigir CORS vazio → API completamente inacessível sem isso
2. ✋ Corrigir FloorPlanScreen import → crash na tela principal do restaurante
3. ✋ Corrigir timestamps duplicados nas migrations → risco de DB inconsistente
4. ✋ Substituir mock data no Waiter Command Center → garçons veem dados falsos
5. ✋ Implementar backup do banco → risco de perda total de dados
6. ✋ DATABASE_SSL obrigatório em produção → credenciais expostas
7. ✋ Remover console.log do Client App → possível vazamento de dados de usuário
8. ✋ Verificar que CORS_ORIGIN está setado no .env de produção

#### Mínimo para estar pronto
**Sprint 1 completo** (estimativa: 5-7 dias de trabalho)

#### Estimativa de horas por sprint
| Sprint | Horas | Tempo (1 dev) |
|--------|-------|--------------|
| Sprint 1 — Bloqueadores | ~15h | 2-3 dias |
| Sprint 2 — Críticos | ~35h | 1 semana |
| Sprint 3 — Importantes | ~80h | 2-3 semanas |
| Sprint 4 — Melhorias | ~60h | 2 semanas |
| **Total** | **~190h** | **~6-8 semanas** |

---

### PONTOS FORTES DA PLATAFORMA

Apesar dos problemas identificados, o projeto tem **fundações sólidas**:

1. ✅ **Arquitetura modular profissional** — 39 módulos bem delimitados
2. ✅ **Segurança em camadas** — JWT + JTI blacklist + MFA + CSRF + Helmet + Rate limiting + bcrypt
3. ✅ **Autenticação moderna** — Passwordless-first (biometric, OTP, social login)
4. ✅ **Design system robusto** — Tokens semânticos, light/dark, tipografia, spacing, animações
5. ✅ **Stack atual** — NestJS 10, TypeScript 5, RN 0.74, Expo 51, TanStack Query 5
6. ✅ **Completude funcional** — 142 telas cobrindo todos os 17 épicos
7. ✅ **CI/CD profissional** — Lint, tests, build, security scan, Docker validation
8. ✅ **Documentação extensa** — 45+ documentos, README bilíngue
9. ✅ **WebSocket bem implementado** — Socket.IO com rooms, reconnection, cleanup
10. ✅ **Suporte a 11 tipos de serviço** — Fine dining, pub/bar, club, food truck, drive-thru, etc.

---

*Relatório gerado em 23/03/2026 por auditoria automatizada de código.*
*Escopo: platform/backend (NestJS), platform/mobile/apps/client (RN), platform/mobile/apps/restaurant (RN), infra (Docker, CI/CD, banco de dados).*
