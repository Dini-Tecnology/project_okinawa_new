# Project Okinawa — Restaurant Technology Platform


> **Bilingual Documentation** — This document is available in both English and Portuguese.
> **Documentação Bilíngue** — Este documento está disponível em inglês e português.

---

## Table of Contents / Índice

- [English](#english)
- [Português](#português)

---

# English

## Overview

Project Okinawa is a comprehensive **in-person  experience platform** designed to modernize and optimize hospitality operations. Unlike food delivery apps, Okinawa focuses exclusively on **physical dining experiences**, creating seamless connections between customers and establishments through technology.

### Mission Statement

> *"To be a user-centric experience platform that connects users with commercial establishments by intermediating and enabling incredible experiences."*

The platform is NOT a restaurant-focused tool, but rather centers on creating **exceptional user experiences** and meaningful connections.


### Platform Components

| Component | Technology | Description |
|-----------|------------|-------------|
| **Client Mobile App** | React Native / Expo | Customer-facing app for discovery, ordering, reservations, and payments |
| **Restaurant Mobile App** | React Native / Expo | Staff management app with KDS, floor management, and analytics |
| **Backend API** | NestJS | Scalable REST API with real-time WebSocket support (35+ modules) |
| **Preview System** | React / Vite | Interactive web-based prototype for validating flows (62+ screens) |

### Competitive Differentiation

Okinawa's market advantage is built on three pillars:

1. **Total Integration** — Centralizes 5+ fragmented tools (loyalty, KDS, payments, reservations, BI) into one ecosystem
2. **UX-First Defensibility** — 62+ native screens optimized for behavioral habits and intuitive operations
3. **Natural Lock-in** — Deep data integration that increases switching costs through accumulated insights

## Supported Service Types

The platform dynamically adapts to **11 distinct service types**:

| Service Type | Description | Key Features |
|--------------|-------------|--------------|
| **Fine Dining** | Premium experience with personalized service | Sommelier, wine pairing, dress code |
| **Quick Service** | Fast food with minimal wait times | Counter ordering, self-service pickup |
| **Fast Casual** | Quality food with quick turnaround | Hybrid ordering, table delivery |
| **Café / Bakery** | Coffee shops and bakeries | Tab system, loyalty stamps |
| **Buffet** | Self-service with weight-based pricing | Smart scale integration |
| **Drive-Thru** | Vehicle-based ordering | GPS queue, car recognition |
| **Food Truck** | Mobile food vendors | Geolocation, schedule tracking |
| **Chef's Table** | Exclusive tasting experiences | Fixed menus, limited seating |
| **Casual Dining** | Relaxed full-service restaurants | Waitlist, flexible reservations |
| **Pub & Bar** | Drinks-focused establishments | Tab management, happy hour |
| **Club & Balada** | Nightclubs and venues | Entry tickets, VIP tables, promoters |

## Platform Capabilities

| Capability | Description |
|------------|-------------|
| **Order Management** | Complete order lifecycle from placement to delivery with real-time tracking |
| **Table Management** | Real-time floor plan with drag-and-drop status tracking |
| **Reservation System** | Advanced booking with guest management and invitation flows |
| **Digital Payments** | Wallet system with Apple Pay, Google Pay, PIX, TAP to Pay, and cards |
| **Split Payment** | 4 flexible modes: Individual, Equal, Selective, Fixed Amount |
| **Loyalty Program** | Points-based rewards with tier progression |
| **Kitchen Display (KDS)** | Gesture-based KDS with SLA monitoring for kitchen and bar |
| **Analytics** | Comprehensive business intelligence with exportable reports |
| **Multi-role RBAC** | 6-tier access control: Owner, Manager, Waiter, Chef, Barman, Maître |
| **Quick Actions** | Context-aware FAB for rapid task execution |

## Key Features

### Customer Application (37 Screens)

**Discovery & Onboarding:**
- Restaurant discovery with geolocation, maps, and filters
- QR code scanning for seamless table check-in (identifies tables, menus, invitations)
- Passwordless-first authentication: Welcome → Phone Auth (OTP) → Biometric Enrollment
- Social login (Google, Apple) with real RSA-SHA256 signature verification

**Ordering & Payments:**
- Real-time menu browsing with category filtering and search
- **Unified Payment Screen** with 3 tabs: Checkout, Split Details, Tip Selection
- **4 Split Payment Modes**: Individual, Equal, Selective by item, Fixed amount
- **6 Payment Methods**: Apple Pay, Google Pay, PIX QR, Credit/Debit, TAP to Pay, Wallet
- Quick reorder from order history

**Reservations & Loyalty:**
- Advanced reservation system with guest invitation via QR/link
- Digital wallet with transaction history and balance management
- Loyalty program with points, tiers, and reward redemption
- Favorites management for quick restaurant access

**Engagement:**
- **Quick Actions FAB** — Context-aware floating button for frequent actions
- Push notifications for order status, reservation reminders, promotions
- Reviews and ratings with photo uploads
- Service-type specific flows (tabs for bars, VIP tables for clubs, etc.)

### Restaurant Application (25 Screens)

**Dashboard & Analytics:**
- Real-time dashboard with live metrics (revenue, orders, occupancy)
- **Role-Adaptive Dashboard** — Content adapts to staff role:
  - **Owner**: Revenue KPIs, customer count, average ticket
  - **Manager**: Active orders, average prep time, pending payments
  - **Waiter**: My tables, tips today, pending calls
  - **Chef**: Queue depth, prep status, SLA metrics
  - **Barman**: Drink orders, completion rate, top items
  - **Maître**: Reservations, waitlist, occupancy, VIP alerts

**Kitchen & Bar Operations:**
- **KDS with Swipe Gestures**: Swipe right to progress (New → Preparing → Ready)
- **SLA Monitoring**: Visual alerts at 5min (warning) and 8min (critical)
- Barman KDS for beverage orders with separate workflow
- Priority management and order batching

**Floor & Reservations:**
- Interactive floor plan with drag-and-drop table management
- Reservation calendar with guest counts and special requests
- Waitlist management for walk-ins
- Table status tracking (Available, Occupied, Reserved, Cleaning)

**Payments & Staff:**
- **Order Payment Tracking** — Guest-by-guest payment status in real-time
- Tip distribution and management
- Staff scheduling and HR management
- Financial reports with multi-format export (PDF, Excel)
- **Quick Actions FAB** with role-specific shortcuts

### Backend API (26 Modules)

**Core Services:**
- RESTful API with comprehensive OpenAPI/Swagger documentation
- Real-time WebSocket connections for live updates (Socket.IO)
- Multi-layer caching strategy (L1: In-memory, L2: Redis, L3: Database)
- Isolated worker process for background jobs

**Security & Auth:**
- JWT-based authentication with **JTI blacklisting** (Redis + PostgreSQL)
- OAuth integration (Google, Apple, Microsoft) — no vendor lock-in
- **Apple JWT verification** with real RSA-SHA256 cryptographic validation (JWKS)
- Multi-Factor Authentication (TOTP) support
- Role-based access control with restaurant-scoped permissions
- CSRF protection with double-submit cookie pattern (httpOnly)
- Bcrypt cost factor 12

**Processing & Integration:**
- Queue-based job processing with Bull (notifications, reports, exports)
- Internationalization (i18n) with PT/EN support
- Structured logging with correlation IDs (DI-injected `StructuredLoggerService`)
- Distributed tracing with span export via NestJS Logger
- Rate limiting (100 req/min general, 5 req/15min auth)
- Idempotent request handling

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| NestJS | 10.4.x | Application framework |
| TypeScript | 5.x | Programming language |
| PostgreSQL | 16.x | Primary database |
| Redis | 7.x | Caching, queues, and JTI blacklisting |
| TypeORM | 0.3.x | Database ORM |
| Socket.IO | 4.8.x | Real-time communication |
| Bull | 4.x | Job queue processing |
| Passport | 0.7.x | Authentication strategies |
| Swagger | 8.x | API documentation |
| Helmet | latest | Security headers (CSP, HSTS, X-Frame) |

### Mobile

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.74.x | Mobile framework |
| Expo | 51.x | Development platform |
| TypeScript | 5.x | Programming language |
| React Navigation | 6.x | Navigation |
| React Native Paper | 5.12.x | UI components |
| TanStack Query | 5.x | Data fetching & caching |
| React Hook Form | 7.x | Form management |
| Zod | 4.x | Schema validation |
| Socket.IO Client | 4.8.x | Real-time updates |
| Vitest | 3.x | Testing framework |
| MSW | 2.x | API mocking for tests |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Multi-stage production containerization |
| Docker Compose | Local orchestration |
| GitHub Actions | CI/CD pipelines (audit blocks on critical vulns) |
| PostgreSQL + PostGIS | Spatial data support |
| Redis | Session, cache, and queue management |

## Architecture

### High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │  Client App     │    │  Restaurant App │    │  Preview (Web)  │ │
│  │  React Native   │    │  React Native   │    │  React + Vite   │ │
│  │  37 screens     │    │  25 screens     │    │  62+ screens    │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘ │
└───────────┼──────────────────────┼──────────────────────┼──────────┘
            └──────────────────────┼──────────────────────┘
                                   │ HTTPS + WSS
                    ┌──────────────▼──────────────┐
                    │        NestJS Backend       │
                    │   26 Modules · 850+ Tests   │
                    │   Rate Limiting · RBAC      │
                    │   JWT JTI · CSRF · Helmet   │
                    └──────┬──────────┬───────────┘
                           │          │
              ┌────────────▼┐   ┌────▼────────┐   ┌───────────────┐
              │ PostgreSQL  │   │    Redis     │   │  External     │
              │  + PostGIS  │   │ Cache+Queue  │   │  Services     │
              │  31 tables  │   │ JTI Blacklist│   │ Twilio, Stripe│
              └─────────────┘   └─────────────┘   └───────────────┘
```

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WAF / DDoS Protection                         │
├─────────────────────────────────────────────────────────────────┤
│                    TLS 1.3 / HSTS                                │
├─────────────────────────────────────────────────────────────────┤
│                    Rate Limiting (100/min, 5/15min auth)         │
├─────────────────────────────────────────────────────────────────┤
│  Helmet CSP │ CSRF (double-submit) │ CORS (explicit origins)   │
├─────────────────────────────────────────────────────────────────┤
│  JWT + JTI  │  RBAC (6 roles)      │  Input Validation (DTO)   │
├─────────────────────────────────────────────────────────────────┤
│  Structured Logging │ Correlation ID │ Distributed Tracing      │
├─────────────────────────────────────────────────────────────────┤
│                    PostgreSQL (Encrypted at rest)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
project_okinawa/
├── platform/                         # Production platform code
│   ├── backend/                      # NestJS Backend API
│   │   ├── src/
│   │   │   ├── common/               # Shared infrastructure
│   │   │   │   ├── config/           # Environment & feature configs
│   │   │   │   ├── constants/        # App-wide constants & limits
│   │   │   │   ├── decorators/       # Custom decorators (@CurrentUser, @Roles)
│   │   │   │   ├── dto/              # Shared DTOs (pagination, etc.)
│   │   │   │   ├── filters/          # Exception filters (Sentry, global)
│   │   │   │   ├── guards/           # Auth guards (JWT, RBAC, CSRF)
│   │   │   │   ├── interfaces/       # Shared interfaces
│   │   │   │   ├── middleware/        # CSRF, maintenance, request middleware
│   │   │   │   ├── services/         # Shared services (email, etc.)
│   │   │   │   └── utils/            # Utility functions
│   │   │   ├── config/               # Configuration modules (Swagger, DB, JWT, Redis, Socket)
│   │   │   ├── database/             # Migrations (TypeORM) and seeds
│   │   │   │   └── migrations/       # Ordered migration files
│   │   │   └── modules/              # 35+ Feature modules
│   │   │       ├── auth/             # JWT, OAuth, session, token rotation
│   │   │       ├── identity/         # Credentials, MFA, password policy
│   │   │       ├── users/            # Profiles, preferences
│   │   │       ├── user-roles/       # RBAC implementation
│   │   │       ├── restaurants/      # Restaurant CRUD, service config
│   │   │       ├── orders/           # Order lifecycle, KDS formatting
│   │   │       ├── payments/         # Split payments, wallet, transactions
│   │   │       ├── reservations/     # Booking, guest management
│   │   │       ├── tables/           # Floor plan, table status
│   │   │       ├── tabs/             # Tab management (casual/bar, happy hour)
│   │   │       ├── menu-items/       # Menu management, categories
│   │   │       ├── menu-customization/ # Customization groups & options
│   │   │       ├── club/             # Club features, VIP, queue, promoters
│   │   │       ├── loyalty/          # Points, tiers, rewards
│   │   │       ├── tips/             # Gratuity distribution
│   │   │       ├── reviews/          # Ratings, review moderation
│   │   │       ├── favorites/        # User favorites
│   │   │       ├── notifications/    # Push notifications (FCM)
│   │   │       ├── analytics/        # Business intelligence (metrics, aggregation, forecast)
│   │   │       ├── financial/        # Reports, transactions, export
│   │   │       ├── hr/               # Staff management, scheduling
│   │   │       ├── ai/               # AI-powered features
│   │   │       ├── qr-code/          # QR generation and validation
│   │   │       ├── webhooks/         # External integrations (delivery, signature)
│   │   │       ├── events/           # WebSocket event handling
│   │   │       ├── i18n/             # Internationalization (PT/EN/ES)
│   │   │       ├── health/           # System health checks, circuit breaker
│   │   │       ├── service-config/   # Config Hub (JSONB, 11 endpoints, WS)
│   │   │       ├── approvals/        # Manager approval workflows (WS)
│   │   │       ├── inventory/        # 3-tier stock inventory
│   │   │       ├── recipes/          # Drink recipes with seeds
│   │   │       ├── promotions/       # Loyalty promotions & stamp cards
│   │   │       ├── restaurant-waitlist/ # Smart waitlist (WS)
│   │   │       ├── calls/            # Service calls (WS)
│   │   │       ├── addresses/        # User addresses
│   │   │       ├── receipts/         # Receipt generation (auto receipt_number)
│   │   │       ├── geofencing/       # Haversine distance calculations
│   │   │       └── legal/            # Privacy policy & terms of service
│   │   ├── test/                     # E2E tests
│   │   ├── docker-compose.yml        # Local infrastructure
│   │   └── Dockerfile                # Multi-stage production build
│   │
│   ├── mobile/
│   │   ├── apps/
│   │   │   ├── client/               # Customer mobile app (37+ screens)
│   │   │   │   ├── src/screens/      # Native screens
│   │   │   │   ├── src/navigation/   # Stack + Tab navigators
│   │   │   │   └── src/__tests__/    # Screen-level tests
│   │   │   └── restaurant/           # Restaurant staff app (25+ screens)
│   │   │       ├── src/screens/      # Native screens
│   │   │       ├── src/navigation/   # Drawer + Stack navigators
│   │   │       └── src/__tests__/    # Screen-level tests
│   │   ├── shared/                   # Shared code between apps
│   │   │   ├── components/           # Reusable UI components (design system)
│   │   │   ├── hooks/                # useAuth, useOrders, useWebSocket, useI18n, useAsyncState
│   │   │   ├── services/             # Unified API service (single source of truth)
│   │   │   ├── contexts/             # RestaurantContext, AuthContext, CartContext
│   │   │   ├── i18n/                 # Translations (pt-BR, en-US, es-ES)
│   │   │   ├── screens/              # Shared screens (Maintenance, Legal)
│   │   │   ├── theme/                # Design tokens (colors, spacing, typography)
│   │   │   ├── validation/           # Zod schemas
│   │   │   └── types/                # TypeScript definitions
│   │   └── eas.json                  # EAS Build configuration
│   │
│   └── supabase/                     # Supabase configuration
│
├── src/                              # Web Preview (React + Vite) — reference only
│   └── components/
│       └── mobile-preview-v2/        # 62+ preview screens
│
├── docs/                             # Comprehensive documentation (21 files)
│   ├── ARCHITECTURE.md               # System architecture (~1500 lines)
│   ├── SERVICE_TYPES.md              # 11 service types specification (~3000 lines)
│   ├── BOUNDED_CONTEXTS.md           # Domain bounded contexts
│   ├── RESTAURANT_STAFF_ROLES.md     # 6-tier RBAC specification
│   ├── OWASP_CHECKLIST.md            # OWASP Top 10 compliance
│   ├── PENTEST_REPORT.md             # Penetration testing report
│   ├── PRODUCTION_CHECKLIST.md       # Production deployment checklist
│   ├── SCALING_STRATEGY.md           # 10x-100x scaling roadmap
│   ├── DEVELOPMENT_GUIDE.md          # Development workflows and patterns
│   ├── INSTALLATION_GUIDE.md         # Setup and configuration
│   └── ...                           # Additional docs
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI pipeline (blocks on critical vulns)
│
├── CHANGELOG.md                      # Version changelog (Keep a Changelog format)
├── SECURITY.md                       # Security policy and practices
├── CONTRIBUTING.md                   # Contribution guidelines
├── TESTING.md                        # Testing documentation
└── ARCHITECTURE.md                   # High-level architecture overview
```

### Database Schema (31 Tables)

| Category | Tables | Description |
|----------|--------|-------------|
| **Users** | `profiles`, `user_roles`, `user_credentials` | Identity and access management |
| **Restaurants** | `restaurants`, `restaurant_tables`, `restaurant_service_configs` | Establishment data and configuration |
| **Menu** | `menu_items`, `menu_categories`, `menu_modifiers` | Product catalog |
| **Orders** | `orders`, `order_items`, `order_guests` | Order processing |
| **Payments** | `payments`, `payment_splits`, `wallets`, `wallet_transactions` | Financial transactions |
| **Reservations** | `reservations`, `reservation_guests` | Booking management |
| **Engagement** | `reviews`, `favorites`, `loyalty_programs`, `loyalty_points` | Customer engagement |
| **Operations** | `tips`, `notifications`, `audit_logs` | Operational data |
| **Club** | `club_entries`, `vip_reservations`, `queue_entries`, `promoters` | Nightclub features |

## Security Hardening

The platform has undergone three rounds of technical audit with the following remediations:

| Remediation | Status | Details |
|-------------|--------|---------|
| JWT JTI Blacklisting | ✅ Done | Redis + PostgreSQL dual-layer token revocation |
| Apple JWT Verification | ✅ Done | RSA-SHA256 cryptographic validation via JWKS (native `crypto.verify`) |
| Token Expiry Standardization | ✅ Done | Access: 15m, Refresh: 7d |
| Bcrypt Cost Factor | ✅ Done | Upgraded from 10 to 12 |
| CSRF Protection | ✅ Done | Double-submit cookie pattern with httpOnly cookies |
| CSP Hardening | ✅ Done | Removed `unsafe-inline` in production |
| Structured Logging | ✅ Done | All `console.log` replaced by `StructuredLoggerService` / NestJS `Logger` |
| LoggingInterceptor DI | ✅ Done | Refactored from manual instantiation to proper DI injection |
| Swagger Unified Config | ✅ Done | Removed duplicate config in `main.ts`; uses `swagger.config.ts` |
| CI Audit Blocking | ✅ Done | `npm audit` now fails build on critical/high vulnerabilities |
| TracingService Logger | ✅ Done | Production span export uses `this.logger.log` instead of `console.log` |

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker and Docker Compose
- Git
- iOS Simulator (macOS) or Android Studio

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/dinipedro/project_okinawa.git
cd project_okinawa

# Install backend dependencies
cd platform/backend && npm install

# Install mobile dependencies
cd ../mobile && npm install
```

### Start Infrastructure

```bash
# Start PostgreSQL and Redis
cd platform/backend
docker-compose up -d

# Run database migrations
npm run migration:run

# (Optional) Seed database with sample data
npm run seed
```

### Run Applications

```bash
# Terminal 1 — Backend API
cd platform/backend
npm run start:dev
# API available at http://localhost:3000/api/v1
# Swagger docs at http://localhost:3000/docs (disabled in production)

# Terminal 2 — Client Mobile App
cd platform/mobile/apps/client
npx expo start

# Terminal 3 — Restaurant Mobile App
cd platform/mobile/apps/restaurant
npx expo start
```

### Environment Variables

```bash
# Required backend environment variables
DATABASE_URL=postgresql://user:pass@localhost:5432/okinawa
REDIS_URL=redis://localhost:6379
JWT_SECRET=<min-32-chars>
JWT_REFRESH_SECRET=<min-32-chars>
CSRF_SECRET=<min-32-chars>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
APPLE_CLIENT_ID=<your-apple-client-id>
APPLE_TEAM_ID=<your-apple-team-id>
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
NODE_ENV=production|development
```

> ⚠️ Docker containers use `${VAR:?error}` to fail on missing required variables.

## API Reference

### Authentication

```bash
POST /api/v1/auth/login              # Email/password login
POST /api/v1/auth/register           # New user registration
POST /api/v1/auth/refresh            # Refresh access token (JTI rotation)
POST /api/v1/auth/logout             # Invalidate session (JTI blacklist)
GET  /api/v1/auth/google             # Google OAuth 2.0
GET  /api/v1/auth/apple              # Apple Sign In (RSA-SHA256 verified)
POST /api/v1/auth/otp/send           # Send OTP via SMS/WhatsApp
POST /api/v1/auth/otp/verify         # Verify OTP code
POST /api/v1/auth/biometric/register # Register biometric credential
POST /api/v1/auth/biometric/verify   # Verify biometric token
```

### Core Endpoints

```bash
# Restaurants
GET    /api/v1/restaurants           # List restaurants (geo-filtered)
GET    /api/v1/restaurants/:id       # Get restaurant details
POST   /api/v1/restaurants           # Create restaurant

# Orders
GET    /api/v1/orders                # List orders
POST   /api/v1/orders                # Create order
PATCH  /api/v1/orders/:id/status     # Update order status (KDS integration)

# Reservations
GET    /api/v1/reservations          # List reservations
POST   /api/v1/reservations          # Create reservation
POST   /api/v1/reservations/:id/invite # Invite guest via QR/link

# Menu
GET    /api/v1/menu-items            # List menu items
GET    /api/v1/menu-categories       # List categories

# Payments
GET    /api/v1/wallets/:id           # Get wallet balance
POST   /api/v1/payments              # Process payment
POST   /api/v1/payments/split        # Split payment (4 modes)

# Tables
GET    /api/v1/tables                # List tables with status
PATCH  /api/v1/tables/:id/status     # Update table status

# Loyalty
GET    /api/v1/loyalty/points        # Get loyalty points
POST   /api/v1/loyalty/redeem        # Redeem rewards
```

Full API documentation available at `/docs` when running the backend (disabled in production).

### WebSocket Events

```typescript
// Real-time events via Socket.IO
'order:created'        // New order placed
'order:status_changed' // Order status update (KDS)
'table:status_changed' // Table availability change
'payment:completed'    // Payment processed
'reservation:updated'  // Reservation status change
'queue:position'       // Queue position update (clubs)
'waiter:called'        // Waiter call notification
```

## Backend Modules (35+)

| # | Module | Description |
|---|--------|-------------|
| 1 | **Auth** | JWT, OAuth (Google/Apple/Microsoft), token rotation, JTI blacklisting |
| 2 | **Identity** | Credentials, MFA (TOTP), password policy, password history |
| 3 | **Users** | Profile management, preferences |
| 4 | **User Roles** | RBAC implementation (7 roles, restaurant-scoped) |
| 5 | **Restaurants** | Restaurant CRUD, service configuration |
| 6 | **Orders** | Order lifecycle, KDS integration, waiter stats |
| 7 | **Payments** | Wallet, transactions, 4-mode split payment |
| 8 | **Reservations** | Booking, guest management, invitations |
| 9 | **Tables** | Floor plan, table status, real-time tracking |
| 10 | **Tabs** | Tab management, happy hour, waiter calls |
| 11 | **Menu Items** | Menu management, categories, modifiers |
| 12 | **Menu Customization** | Customization groups with JSONB options |
| 13 | **Club** | Club features, VIP tables, virtual queue, promoters |
| 14 | **Loyalty** | Points, tiers, rewards, redemption |
| 15 | **Promotions** | Stamp cards, promotional campaigns |
| 16 | **Tips** | Gratuity distribution and management |
| 17 | **Reviews** | Ratings, review moderation, photos |
| 18 | **Favorites** | User favorites management |
| 19 | **Notifications** | Push notifications (FCM), preferences |
| 20 | **Analytics** | Business intelligence, metrics, aggregation, forecasting |
| 21 | **Financial** | Reports, transactions, multi-format export |
| 22 | **HR** | Staff management, scheduling, attendance |
| 23 | **AI** | AI-powered features (pairing, recommendations) |
| 24 | **QR Code** | QR generation, validation, deep linking |
| 25 | **Webhooks** | External integrations, delivery, signatures |
| 26 | **Events** | WebSocket event handling (Socket.IO) |
| 27 | **i18n** | Internationalization (PT-BR/EN-US/ES-ES) |
| 28 | **Health** | System health checks, circuit breaker, readiness probes |
| 29 | **Service Config** | Config Hub (JSONB, 11 endpoints, WebSocket) |
| 30 | **Approvals** | Manager approval workflows (WebSocket) |
| 31 | **Inventory** | 3-tier stock inventory management |
| 32 | **Recipes** | Drink recipes with seed data |
| 33 | **Restaurant Waitlist** | Smart waitlist with WebSocket updates |
| 34 | **Calls** | Service calls (waiter, help) with WebSocket |
| 35 | **Addresses** | User address management |
| 36 | **Receipts** | Receipt generation with auto receipt_number |
| 37 | **Geofencing** | Haversine distance calculations |
| 38 | **Legal** | Privacy policy and terms of service (i18n) |

## Testing

The project includes a comprehensive test suite with **850+ tests** achieving **95%+ coverage**.

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| Shared Components | 7 | 180+ | 95%+ |
| Shared Services | 4 | 75+ | 95%+ |
| Shared Validation | 1 | 28+ | 100% |
| Shared Integration | 3 | 50+ | 95%+ |
| Shared Utils | 4 | 150+ | 95%+ |
| Shared Hooks | 4 | 120+ | 95%+ |
| Shared Contexts | 3 | 80+ | 95%+ |
| Client App | 3 | 85+ | 90%+ |
| Restaurant App | 3 | 85+ | 90%+ |
| **Total** | **32** | **850+** | **95%+** |

```bash
# Run backend tests
cd platform/backend && npm run test

# Run backend tests with coverage
cd platform/backend && npm run test:cov

# Run mobile tests
cd platform/mobile && npm run test

# Run mobile tests with coverage
cd platform/mobile && npm run test -- --coverage

# Run specific app tests
cd platform/mobile/apps/client && npx vitest run
cd platform/mobile/apps/restaurant && npx vitest run
```

See [TESTING.md](TESTING.md) for complete testing documentation.

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Detailed system architecture (~1500 lines, bilingual) |
| [SERVICE_TYPES.md](docs/SERVICE_TYPES.md) | 11 service types specification (~3000 lines) |
| [BOUNDED_CONTEXTS.md](docs/BOUNDED_CONTEXTS.md) | Domain bounded contexts |
| [RESTAURANT_STAFF_ROLES.md](docs/RESTAURANT_STAFF_ROLES.md) | 6-tier RBAC specification |
| [OWASP_CHECKLIST.md](docs/OWASP_CHECKLIST.md) | OWASP Top 10 compliance status |
| [PENTEST_REPORT.md](docs/PENTEST_REPORT.md) | Penetration testing report |
| [PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) | Production deployment checklist |
| [SCALING_STRATEGY.md](docs/SCALING_STRATEGY.md) | 10x–100x scaling roadmap |
| [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | Development workflows and patterns |
| [INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) | Setup and configuration |
| [QR_CODE_SYSTEM_SPECIFICATION.md](docs/QR_CODE_SYSTEM_SPECIFICATION.md) | QR code system spec |
| [UX_IMPROVEMENT_PROPOSALS.md](docs/UX_IMPROVEMENT_PROPOSALS.md) | UX improvements |
| [UX_UI_GUIDE.md](docs/UX_UI_GUIDE.md) | Design system guide |
| [GTM_STRATEGY.md](docs/GTM_STRATEGY.md) | Go-to-market strategy |
| [TESTING.md](TESTING.md) | Testing documentation (850+ tests, 95%+ coverage) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](SECURITY.md) | Security policy and practices |

## Contributing

We welcome contributions to Project Okinawa. Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development process
- Coding standards (semantic tokens, DTOs, DI patterns)
- Commit conventions (Conventional Commits)
- Pull request process
- Branch strategy (main → develop → feature/*)

## License

This project is proprietary software. All rights reserved.

Copyright (c) 2024–2026 Pedro Dini

Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without express written permission from the copyright holder.

## Support

For technical support or inquiries:

- Review the [documentation](docs/)
- Check existing [issues](https://github.com/pedrodini/project-okinawa/issues)
- Create a new issue with detailed information

---

# Português

## Visão Geral

O Project Okinawa é uma plataforma abrangente de **experiência presencial** projetada para modernizar e otimizar operações de hospitalidade. Diferente de apps de delivery, o Okinawa foca exclusivamente em **experiências físicas de refeição**, criando conexões perfeitas entre clientes e estabelecimentos através da tecnologia.

### Declaração de Missão

> *"Ser uma plataforma de experiência centrada no usuário que conecta pessoas com estabelecimentos comerciais, intermediando e possibilitando experiências incríveis."*

A plataforma NÃO é uma ferramenta focada em restaurantes, mas sim centrada em criar **experiências de usuário excepcionais** e conexões significativas.

### Status da Auditoria Técnica


### Componentes da Plataforma

| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **App Mobile Cliente** | React Native / Expo | App para clientes: descoberta, pedidos, reservas, pagamentos |
| **App Mobile Restaurante** | React Native / Expo | App de gestão para equipe: KDS, salão, analytics |
| **API Backend** | NestJS | API REST escalável com suporte WebSocket em tempo real (35+ módulos) |
| **Sistema de Preview** | React / Vite | Protótipo web interativo para validação de fluxos (62+ telas) |

### Diferenciação Competitiva

A vantagem de mercado do Okinawa é construída em três pilares:

1. **Integração Total** — Centraliza 5+ ferramentas fragmentadas (fidelidade, KDS, pagamentos, reservas, BI) em um ecossistema
2. **Defensibilidade UX-First** — 62+ telas nativas otimizadas para hábitos comportamentais e operações intuitivas
3. **Lock-in Natural** — Integração profunda de dados que aumenta custos de troca através de insights acumulados

## Tipos de Serviço Suportados

A plataforma se adapta dinamicamente a **11 tipos distintos de serviço**:

| Tipo de Serviço | Descrição | Recursos Principais |
|-----------------|-----------|---------------------|
| **Fine Dining** | Experiência premium com serviço personalizado | Sommelier, harmonização, dress code |
| **Quick Service** | Fast food com tempo mínimo de espera | Pedido no balcão, retirada self-service |
| **Fast Casual** | Comida de qualidade com rapidez | Pedido híbrido, entrega na mesa |
| **Café / Padaria** | Cafeterias e padarias | Sistema de comanda, carimbos de fidelidade |
| **Buffet** | Self-service com preço por peso | Integração com balança inteligente |
| **Drive-Thru** | Pedidos para veículos | Fila GPS, reconhecimento de carro |
| **Food Truck** | Vendedores ambulantes de comida | Geolocalização, rastreamento de agenda |
| **Chef's Table** | Experiências exclusivas de degustação | Menus fixos, assentos limitados |
| **Casual Dining** | Restaurantes full-service relaxados | Waitlist, reservas flexíveis |
| **Pub & Bar** | Estabelecimentos focados em bebidas | Gestão de comandas, happy hour |
| **Club & Balada** | Casas noturnas e venues | Ingressos, mesas VIP, promoters |

## Capacidades da Plataforma

| Capacidade | Descrição |
|------------|-----------|
| **Gestão de Pedidos** | Ciclo completo do pedido da criação à entrega com rastreamento em tempo real |
| **Gestão de Mesas** | Planta do salão em tempo real com arrastar-e-soltar |
| **Sistema de Reservas** | Reservas avançadas com gestão de convidados e fluxos de convite |
| **Pagamentos Digitais** | Carteira com Apple Pay, Google Pay, PIX, TAP to Pay, cartões |
| **Divisão de Pagamento** | 4 modos flexíveis: Individual, Igual, Seletivo, Valor Fixo |
| **Programa de Fidelidade** | Recompensas baseadas em pontos com progressão de níveis |
| **Display de Cozinha (KDS)** | KDS baseado em gestos com monitoramento SLA para cozinha e bar |
| **Analytics** | Business intelligence completo com relatórios exportáveis |
| **RBAC Multi-função** | Controle de acesso de 6 níveis: Dono, Gerente, Garçom, Chef, Barman, Maître |
| **Ações Rápidas** | FAB contextual para execução rápida de tarefas |

## Funcionalidades Principais

### Aplicativo do Cliente (37 Telas)

**Descoberta e Onboarding:**
- Descoberta de restaurantes com geolocalização, mapas e filtros
- Escaneamento de QR code para check-in (identifica mesas, cardápios, convites)
- Autenticação passwordless-first: Boas-vindas → Telefone (OTP) → Biometria
- Login social (Google, Apple) com verificação criptográfica RSA-SHA256 real

**Pedidos e Pagamentos:**
- Navegação de cardápio em tempo real com filtros e busca
- **Tela de Pagamento Unificada** com 3 abas: Checkout, Detalhes Divisão, Gorjeta
- **4 Modos de Divisão**: Individual, Igual, Seletivo por item, Valor fixo
- **6 Métodos de Pagamento**: Apple Pay, Google Pay, PIX QR, Débito/Crédito, TAP to Pay, Carteira

**Reservas e Fidelidade:**
- Sistema de reservas avançado com convite de convidados via QR/link
- Carteira digital com histórico de transações e gestão de saldo
- Programa de fidelidade com pontos, níveis e resgate de recompensas

**Engajamento:**
- **FAB de Ações Rápidas** — Botão flutuante contextual para ações frequentes
- Notificações push para status de pedido, lembretes de reserva, promoções
- Avaliações com upload de fotos
- Fluxos específicos por tipo de serviço (comandas para bares, mesas VIP para baladas)

### Aplicativo do Restaurante (25 Telas)

**Dashboard e Analytics:**
- Dashboard em tempo real com métricas ao vivo (receita, pedidos, ocupação)
- **Dashboard Adaptativo por Cargo** — Conteúdo adapta-se ao cargo:
  - **Dono**: KPIs de receita, contagem de clientes, ticket médio
  - **Gerente**: Pedidos ativos, tempo médio de preparo, pagamentos pendentes
  - **Garçom**: Minhas mesas, gorjetas do dia, chamadas pendentes
  - **Chef**: Profundidade da fila, status de preparo, métricas SLA
  - **Barman**: Pedidos de bebidas, taxa de conclusão, itens top
  - **Maître**: Reservas, waitlist, ocupação, alertas VIP

**Operações de Cozinha e Bar:**
- **KDS com Gestos de Swipe**: Swipe direita para progredir (Novo → Preparando → Pronto)
- **Monitoramento SLA**: Alertas visuais em 5min (aviso) e 8min (crítico)
- KDS de Barman para pedidos de bebidas com workflow separado

**Salão e Reservas:**
- Planta interativa do salão com gestão arrastar-e-soltar
- Calendário de reservas com contagem de convidados e solicitações especiais
- Gestão de waitlist para walk-ins

**Pagamentos e Equipe:**
- **Rastreamento de Pagamentos** — Status de pagamento convidado por convidado em tempo real
- Distribuição e gestão de gorjetas
- Agendamento de equipe e gestão de RH
- Relatórios financeiros com exportação multi-formato (PDF, Excel)

### Backend API (26 Módulos)

**Serviços Core:**
- API RESTful com documentação OpenAPI/Swagger completa
- Conexões WebSocket em tempo real (Socket.IO)
- Estratégia de cache multi-camada (L1: In-memory, L2: Redis, L3: Database)
- Worker process isolado para jobs em background

**Segurança e Auth:**
- Autenticação JWT com **JTI blacklisting** (Redis + PostgreSQL)
- OAuth (Google, Apple, Microsoft) — sem vendor lock-in
- **Verificação Apple JWT** com validação criptográfica RSA-SHA256 real (JWKS)
- MFA (TOTP) com códigos de recuperação
- RBAC com permissões scoped por restaurante
- CSRF com double-submit cookie pattern (httpOnly)
- Bcrypt cost factor 12

**Processamento e Integração:**
- Filas com Bull (notificações, relatórios, exportações)
- Internacionalização (i18n) PT/EN
- Logging estruturado com correlation IDs (`StructuredLoggerService` DI-injected)
- Tracing distribuído com export de spans via NestJS Logger
- Rate limiting (100 req/min geral, 5 req/15min auth)
- Handling de requests idempotentes

## Hardening de Segurança

A plataforma passou por três rodadas de auditoria técnica com as seguintes remediações:

| Remediação | Status | Detalhes |
|------------|--------|----------|
| JWT JTI Blacklisting | ✅ Feito | Revogação de tokens dual-layer (Redis + PostgreSQL) |
| Verificação Apple JWT | ✅ Feito | Validação criptográfica RSA-SHA256 via JWKS (nativo `crypto.verify`) |
| Padronização Token Expiry | ✅ Feito | Access: 15m, Refresh: 7d |
| Bcrypt Cost Factor | ✅ Feito | Atualizado de 10 para 12 |
| Proteção CSRF | ✅ Feito | Double-submit cookie pattern com cookies httpOnly |
| CSP Hardening | ✅ Feito | Removido `unsafe-inline` em produção |
| Logging Estruturado | ✅ Feito | Todos `console.log` substituídos por `StructuredLoggerService` / NestJS `Logger` |
| LoggingInterceptor DI | ✅ Feito | Refatorado de instanciação manual para injeção de dependência |
| Swagger Config Unificado | ✅ Feito | Removida config duplicada no `main.ts`; usa `swagger.config.ts` |
| CI Audit Blocking | ✅ Feito | `npm audit` agora falha o build em vulnerabilidades críticas/altas |
| TracingService Logger | ✅ Feito | Export de spans em produção usa `this.logger.log` em vez de `console.log` |

## Stack Tecnológica

### Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Node.js | 20.x | Ambiente de execução |
| NestJS | 10.4.x | Framework de aplicação |
| TypeScript | 5.x | Linguagem de programação |
| PostgreSQL | 16.x | Banco de dados principal |
| Redis | 7.x | Cache, filas e JTI blacklisting |
| TypeORM | 0.3.x | ORM de banco de dados |
| Socket.IO | 4.8.x | Comunicação em tempo real |
| Bull | 4.x | Processamento de filas |
| Passport | 0.7.x | Estratégias de autenticação |
| Swagger | 8.x | Documentação da API |
| Helmet | latest | Headers de segurança (CSP, HSTS, X-Frame) |

### Mobile

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React Native | 0.74.x | Framework mobile |
| Expo | 51.x | Plataforma de desenvolvimento |
| TypeScript | 5.x | Linguagem de programação |
| React Navigation | 6.x | Navegação |
| React Native Paper | 5.12.x | Componentes de UI |
| TanStack Query | 5.x | Busca de dados & caching |
| React Hook Form | 7.x | Gerenciamento de formulários |
| Zod | 4.x | Validação de schema |
| Socket.IO Client | 4.8.x | Atualizações em tempo real |
| Vitest | 3.x | Framework de testes |
| MSW | 2.x | Mock de APIs para testes |

### Infraestrutura

| Tecnologia | Propósito |
|------------|-----------|
| Docker | Containerização multi-stage para produção |
| Docker Compose | Orquestração local |
| GitHub Actions | Pipelines CI/CD (audit bloqueia em vulns críticas) |
| PostgreSQL + PostGIS | Suporte a dados espaciais |
| Redis | Gestão de sessão, cache e filas |

## Início Rápido

### Pré-requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker e Docker Compose
- Git
- iOS Simulator (macOS) ou Android Studio

### Instalação Rápida

```bash
# Clonar o repositório
git clone https://github.com/pedrodini/project-okinawa.git
cd project_okinawa-1

# Instalar todas as dependências
./install-dependencies-fixed.sh

# Ou manualmente:
npm install
cd backend && npm install
cd ../mobile && npm install
```

### Iniciar Infraestrutura

```bash
# Iniciar PostgreSQL e Redis
cd backend
docker-compose up -d

# Executar migrations do banco
npm run migration:run

# (Opcional) Popular banco com dados de exemplo
npm run seed
```

### Executar Aplicações

```bash
# Terminal 1 — API Backend
cd backend
npm run start:dev
# API disponível em http://localhost:3000/api/v1
# Documentação Swagger em http://localhost:3000/docs (desabilitado em produção)

# Terminal 2 — App Mobile Cliente
cd mobile/apps/client
npm start

# Terminal 3 — App Mobile Restaurante
cd mobile/apps/restaurant
npm start

# Terminal 4 — Web Preview
npm run dev
# Preview disponível em http://localhost:5173
```

### Variáveis de Ambiente

```bash
# Variáveis de ambiente obrigatórias do backend
DATABASE_URL=postgresql://user:pass@localhost:5432/okinawa
REDIS_URL=redis://localhost:6379
JWT_SECRET=<min-32-chars>
JWT_REFRESH_SECRET=<min-32-chars>
CSRF_SECRET=<min-32-chars>
GOOGLE_CLIENT_ID=<seu-google-client-id>
GOOGLE_CLIENT_SECRET=<seu-google-client-secret>
APPLE_CLIENT_ID=<seu-apple-client-id>
APPLE_TEAM_ID=<seu-apple-team-id>
TWILIO_ACCOUNT_SID=<seu-twilio-sid>
TWILIO_AUTH_TOKEN=<seu-twilio-token>
NODE_ENV=production|development
```

> ⚠️ Containers Docker usam `${VAR:?error}` para falhar em variáveis obrigatórias ausentes.

## Referência da API

### Autenticação

```bash
POST /api/v1/auth/login              # Login email/senha
POST /api/v1/auth/register           # Registro de novo usuário
POST /api/v1/auth/refresh            # Atualizar token (rotação JTI)
POST /api/v1/auth/logout             # Invalidar sessão (JTI blacklist)
GET  /api/v1/auth/google             # OAuth Google 2.0
GET  /api/v1/auth/apple              # Apple Sign In (RSA-SHA256 verificado)
POST /api/v1/auth/otp/send           # Enviar OTP via SMS/WhatsApp
POST /api/v1/auth/otp/verify         # Verificar código OTP
POST /api/v1/auth/biometric/register # Registrar credencial biométrica
POST /api/v1/auth/biometric/verify   # Verificar token biométrico
```

### Endpoints Principais

```bash
# Restaurantes
GET    /api/v1/restaurants           # Listar restaurantes (geo-filtered)
GET    /api/v1/restaurants/:id       # Detalhes do restaurante
POST   /api/v1/restaurants           # Criar restaurante

# Pedidos
GET    /api/v1/orders                # Listar pedidos
POST   /api/v1/orders                # Criar pedido
PATCH  /api/v1/orders/:id/status     # Atualizar status (integração KDS)

# Reservas
GET    /api/v1/reservations          # Listar reservas
POST   /api/v1/reservations          # Criar reserva
POST   /api/v1/reservations/:id/invite # Convidar via QR/link

# Cardápio
GET    /api/v1/menu-items            # Listar itens do cardápio
GET    /api/v1/menu-categories       # Listar categorias

# Pagamentos
GET    /api/v1/wallets/:id           # Saldo da carteira
POST   /api/v1/payments              # Processar pagamento
POST   /api/v1/payments/split        # Dividir pagamento (4 modos)

# Mesas
GET    /api/v1/tables                # Listar mesas com status
PATCH  /api/v1/tables/:id/status     # Atualizar status da mesa

# Fidelidade
GET    /api/v1/loyalty/points        # Consultar pontos
POST   /api/v1/loyalty/redeem        # Resgatar recompensas
```

Documentação completa da API disponível em `/docs` ao executar o backend (desabilitado em produção).

### Eventos WebSocket

```typescript
// Eventos em tempo real via Socket.IO
'order:created'        // Novo pedido criado
'order:status_changed' // Atualização de status (KDS)
'table:status_changed' // Mudança de disponibilidade da mesa
'payment:completed'    // Pagamento processado
'reservation:updated'  // Atualização de reserva
'queue:position'       // Posição na fila (clubs)
'waiter:called'        // Notificação de chamada do garçom
```

## Módulos do Backend (26)

| # | Módulo | Descrição |
|---|--------|-----------|
| 1 | **Auth** | JWT, OAuth (Google/Apple/Microsoft), rotação de tokens, JTI blacklisting |
| 2 | **Identity** | Credenciais, MFA (TOTP), política de senha, histórico de senhas |
| 3 | **Users** | Gestão de perfil, preferências |
| 4 | **User Roles** | Implementação RBAC (6 níveis, scoped por restaurante) |
| 5 | **Restaurants** | CRUD de restaurante, configuração de serviço |
| 6 | **Orders** | Ciclo de vida de pedidos, integração KDS, stats do garçom |
| 7 | **Payments** | Carteira, transações, divisão de pagamento 4 modos |
| 8 | **Reservations** | Reservas, gestão de convidados, convites |
| 9 | **Tables** | Planta do salão, status de mesas, rastreamento em tempo real |
| 10 | **Tabs** | Gestão de comandas para casual dining e bares |
| 11 | **Menu Items** | Gestão de cardápio, categorias, modificadores |
| 12 | **Club** | Features de club, mesas VIP, fila virtual, promoters |
| 13 | **Loyalty** | Pontos, níveis, recompensas, resgate |
| 14 | **Tips** | Distribuição e gestão de gorjetas |
| 15 | **Reviews** | Avaliações, moderação, fotos |
| 16 | **Favorites** | Gestão de favoritos do usuário |
| 17 | **Notifications** | Notificações push (FCM), preferências |
| 18 | **Analytics** | Business intelligence, KPIs |
| 19 | **Financial** | Relatórios, transações, exportação multi-formato |
| 20 | **HR** | Gestão de equipe, agendamento |
| 21 | **AI** | Features com IA (harmonização, recomendações) |
| 22 | **QR Code** | Geração de QR, validação, deep linking |
| 23 | **Webhooks** | Integrações externas |
| 24 | **Events** | Handling de eventos WebSocket (Socket.IO) |
| 25 | **i18n** | Internacionalização (PT/EN) |
| 26 | **Health** | Verificações de saúde do sistema, readiness probes |

## Testes

O projeto inclui uma suíte de testes abrangente com **850+ testes** alcançando **95%+ de cobertura**.

| Categoria | Arquivos | Testes | Cobertura |
|-----------|----------|--------|-----------|
| Componentes Compartilhados | 7 | 180+ | 95%+ |
| Serviços Compartilhados | 4 | 75+ | 95%+ |
| Validação Compartilhada | 1 | 28+ | 100% |
| Integração Compartilhada | 3 | 50+ | 95%+ |
| Utils Compartilhados | 4 | 150+ | 95%+ |
| Hooks Compartilhados | 4 | 120+ | 95%+ |
| Contextos Compartilhados | 3 | 80+ | 95%+ |
| App Cliente | 3 | 85+ | 90%+ |
| App Restaurante | 3 | 85+ | 90%+ |
| **Total** | **32** | **850+** | **95%+** |

```bash
# Executar todos os testes
cd mobile && npm run test

# Executar com cobertura
npm run test -- --coverage

# Executar testes de app específico
cd mobile/apps/client && npx vitest run
cd mobile/apps/restaurant && npx vitest run
```

Veja [TESTING.md](TESTING.md) para documentação completa de testes.

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura detalhada do sistema (~1500 linhas, bilíngue) |
| [SERVICE_TYPES.md](docs/SERVICE_TYPES.md) | Especificação dos 11 tipos de serviço (~3000 linhas) |
| [BOUNDED_CONTEXTS.md](docs/BOUNDED_CONTEXTS.md) | Bounded contexts do domínio |
| [RESTAURANT_STAFF_ROLES.md](docs/RESTAURANT_STAFF_ROLES.md) | Especificação RBAC de 6 níveis |
| [OWASP_CHECKLIST.md](docs/OWASP_CHECKLIST.md) | Status de conformidade OWASP Top 10 |
| [PENTEST_REPORT.md](docs/PENTEST_REPORT.md) | Relatório de testes de penetração |
| [PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) | Checklist de deploy para produção |
| [SCALING_STRATEGY.md](docs/SCALING_STRATEGY.md) | Roadmap de escalabilidade 10x–100x |
| [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | Workflows e padrões de desenvolvimento |
| [INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) | Setup e configuração |
| [QR_CODE_SYSTEM_SPECIFICATION.md](docs/QR_CODE_SYSTEM_SPECIFICATION.md) | Especificação do sistema QR |
| [UX_IMPROVEMENT_PROPOSALS.md](docs/UX_IMPROVEMENT_PROPOSALS.md) | Melhorias de UX |
| [UX_UI_GUIDE.md](docs/UX_UI_GUIDE.md) | Guia de design system |
| [GTM_STRATEGY.md](docs/GTM_STRATEGY.md) | Estratégia go-to-market |
| [TESTING.md](TESTING.md) | Documentação de testes (850+ testes, 95%+ cobertura) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Diretrizes de contribuição |
| [SECURITY.md](SECURITY.md) | Política e práticas de segurança |

## Contribuindo

Contribuições são bem-vindas no Project Okinawa. Leia nosso [Guia de Contribuição](CONTRIBUTING.md) para detalhes sobre:

- Código de conduta
- Processo de desenvolvimento
- Padrões de código (semantic tokens, DTOs, padrões DI)
- Convenções de commit (Conventional Commits)
- Processo de pull request
- Estratégia de branches (main → develop → feature/*)

## Licença

Este projeto é software proprietário. Todos os direitos reservados.

Copyright (c) 2024–2026 Pedro Dini

A cópia, modificação, distribuição ou uso não autorizado deste software, por qualquer meio, é estritamente proibida sem permissão expressa por escrito do detentor dos direitos autorais.

## Suporte

Para suporte técnico ou dúvidas:

- Consulte a [documentação](docs/)
- Verifique [issues](https://github.com/pedrodini/project-okinawa/issues) existentes
- Crie uma nova issue com informações detalhadas

---

## Recent Updates / Atualizações Recentes

### Version 3.0.0 (February 2026)

**Security Hardening (Audit v3):**
- Apple JWT verification with real RSA-SHA256 cryptographic validation (JWKS)
- JWT JTI blacklisting with Redis + PostgreSQL dual-layer revocation
- All `console.log` replaced by `StructuredLoggerService` / NestJS `Logger`
- CSP hardened: removed `unsafe-inline` in production
- CI pipeline blocks on critical/high vulnerabilities
- LoggingInterceptor refactored to proper Dependency Injection
- Swagger configuration unified (removed duplication in `main.ts`)
- TracingService span export via `this.logger.log` (not `console.log`)
- Bcrypt cost factor upgraded to 12

**Segurança (Auditoria v3):**
- Verificação Apple JWT com validação criptográfica RSA-SHA256 real (JWKS)
- JWT JTI blacklisting com revogação dual-layer (Redis + PostgreSQL)
- Todos `console.log` substituídos por `StructuredLoggerService` / NestJS `Logger`
- CSP hardened: removido `unsafe-inline` em produção
- Pipeline CI bloqueia em vulnerabilidades críticas/altas
- LoggingInterceptor refatorado para Injeção de Dependência
- Configuração Swagger unificada (removida duplicação no `main.ts`)
- TracingService export de spans via `this.logger.log` (não `console.log`)
- Bcrypt cost factor atualizado para 12

### Version 2.1.0 (February 2025)

**UX Improvements / Melhorias de UX:**
- Unified Payment Screen (4 screens → 1 tabbed interface)
- Quick Actions FAB (context-aware floating button)
- Role-Adaptive Dashboard (6 staff roles)
- KDS Swipe Gestures (touch-friendly kitchen display)
- Order Payment Tracking (guest-by-guest real-time status)

---

**Version:** 3.0.0
**Last Updated:** February 2026
**Status:** Production-Ready
**Audit Score:** 8.7/10

**Versão:** 3.0.0
**Última Atualização:** Fevereiro 2026
**Status:** Production-Ready
**Score de Auditoria:** 8.7/10
